import { http } from '@google-cloud/functions-framework';
import { eq } from 'drizzle-orm';
import { createDb } from '@onlysnow/db';
import { resorts, driveTimes } from '@onlysnow/db';
import { logger, batchProcess } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';

const log = logger;

// ── Origin cities ───────────────────────────────────────────────────
// Major metro areas near ski regions. Expand as needed.

interface OriginCity {
  name: string;
  lat: number;
  lng: number;
}

const ORIGIN_CITIES: OriginCity[] = [
  { name: 'Denver, CO', lat: 39.7392, lng: -104.9903 },
  { name: 'Salt Lake City, UT', lat: 40.7608, lng: -111.891 },
  { name: 'Reno, NV', lat: 39.5296, lng: -119.8138 },
  { name: 'Seattle, WA', lat: 47.6062, lng: -122.3321 },
  { name: 'Portland, OR', lat: 45.5152, lng: -122.6784 },
  { name: 'Boise, ID', lat: 43.615, lng: -116.2023 },
  { name: 'Albuquerque, NM', lat: 35.0844, lng: -106.6504 },
  { name: 'Los Angeles, CA', lat: 34.0522, lng: -118.2437 },
  { name: 'San Francisco, CA', lat: 37.7749, lng: -122.4194 },
  { name: 'Phoenix, AZ', lat: 33.4484, lng: -112.074 },
];

// ── Google Maps Distance Matrix API ─────────────────────────────────

interface DistanceResult {
  durationMinutes: number;
  distanceMiles: number;
}

/**
 * Fetch drive times from Google Maps Distance Matrix API.
 * Batches: max 25 origins x 25 destinations per request.
 */
async function fetchDriveTimes(
  origin: OriginCity,
  destinations: Array<{ id: number; lat: number; lng: number }>,
  apiKey: string,
): Promise<Map<number, DistanceResult>> {
  const results = new Map<number, DistanceResult>();

  // Distance Matrix API allows up to 25 destinations per call
  const batchSize = 25;
  for (let i = 0; i < destinations.length; i += batchSize) {
    const batch = destinations.slice(i, i + batchSize);
    const destStr = batch.map((d) => `${d.lat},${d.lng}`).join('|');

    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${origin.lat},${origin.lng}&destinations=${destStr}&units=imperial&key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      log.warn(`Distance Matrix API returned ${response.status} for ${origin.name}`, {
        status: response.status,
      });
      continue;
    }

    const data = (await response.json()) as {
      status: string;
      rows?: Array<{
        elements: Array<{
          status: string;
          duration: { value: number };
          distance: { value: number };
        }>;
      }>;
    };

    if (data.status !== 'OK') {
      log.warn(`Distance Matrix API error for ${origin.name}`, { status: data.status });
      continue;
    }

    const elements = data.rows?.[0]?.elements ?? [];
    for (let j = 0; j < elements.length; j++) {
      const el = elements[j];
      if (el.status !== 'OK') continue;

      const resortId = batch[j].id;
      results.set(resortId, {
        durationMinutes: Math.round(el.duration.value / 60),
        distanceMiles: Math.round(el.distance.value / 1609.34 * 10) / 10,
      });
    }
  }

  return results;
}

// ── Cloud Function handler ──────────────────────────────────────────

http('driveTimesRefresh', async (req, res) => {
  const startTime = Date.now();
  log.info('Starting drive times refresh');

  const dbUrl = process.env.DATABASE_URL;
  const apiKey = process.env.GOOGLE_MAPS_API_KEY;

  if (!dbUrl) {
    log.error('DATABASE_URL not set');
    res.status(500).json({ error: 'DATABASE_URL not configured' });
    return;
  }

  if (!apiKey) {
    log.error('GOOGLE_MAPS_API_KEY not set');
    res.status(500).json({ error: 'GOOGLE_MAPS_API_KEY not configured' });
    return;
  }

  const db = createDb(dbUrl);
  const redis = tryCreateRedisClient();

  // Fetch all resorts
  const allResorts = await db.select().from(resorts);
  log.info(`Processing ${allResorts.length} resorts across ${ORIGIN_CITIES.length} origin cities`);

  const destinations = allResorts.map((r) => ({ id: r.id, lat: r.lat, lng: r.lng }));

  let updated = 0;
  let errors = 0;

  // Process each origin city
  await batchProcess(ORIGIN_CITIES, async (origin) => {
    log.info(`Fetching drive times from ${origin.name}`);

    const results = await fetchDriveTimes(origin, destinations, apiKey);

    for (const [resortId, result] of results) {
      await db
        .insert(driveTimes)
        .values({
          originCity: origin.name,
          originLat: origin.lat,
          originLng: origin.lng,
          resortId,
          durationMinutes: result.durationMinutes,
          distanceMiles: result.distanceMiles,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: [driveTimes.originCity, driveTimes.resortId],
          set: {
            durationMinutes: result.durationMinutes,
            distanceMiles: result.distanceMiles,
            updatedAt: new Date(),
          },
        });
      updated++;
    }

    // Invalidate cache for this origin city
    await cache.invalidate(redis, CacheKeys.driveTimes(origin.name));
  }, { delayMs: 1000 }); // 1s delay between origin cities for rate limiting

  const duration = Date.now() - startTime;
  log.info('Drive times refresh complete', { updated, errors, durationMs: duration });

  res.json({
    updated,
    errors,
    originCities: ORIGIN_CITIES.length,
    resorts: allResorts.length,
    durationMs: duration,
  });
});
