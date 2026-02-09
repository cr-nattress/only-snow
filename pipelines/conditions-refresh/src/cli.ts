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
  const actionable = allResorts.filter((r) => RESORT_TO_LIFTIE[r.slug] || r.slug in RESORT_TO_TERRAIN_URL);

  console.log(`Found ${allResorts.length} resorts total`);
  console.log(`  Liftie lift data:    ${withLiftie.length} resorts`);
  console.log(`  Vail trail scraper:  ${withTrails.length} resorts`);
  console.log(`  Actionable:          ${actionable.length} resorts`);
  console.log(`  Skipped (no source): ${allResorts.length - actionable.length}\n`);

  // 2. Process each resort with at least one data source
  let liftUpdates = 0;
  let trailUpdates = 0;
  let errors = 0;

  for (let i = 0; i < actionable.length; i++) {
    const resort = actionable[i];
    const liftieSlug = RESORT_TO_LIFTIE[resort.slug];
    const hasTrailScraper = resort.slug in RESORT_TO_TERRAIN_URL;

    process.stdout.write(`[${i + 1}/${actionable.length}] ${resort.name}...`);

    // Fetch lift data from Liftie
    const liftData = liftieSlug ? await fetchLiftieConditions(liftieSlug) : null;

    // Fetch trail data from Vail Resorts scraper
    const trailData = hasTrailScraper ? await fetchTrailConditions(resort.slug) : null;

    if (!liftData && !trailData) {
      console.log(' ERROR');
      errors++;
      continue;
    }

    // Build the upsert payload with only the fields we have data for
    const conditionValues: Record<string, unknown> = {
      source: 'liftie+scraper',
      updatedAt: new Date(),
    };

    if (liftData) {
      conditionValues.liftsOpen = liftData.liftsOpen;
      conditionValues.resortStatus = liftData.resortStatus;
      liftUpdates++;
    }

    if (trailData) {
      conditionValues.trailsOpen = trailData.trailsOpen;
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
    if (liftData) parts.push(`${liftData.liftsOpen}/${liftData.liftsTotal} lifts`);
    if (trailData) parts.push(`${trailData.trailsOpen}/${trailData.trailsTotal} trails`);
    console.log(` ${parts.join(', ')}`);

    // Rate-limit: 100ms between requests (longer for scraped pages)
    const delay = hasTrailScraper ? 500 : 100;
    if (i < actionable.length - 1) {
      await new Promise((r) => setTimeout(r, delay));
    }
  }

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(1);

  console.log('\n=== Summary ===');
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
