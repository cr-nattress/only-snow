import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { createDb } from '@onlysnow/db';
import { snotelStations, snotelReadings } from '@onlysnow/db';
import { logger, batchProcess } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';
import { fetchSnotelData } from './index.js';

async function main() {
  const startTime = Date.now();
  console.log('=== SNOTEL Daily Pipeline (CLI) ===\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not set. Add it to .env at monorepo root.');
    process.exit(1);
  }

  const db = createDb(dbUrl);
  const redis = tryCreateRedisClient();
  if (!redis) {
    console.log('Redis not configured — skipping cache invalidation.\n');
  }

  // 1. Fetch all SNOTEL stations
  const stations = await db.select().from(snotelStations);
  console.log(`Found ${stations.length} SNOTEL stations to process.\n`);

  let updated = 0;
  let errorCount = 0;
  const today = new Date().toISOString().split('T')[0];

  // 2. Process each station with 500ms delay
  const { results } = await batchProcess(
    stations,
    async (station, index) => {
      const prefix = `[${index + 1}/${stations.length}]`;
      process.stdout.write(`${prefix} ${station.name} (${station.stationId}, ${station.state ?? '??'})...`);

      const data = await fetchSnotelData(station.stationId, station.state ?? 'CO');
      if (!data) {
        errorCount++;
        console.log(' NO DATA');
        return null;
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

      if (redis) {
        await cache.invalidate(redis, CacheKeys.snowpack(station.stationId));
      }

      updated++;
      console.log(` SWE=${data.swe ?? '-'}" depth=${data.snowDepth ?? '-'}"`);
      return data;
    },
    {
      delayMs: 500,
      onError: (station, error) => {
        errorCount++;
        console.log(` ERROR: ${error instanceof Error ? error.message : String(error)}`);
      },
    },
  );

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(1);

  console.log('\n=== Summary ===');
  console.log(`Stations updated:  ${updated}`);
  console.log(`Errors:            ${errorCount}`);
  console.log(`Duration:          ${durationSec}s`);

  process.exit(errorCount > 0 && updated === 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
