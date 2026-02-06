import { http } from '@google-cloud/functions-framework';
import { sql } from 'drizzle-orm';
import { createDb } from '@onlysnow/db';
import { resorts, resortConditions } from '@onlysnow/db';
import { logger, batchProcess } from '@onlysnow/pipeline-core';
import { createRedisClient, CacheKeys, cache } from '@onlysnow/redis';

const log = logger;

interface SnoCountryConditions {
  snowfall24h: number | null;
  snowfall48h: number | null;
  snowfall72h: number | null;
  baseDepth: number | null;
  summitDepth: number | null;
  liftsOpen: number | null;
  trailsOpen: number | null;
  surfaceCondition: string | null;
  resortStatus: string | null;
}

/**
 * Fetch resort conditions from SnoCountry API.
 * SnoCountry provides free, real-time resort conditions for most US ski areas.
 */
async function fetchConditions(resortName: string, state: string): Promise<SnoCountryConditions | null> {
  try {
    // SnoCountry API — free tier
    const url = `https://skiapp.onthesnow.com/app/widgets/resortGuide?region=${encodeURIComponent(state)}&regionType=state&lang=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      log.warn(`SnoCountry API returned ${response.status} for ${state}`);
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;

    // Match by resort name (fuzzy)
    const normalizedName = resortName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const rows = (data?.rows ?? []) as Array<Record<string, string>>;
    const match = rows.find((row) => {
      const candidateName = (row['resort_name'] ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
      return candidateName.includes(normalizedName) || normalizedName.includes(candidateName);
    });

    if (!match) return null;

    return {
      snowfall24h: parseFloat(match.snowfall_24hr) || null,
      snowfall48h: parseFloat(match.snowfall_48hr) || null,
      snowfall72h: parseFloat(match.snowfall_72hr) || null,
      baseDepth: parseInt(match.base_depth) || null,
      summitDepth: parseInt(match.summit_depth) || null,
      liftsOpen: parseInt(match.lifts_open) || null,
      trailsOpen: parseInt(match.trails_open) || null,
      surfaceCondition: match.surface_condition ?? null,
      resortStatus: match.resort_status ?? null,
    };
  } catch (error) {
    log.error(`Error fetching conditions for ${resortName}`, { error });
    return null;
  }
}

function getStateFromRegion(region: string): string {
  const lower = region.toLowerCase();
  if (lower.includes('co')) return 'CO';
  if (lower.includes('ut')) return 'UT';
  if (lower.includes('nm')) return 'NM';
  if (lower.includes('wy')) return 'WY';
  if (lower.includes('mt')) return 'MT';
  return 'CO';
}

http('conditionsRefresh', async (req, res) => {
  const startTime = Date.now();
  log.info('Starting conditions refresh');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log.error('DATABASE_URL not set');
    res.status(500).json({ error: 'DATABASE_URL not configured' });
    return;
  }

  const db = createDb(dbUrl);
  const redis = createRedisClient();

  const allResorts = await db.select().from(resorts);
  log.info(`Processing ${allResorts.length} resorts`);

  let updated = 0;
  let errors = 0;

  await batchProcess(allResorts, async (resort) => {
    const state = getStateFromRegion(resort.region);
    const conditions = await fetchConditions(resort.name, state);

    if (!conditions) {
      errors++;
      return;
    }

    await db
      .insert(resortConditions)
      .values({
        resortId: resort.id,
        snowfall24h: conditions.snowfall24h,
        snowfall48h: conditions.snowfall48h,
        snowfall72h: conditions.snowfall72h,
        baseDepth: conditions.baseDepth,
        summitDepth: conditions.summitDepth,
        liftsOpen: conditions.liftsOpen,
        trailsOpen: conditions.trailsOpen,
        surfaceCondition: conditions.surfaceCondition,
        resortStatus: conditions.resortStatus,
        source: 'snocountry',
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: resortConditions.resortId,
        set: {
          snowfall24h: conditions.snowfall24h,
          snowfall48h: conditions.snowfall48h,
          snowfall72h: conditions.snowfall72h,
          baseDepth: conditions.baseDepth,
          summitDepth: conditions.summitDepth,
          liftsOpen: conditions.liftsOpen,
          trailsOpen: conditions.trailsOpen,
          surfaceCondition: conditions.surfaceCondition,
          resortStatus: conditions.resortStatus,
          source: 'snocountry',
          updatedAt: new Date(),
        },
      });

    await cache.invalidate(redis, CacheKeys.conditions(resort.id));
    await cache.invalidate(redis, CacheKeys.resortDetail(resort.id));
    updated++;
  }, { delayMs: 300 });

  const duration = Date.now() - startTime;
  log.info('Conditions refresh complete', { updated, errors, durationMs: duration });

  res.json({ updated, errors, durationMs: duration });
});
