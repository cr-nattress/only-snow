import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env from monorepo root
config({ path: resolve(__dirname, '../../../.env') });

import { createDb } from '@onlysnow/db';
import { resorts, resortConditions } from '@onlysnow/db';
import { logger } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';
import { REGION_TO_STATE, fetchConditionsForState, matchResortConditions } from './index.js';

async function main() {
  const startTime = Date.now();
  console.log('=== Conditions Refresh Pipeline (CLI) ===\n');

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

  // 2. Group resorts by state (derived from region)
  const resortsByState = new Map<string, typeof allResorts>();
  let unmappedCount = 0;

  for (const resort of allResorts) {
    const state = REGION_TO_STATE[resort.region];
    if (!state) {
      unmappedCount++;
      console.log(`  WARN: No state mapping for region "${resort.region}" (${resort.name})`);
      continue;
    }
    const list = resortsByState.get(state) ?? [];
    list.push(resort);
    resortsByState.set(state, list);
  }

  console.log(`Mapped to ${resortsByState.size} unique states (${unmappedCount} unmapped)\n`);

  // 3. Fetch conditions per state (instead of per resort — much fewer API calls)
  let updated = 0;
  let noMatch = 0;
  let apiErrors = 0;
  const stateEntries = Array.from(resortsByState.entries());

  for (let i = 0; i < stateEntries.length; i++) {
    const [state, stateResorts] = stateEntries[i];
    process.stdout.write(`[${i + 1}/${stateEntries.length}] Fetching ${state} (${stateResorts.length} resorts)...`);

    const stateData = await fetchConditionsForState(state);
    if (!stateData) {
      console.log(' API ERROR');
      apiErrors++;
      continue;
    }

    console.log(` ${stateData.length} resorts from API`);

    // Match each resort against the cached state data
    for (const resort of stateResorts) {
      const conditions = matchResortConditions(resort.name, stateData);
      if (!conditions) {
        noMatch++;
        continue;
      }

      await db
        .insert(resortConditions)
        .values({
          resortId: resort.id,
          ...conditions,
          source: 'snocountry',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: resortConditions.resortId,
          set: {
            ...conditions,
            source: 'snocountry',
            updatedAt: new Date(),
          },
        });

      if (redis) {
        await cache.invalidate(redis, CacheKeys.conditions(resort.id));
        await cache.invalidate(redis, CacheKeys.resortDetail(resort.id));
      }
      updated++;
    }

    // Rate-limit between state API calls
    if (i < stateEntries.length - 1) {
      await new Promise((r) => setTimeout(r, 300));
    }
  }

  const durationMs = Date.now() - startTime;
  const durationSec = (durationMs / 1000).toFixed(1);

  console.log('\n=== Summary ===');
  console.log(`Resorts updated:   ${updated}`);
  console.log(`No match found:    ${noMatch}`);
  console.log(`API errors:        ${apiErrors}`);
  console.log(`Unmapped regions:  ${unmappedCount}`);
  console.log(`Duration:          ${durationSec}s`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Pipeline failed:', err);
  process.exit(1);
});
