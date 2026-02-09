import { http } from '@google-cloud/functions-framework';
import { createDb } from '@onlysnow/db';
import { resorts, forecasts, forecastHourly } from '@onlysnow/db/schema';
import { logger, batchProcess, delay } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';
import { fetchOpenMeteoForecast } from './open-meteo.js';
import { transformForecast } from './transform.js';
import { validateForecastData } from './validate.js';
import { eq } from 'drizzle-orm';

http('forecastRefresh', async (req, res) => {
  const startTime = Date.now();
  logger.info('Starting forecast refresh pipeline');

  const db = createDb(process.env.DATABASE_URL!);
  const redis = tryCreateRedisClient();

  try {
    // 1. Fetch all resorts
    const allResorts = await db.select().from(resorts);
    logger.info('Fetched resorts from database', { count: allResorts.length });

    let rowsUpserted = 0;
    let errorCount = 0;

    // 2. Process each resort with 200ms delay between calls
    const { results, errors } = await batchProcess(
      allResorts,
      async (resort, index) => {
        logger.info(`Processing resort ${index + 1}/${allResorts.length}`, {
          resort: resort.name,
          resortId: resort.id,
        });

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
                precipProbability: day.precipProbability,
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

        // Invalidate cache for this resort
        await cache.invalidate(redis, CacheKeys.forecast(resort.id));
        await cache.invalidate(redis, CacheKeys.forecastHourly(resort.id));
        await cache.invalidate(redis, CacheKeys.resortDetail(resort.id));

        return { resortId: resort.id, dailyCount: validDaily.length, hourlyCount: hourly.length };
      },
      {
        delayMs: 200,
        onError: (resort, error) => {
          errorCount++;
          logger.error('Failed to process resort', {
            resort: resort.name,
            resortId: resort.id,
            error: error instanceof Error ? error.message : String(error),
          });
        },
      },
    );

    // Invalidate regional caches
    await cache.invalidate(redis, CacheKeys.chaseAlerts());

    const durationMs = Date.now() - startTime;
    logger.info('Forecast refresh pipeline completed', {
      resortsProcessed: results.length,
      rowsUpserted,
      errors: errorCount,
      durationMs,
    });

    res.status(200).json({
      status: 'ok',
      resortsProcessed: results.length,
      rowsUpserted,
      errors: errorCount,
      durationMs,
    });
  } catch (error) {
    const durationMs = Date.now() - startTime;
    logger.error('Forecast refresh pipeline failed', {
      error: error instanceof Error ? error.message : String(error),
      durationMs,
    });
    res.status(500).json({ status: 'error', message: 'Pipeline failed' });
  }
});
