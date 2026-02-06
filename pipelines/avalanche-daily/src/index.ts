import { http } from '@google-cloud/functions-framework';
import { createDb } from '@onlysnow/db';
import { avalancheZones } from '@onlysnow/db';
import { logger } from '@onlysnow/pipeline-core';

const log = logger;

interface AvalancheForecast {
  zoneId: string;
  name: string;
  dangerRating: string;
  dangerElevationHigh: string | null;
  dangerElevationMiddle: string | null;
  dangerElevationLow: string | null;
  forecastUrl: string | null;
}

/**
 * Fetch avalanche forecasts from avalanche.org API.
 * Free public API providing danger ratings by zone.
 */
async function fetchAvalancheForecasts(): Promise<AvalancheForecast[]> {
  const results: AvalancheForecast[] = [];

  // avalanche.org provides a public API for avalanche center forecasts
  const centers = [
    { id: 'CAIC', name: 'Colorado Avalanche Information Center' },
    { id: 'UAC', name: 'Utah Avalanche Center' },
    { id: 'GNFAC', name: 'Gallatin National Forest Avalanche Center' },
    { id: 'BTAC', name: 'Bridger-Teton Avalanche Center' },
    { id: 'TAOS', name: 'Taos Avalanche Center' },
  ];

  for (const center of centers) {
    try {
      const url = `https://api.avalanche.org/v2/public/products?avalanche_center_id=${center.id}&type=forecast`;
      const response = await fetch(url);

      if (!response.ok) {
        log.warn(`avalanche.org API returned ${response.status} for ${center.id}`);
        continue;
      }

      const data = (await response.json()) as Array<Record<string, unknown>>;

      for (const product of data ?? []) {
        const zones = (product.forecast_zone ?? []) as Array<Record<string, string>>;
        const danger = (product.danger ?? []) as Array<Record<string, number>>;

        for (const zone of zones) {
          const dangerLevels = danger[0] ?? {};
          results.push({
            zoneId: `${center.id}-${zone.id}`,
            name: zone.name ?? `${center.name} Zone`,
            dangerRating: mapDangerLevel(dangerLevels.upper ?? 0),
            dangerElevationHigh: mapDangerLevel(dangerLevels.upper ?? 0),
            dangerElevationMiddle: mapDangerLevel(dangerLevels.middle ?? 0),
            dangerElevationLow: mapDangerLevel(dangerLevels.lower ?? 0),
            forecastUrl: (product.url as string) ?? null,
          });
        }
      }
    } catch (error) {
      log.error(`Error fetching avalanche data for ${center.id}`, { error });
    }
  }

  return results;
}

function mapDangerLevel(level: number): string {
  switch (level) {
    case 1: return 'low';
    case 2: return 'moderate';
    case 3: return 'considerable';
    case 4: return 'high';
    case 5: return 'extreme';
    default: return 'low';
  }
}

http('avalancheDaily', async (req, res) => {
  const startTime = Date.now();
  log.info('Starting avalanche daily refresh');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log.error('DATABASE_URL not set');
    res.status(500).json({ error: 'DATABASE_URL not configured' });
    return;
  }

  const db = createDb(dbUrl);

  const forecasts = await fetchAvalancheForecasts();
  log.info(`Fetched ${forecasts.length} avalanche zone forecasts`);

  let updated = 0;
  let errors = 0;

  for (const forecast of forecasts) {
    try {
      await db
        .insert(avalancheZones)
        .values({
          zoneId: forecast.zoneId,
          name: forecast.name,
          dangerRating: forecast.dangerRating,
          dangerElevationHigh: forecast.dangerElevationHigh,
          dangerElevationMiddle: forecast.dangerElevationMiddle,
          dangerElevationLow: forecast.dangerElevationLow,
          source: 'avalanche.org',
          forecastUrl: forecast.forecastUrl,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: avalancheZones.zoneId,
          set: {
            name: forecast.name,
            dangerRating: forecast.dangerRating,
            dangerElevationHigh: forecast.dangerElevationHigh,
            dangerElevationMiddle: forecast.dangerElevationMiddle,
            dangerElevationLow: forecast.dangerElevationLow,
            source: 'avalanche.org',
            forecastUrl: forecast.forecastUrl,
            updatedAt: new Date(),
          },
        });
      updated++;
    } catch (error) {
      log.error(`Error upserting zone ${forecast.zoneId}`, { error });
      errors++;
    }
  }

  const duration = Date.now() - startTime;
  log.info('Avalanche daily refresh complete', { updated, errors, durationMs: duration });

  res.json({ updated, errors, durationMs: duration });
});
