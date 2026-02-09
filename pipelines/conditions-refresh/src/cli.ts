import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { createDb } from '@onlysnow/db';
import { resorts, resortConditions } from '@onlysnow/db';
import { eq } from 'drizzle-orm';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';
import { RESORT_TO_LIFTIE } from './liftie-mapping.js';
import { fetchLiftieConditions } from './index.js';
import { fetchTrailConditions, RESORT_TO_TERRAIN_URL } from './vail-resorts-scraper.js';
import { fetchObservedSnowfall } from './open-meteo-observed.js';

async function main() {
  const startTime = Date.now();
  console.log('=== Conditions Refresh Pipeline ===\n');

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
  const withLiftie = allResorts.filter((r) => RESORT_TO_LIFTIE[r.slug]);
  const withTrails = allResorts.filter((r) => r.slug in RESORT_TO_TERRAIN_URL);

  console.log(`Found ${allResorts.length} resorts total`);
  console.log(`  Open-Meteo snowfall: ${allResorts.length} resorts (all)`);
  console.log(`  Liftie lift data:    ${withLiftie.length} resorts`);
  console.log(`  Vail trail scraper:  ${withTrails.length} resorts\n`);

  // 2. Process ALL resorts (every resort gets snowfall data)
  let snowfallUpdates = 0;
  let liftUpdates = 0;
  let trailUpdates = 0;
  let errors = 0;

  for (let i = 0; i < allResorts.length; i++) {
    const resort = allResorts[i];
    const liftieSlug = RESORT_TO_LIFTIE[resort.slug];
    const hasTrailScraper = resort.slug in RESORT_TO_TERRAIN_URL;

    process.stdout.write(`[${i + 1}/${allResorts.length}] ${resort.name}...`);

    // Fetch all data sources in parallel
    const [snowData, liftData, trailData] = await Promise.all([
      fetchObservedSnowfall(resort.lat, resort.lng, resort.elevationSummit),
      liftieSlug ? fetchLiftieConditions(liftieSlug) : Promise.resolve(null),
      hasTrailScraper ? fetchTrailConditions(resort.slug) : Promise.resolve(null),
    ]);

    if (!snowData && !liftData && !trailData) {
      console.log(' ERROR');
      errors++;
      continue;
    }

    // Build the upsert payload
    const conditionValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (snowData) {
      conditionValues.snowfall24h = snowData.snowfall24h;
      conditionValues.snowfall48h = snowData.snowfall48h;
      conditionValues.snowfall72h = snowData.snowfall72h;
      conditionValues.source = 'open-meteo';
      snowfallUpdates++;
    }

    if (liftData) {
      conditionValues.liftsOpen = liftData.liftsOpen;
      conditionValues.resortStatus = liftData.resortStatus;
      conditionValues.source = snowData ? 'open-meteo+liftie' : 'liftie';
      liftUpdates++;
    }

    if (trailData) {
      conditionValues.trailsOpen = trailData.trailsOpen;
      conditionValues.source = (conditionValues.source || '') + '+scraper';
      trailUpdates++;
    }

    await db
      .insert(resortConditions)
      .values({
        resortId: resort.id,
        ...conditionValues,
      })
      .onConflictDoUpdate({
        target: resortConditions.resortId,
        set: conditionValues,
      });

    // Update static totals on the resorts table if they changed
    const resortUpdates: Record<string, unknown> = {};
    if (liftData && liftData.liftsTotal > 0 && liftData.liftsTotal !== resort.totalLifts) {
      resortUpdates.totalLifts = liftData.liftsTotal;
    }
    if (trailData && trailData.trailsTotal > 0 && trailData.trailsTotal !== resort.totalTrails) {
      resortUpdates.totalTrails = trailData.trailsTotal;
    }
    if (Object.keys(resortUpdates).length > 0) {
      resortUpdates.updatedAt = new Date();
      await db.update(resorts).set(resortUpdates).where(eq(resorts.id, resort.id));
    }

    if (redis) {
      await cache.invalidate(redis, CacheKeys.conditions(resort.id));
      await cache.invalidate(redis, CacheKeys.resortDetail(resort.id));
    }

    // Build output line
    const parts: string[] = [];
    if (snowData) {
      const snow = snowData.snowfall24h > 0 ? `${snowData.snowfall24h}"` : '0"';
      parts.push(`${snow} 24h (${snowData.snowfall48h}" 48h, ${snowData.snowfall72h}" 72h)`);
    }
    if (liftData) parts.push(`${liftData.liftsOpen}/${liftData.liftsTotal} lifts`);
    if (trailData) parts.push(`${trailData.trailsOpen}/${trailData.trailsTotal} trails`);
    console.log(` ${parts.join(', ')}`);

    // Rate-limit: 200ms (Open-Meteo allows 600/min, trail scraper needs more)
    const delay = hasTrailScraper ? 500 : 200;
    if (i < allResorts.length - 1) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(1);

  console.log('\n=== Summary ===');
  console.log(`Snowfall updates:   ${snowfallUpdates}`);
  console.log(`Lift updates:       ${liftUpdates}`);
  console.log(`Trail updates:      ${trailUpdates}`);
  console.log(`Errors:             ${errors}`);
  console.log(`Duration:           ${durationSec}s`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
