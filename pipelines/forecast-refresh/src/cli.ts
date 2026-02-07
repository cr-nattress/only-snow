import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { createDb } from '@onlysnow/db';
import { resorts, forecasts, forecastHourly } from '@onlysnow/db/schema';
import { logger, batchProcess } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';
import { fetchOpenMeteoForecast } from './open-meteo.js';
import { transformForecast } from './transform.js';
import { validateForecastData } from './validate.js';

async function main() {
  const startTime = Date.now();
  console.log('=== Forecast Refresh Pipeline (CLI) ===\n');

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

  // 1. Fetch all resorts
  const allResorts = await db.select().from(resorts);
  console.log(`Found ${allResorts.length} resorts to process.\n`);

  let rowsUpserted = 0;
  let errorCount = 0;

  // 2. Process each resort with 200ms delay between API calls
  const { results, errors } = await batchProcess(
    allResorts,
    async (resort, index) => {
      const prefix = `[${index + 1}/${allResorts.length}]`;
      process.stdout.write(`${prefix} ${resort.name}...`);

      // Fetch from Open-Meteo (elevation must be in meters)
      const rawForecast = await fetchOpenMeteoForecast({
        lat: resort.lat,
        lng: resort.lng,
        elevation: Math.round(resort.elevationSummit * 0.3048),
      });

      // Transform to our schema
      const { daily, hourly } = transformForecast(resort.id, rawForecast);

      // Validate
      const validDaily = daily.filter((d) => {
        const errors = validateForecastData(d);
        if (errors.length > 0) {
          logger.warn('Validation failed for daily forecast', {
            resort: resort.name,
            date: d.date,
            errors: errors.map((e) => e.message),
          });
        }
        return errors.length === 0;
      });

      // Upsert daily forecasts
      for (const day of validDaily) {
        await db
          .insert(forecasts)
          .values(day)
          .onConflictDoUpdate({
            target: [forecasts.resortId, forecasts.date],
            set: {
              snowfall: day.snowfall,
              tempHigh: day.tempHigh,
              tempLow: day.tempLow,
              windSpeed: day.windSpeed,
              cloudCover: day.cloudCover,
              conditions: day.conditions,
              confidence: day.confidence,
              freezingLevel: day.freezingLevel,
              updatedAt: new Date(),
            },
          });
        rowsUpserted++;
      }

      // Upsert hourly forecasts
      for (const hour of hourly) {
        await db
          .insert(forecastHourly)
          .values(hour)
          .onConflictDoUpdate({
            target: [forecastHourly.resortId, forecastHourly.datetime],
            set: {
              temperature: hour.temperature,
              snowfall: hour.snowfall,
              precipitation: hour.precipitation,
              windSpeed: hour.windSpeed,
              windDirection: hour.windDirection,
              cloudCover: hour.cloudCover,
              freezingLevel: hour.freezingLevel,
              updatedAt: new Date(),
            },
          });
        rowsUpserted++;
      }

      // Invalidate cache (graceful if no Redis)
      if (redis) {
        await cache.invalidate(redis, CacheKeys.forecast(resort.id));
        await cache.invalidate(redis, CacheKeys.forecastHourly(resort.id));
        await cache.invalidate(redis, CacheKeys.resortDetail(resort.id));
      }

      console.log(` ${validDaily.length} daily, ${hourly.length} hourly`);
      return { resortId: resort.id, dailyCount: validDaily.length, hourlyCount: hourly.length };
    },
    {
      delayMs: 200,
      onError: (resort, error) => {
        errorCount++;
        console.log(` ERROR: ${error instanceof Error ? error.message : String(error)}`);
      },
    },
  );

  // Invalidate regional cache
  if (redis) {
    await cache.invalidate(redis, CacheKeys.chaseAlerts());
  }

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(1);

  console.log('\n=== Summary ===');
  console.log(`Resorts processed: ${results.length}`);
  console.log(`Rows upserted:     ${rowsUpserted}`);
  console.log(`Errors:            ${errorCount}`);
  console.log(`Duration:          ${durationSec}s`);

  process.exit(errorCount > 0 && results.length === 0 ? 1 : 0);
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
