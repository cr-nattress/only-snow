import { http } from '@google-cloud/functions-framework';
import { createDb } from '@onlysnow/db';
import { snotelStations, snotelReadings } from '@onlysnow/db';
import { logger, batchProcess } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';

const log = logger;

interface SnotelData {
  swe: number | null;
  sweMedianPct: number | null;
  snowDepth: number | null;
  precipAccum: number | null;
}

/**
 * Fetch SNOTEL data from USDA AWDB (Air-Water Database Service).
 * Free public API providing daily snowpack measurements.
 */
async function fetchSnotelData(stationId: string): Promise<SnotelData | null> {
  try {
    const today = new Date().toISOString().split('T')[0];

    // USDA NRCS AWDB REST API
    const url = `https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/${stationId}:${getStateCode(stationId)}:SNTL%7Cid=%22%22%7Cname/-1,0/WTEQ::value,WTEQ::pctOfMedian_1991,SNWD::value,PREC::value`;

    const response = await fetch(url);
    if (!response.ok) {
      log.warn(`SNOTEL API returned ${response.status} for station ${stationId}`);
      return null;
    }

    const text = await response.text();
    const lines = text.split('\n').filter((l) => !l.startsWith('#') && l.trim() !== '');

    // Last data line has the most recent reading
    const lastLine = lines[lines.length - 1];
    if (!lastLine) return null;

    const parts = lastLine.split(',');
    return {
      swe: parseFloat(parts[1]) || null,
      sweMedianPct: parseFloat(parts[2]) || null,
      snowDepth: parseFloat(parts[3]) || null,
      precipAccum: parseFloat(parts[4]) || null,
    };
  } catch (error) {
    log.error(`Error fetching SNOTEL data for ${stationId}`, { error });
    return null;
  }
}

function getStateCode(stationId: string): string {
  // Station IDs typically include state code, but we'll default to CO
  // In practice, the station_id in our DB has the full triplet
  return 'CO';
}

http('snotelDaily', async (req, res) => {
  const startTime = Date.now();
  log.info('Starting SNOTEL daily refresh');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log.error('DATABASE_URL not set');
    res.status(500).json({ error: 'DATABASE_URL not configured' });
    return;
  }

  const db = createDb(dbUrl);
  const redis = tryCreateRedisClient();

  const stations = await db.select().from(snotelStations);
  log.info(`Processing ${stations.length} SNOTEL stations`);

  let updated = 0;
  let errors = 0;
  const today = new Date().toISOString().split('T')[0];

  await batchProcess(stations, async (station) => {
    const data = await fetchSnotelData(station.stationId);
    if (!data) {
      errors++;
      return;
    }

    await db
      .insert(snotelReadings)
      .values({
        stationId: station.stationId,
        date: today,
        swe: data.swe,
        sweMedianPct: data.sweMedianPct,
        snowDepth: data.snowDepth,
        precipAccum: data.precipAccum,
        updatedAt: new Date(),
      })
      .onConflictDoNothing();

    await cache.invalidate(redis, CacheKeys.snowpack(station.stationId));
    updated++;
  }, { delayMs: 500 });

  const duration = Date.now() - startTime;
  log.info('SNOTEL daily refresh complete', { updated, errors, durationMs: duration });

  res.json({ updated, errors, durationMs: duration });
});
