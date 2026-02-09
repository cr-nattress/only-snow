/**
 * Sync step: bridges scraper data from snow_reports → resort_conditions.
 * This ensures the dashboard displays the freshest data from the scraper pipeline.
 *
 * Conversion: snow_reports stores values in cm, resort_conditions uses inches.
 * Only updates fields that have data (won't overwrite real-time data with null).
 */

import { resortConditions, snowReports } from '@onlysnow/db';
import { desc } from 'drizzle-orm';

const CM_TO_INCHES = 1 / 2.54;

function cmToInches(cm: number | null): number | null {
  if (cm == null) return null;
  return Math.round(cm * CM_TO_INCHES * 10) / 10;
}

export interface SyncResult {
  synced: number;
  skipped: number;
}

interface CacheUtils<R = any> { // eslint-disable-line @typescript-eslint/no-explicit-any
  invalidate: (redis: R, key: string) => Promise<void>;
  keys: { conditions: (id: number) => string; resortDetail: (id: number) => string };
}

/**
 * Sync scraper data from snow_reports → resort_conditions.
 * Populates baseDepth, summitDepth, surfaceCondition, and other scraped fields.
 */
export async function syncSnowReports<R = any>( // eslint-disable-line @typescript-eslint/no-explicit-any
  db: any, // eslint-disable-line @typescript-eslint/no-explicit-any
  redis: R,
  cacheUtils?: CacheUtils<R>,
): Promise<SyncResult> {
  // Get the latest snow_report per resort (DISTINCT ON resort_id, ordered by date desc)
  const latestReports = await db
    .selectDistinctOn([snowReports.resortId], {
      resortId: snowReports.resortId,
      reportDate: snowReports.reportDate,
      snowfall24hCm: snowReports.snowfall24hCm,
      snowfall48hCm: snowReports.snowfall48hCm,
      snowfall72hCm: snowReports.snowfall72hCm,
      depthBaseCm: snowReports.depthBaseCm,
      depthSummitCm: snowReports.depthSummitCm,
      liftsOpen: snowReports.liftsOpen,
      runsOpen: snowReports.runsOpen,
      surfaceDescription: snowReports.surfaceDescription,
      openFlag: snowReports.openFlag,
      updatedAt: snowReports.updatedAt,
    })
    .from(snowReports)
    .orderBy(snowReports.resortId, desc(snowReports.reportDate), desc(snowReports.updatedAt));

  if (latestReports.length === 0) {
    return { synced: 0, skipped: 0 };
  }

  // Get current resort_conditions for timestamp comparison
  const currentConditions = await db.select().from(resortConditions);
  type ConditionRow = typeof currentConditions[number];
  const conditionsMap = new Map<number, ConditionRow>(
    currentConditions.map((c: ConditionRow) => [c.resortId, c]),
  );

  let synced = 0;
  let skipped = 0;

  for (const report of latestReports) {
    const current = conditionsMap.get(report.resortId);

    // Only update scraped fields — don't overwrite if conditions-refresh already ran
    // We always merge scraped depth/surface data since conditions-refresh doesn't provide these
    const updateValues: Record<string, unknown> = {};

    // These fields are ONLY available from scraper — always set if we have data
    if (report.depthBaseCm != null) updateValues.baseDepth = Math.round(report.depthBaseCm * CM_TO_INCHES);
    if (report.depthSummitCm != null) updateValues.summitDepth = Math.round(report.depthSummitCm * CM_TO_INCHES);
    if (report.surfaceDescription != null) updateValues.surfaceCondition = report.surfaceDescription;

    // These fields overlap with conditions-refresh — only set if conditions-refresh hasn't provided them
    if (!current || current.snowfall24h == null) {
      if (report.snowfall24hCm != null) updateValues.snowfall24h = cmToInches(report.snowfall24hCm);
      if (report.snowfall48hCm != null) updateValues.snowfall48h = cmToInches(report.snowfall48hCm);
      if (report.snowfall72hCm != null) updateValues.snowfall72h = cmToInches(report.snowfall72hCm);
    }
    if (!current || current.liftsOpen == null) {
      if (report.liftsOpen != null) updateValues.liftsOpen = report.liftsOpen;
    }
    if (!current || current.trailsOpen == null) {
      if (report.runsOpen != null) updateValues.trailsOpen = report.runsOpen;
    }
    if (!current || current.resortStatus == null) {
      if (report.openFlag === 1) updateValues.resortStatus = 'open';
      else if (report.openFlag === 2 || report.openFlag === 3) updateValues.resortStatus = 'closed';
    }

    // Skip if nothing to update
    if (Object.keys(updateValues).length === 0) {
      skipped++;
      continue;
    }

    updateValues.updatedAt = new Date();

    await db
      .insert(resortConditions)
      .values({
        resortId: report.resortId,
        ...updateValues,
      })
      .onConflictDoUpdate({
        target: resortConditions.resortId,
        set: updateValues,
      });

    if (redis && cacheUtils) {
      await cacheUtils.invalidate(redis, cacheUtils.keys.conditions(report.resortId));
      await cacheUtils.invalidate(redis, cacheUtils.keys.resortDetail(report.resortId));
    }

    synced++;
  }

  return { synced, skipped };
}

// ---------------------------------------------------------------------------
// Standalone CLI entry point
// ---------------------------------------------------------------------------

if (process.argv[1] && (process.argv[1].endsWith('sync-snow-reports.ts') || process.argv[1].endsWith('sync-snow-reports.js'))) {
  const { resolve, dirname } = await import('path');
  const { fileURLToPath } = await import('url');
  const { config } = await import('dotenv');

  const __dirname = dirname(fileURLToPath(import.meta.url));
  config({ path: resolve(__dirname, '../../../.env') });

  const { createDb } = await import('@onlysnow/db');
  const { tryCreateRedisClient, CacheKeys, cache } = await import('@onlysnow/redis');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not set.');
    process.exit(1);
  }

  const startTime = Date.now();
  console.log('=== Sync: snow_reports → resort_conditions ===\n');

  const db = createDb(dbUrl);
  const redis = tryCreateRedisClient();

  const result = await syncSnowReports(db, redis, { invalidate: cache.invalidate, keys: CacheKeys });

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`Synced:    ${result.synced}`);
  console.log(`Skipped:   ${result.skipped}`);
  console.log(`Duration:  ${durationSec}s`);

  process.exit(0);
}
