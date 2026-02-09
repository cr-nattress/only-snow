/**
 * Sync step: bridges scraper data from snow_reports → resort_conditions.
 * This ensures the dashboard displays the freshest data from the scraper pipeline.
 *
 * Conversion: snow_reports stores values in cm, resort_conditions uses inches.
 * Only updates if snow_reports has fresher data than resort_conditions.
 */

import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: resolve(__dirname, '../../../.env') });

import { createDb } from '@onlysnow/db';
import { resortConditions, snowReports } from '@onlysnow/db';
import { eq, desc } from 'drizzle-orm';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';

const CM_TO_INCHES = 1 / 2.54;

function cmToInches(cm: number | null): number | null {
  if (cm == null) return null;
  return Math.round(cm * CM_TO_INCHES * 10) / 10;
}

async function main() {
  const startTime = Date.now();
  console.log('=== Sync: snow_reports → resort_conditions ===\n');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('ERROR: DATABASE_URL not set.');
    process.exit(1);
  }

  const db = createDb(dbUrl);
  const redis = tryCreateRedisClient();

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

  console.log(`Found ${latestReports.length} resorts with snow_reports data.\n`);

  if (latestReports.length === 0) {
    console.log('No data to sync. Run the scraper pipeline first.');
    process.exit(0);
  }

  // Get current resort_conditions for timestamp comparison
  const currentConditions = await db.select().from(resortConditions);
  const conditionsMap = new Map(currentConditions.map((c) => [c.resortId, c]));

  let synced = 0;
  let skipped = 0;

  for (const report of latestReports) {
    const current = conditionsMap.get(report.resortId);

    // Only update if scraper data is fresher
    if (current?.updatedAt && report.updatedAt && current.updatedAt > report.updatedAt) {
      skipped++;
      continue;
    }

    // Map open_flag to resort_status
    let resortStatus: string | null = null;
    if (report.openFlag === 1) resortStatus = 'open';
    else if (report.openFlag === 2) resortStatus = 'closed';
    else if (report.openFlag === 3) resortStatus = 'closed'; // temp closed

    const updateValues: Record<string, unknown> = {
      source: 'scraped',
      updatedAt: new Date(),
    };

    // Only set fields that have data (don't overwrite with null)
    if (report.snowfall24hCm != null) updateValues.snowfall24h = cmToInches(report.snowfall24hCm);
    if (report.snowfall48hCm != null) updateValues.snowfall48h = cmToInches(report.snowfall48hCm);
    if (report.snowfall72hCm != null) updateValues.snowfall72h = cmToInches(report.snowfall72hCm);
    if (report.depthBaseCm != null) updateValues.baseDepth = Math.round(report.depthBaseCm * CM_TO_INCHES);
    if (report.depthSummitCm != null) updateValues.summitDepth = Math.round(report.depthSummitCm * CM_TO_INCHES);
    if (report.liftsOpen != null) updateValues.liftsOpen = report.liftsOpen;
    if (report.runsOpen != null) updateValues.trailsOpen = report.runsOpen;
    if (report.surfaceDescription != null) updateValues.surfaceCondition = report.surfaceDescription;
    if (resortStatus != null) updateValues.resortStatus = resortStatus;

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

    if (redis) {
      await cache.invalidate(redis, CacheKeys.conditions(report.resortId));
      await cache.invalidate(redis, CacheKeys.resortDetail(report.resortId));
    }

    console.log(`[${synced + 1}] Resort ${report.resortId}: ${cmToInches(report.snowfall24hCm) ?? '?'}" 24h, ${Math.round((report.depthBaseCm ?? 0) * CM_TO_INCHES)}" base`);
    synced++;
  }

  const durationSec = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log('\n=== Summary ===');
  console.log(`Synced:    ${synced}`);
  console.log(`Skipped:   ${skipped} (conditions data was fresher)`);
  console.log(`Duration:  ${durationSec}s`);

  process.exit(0);
}

main().catch((err) => {
  console.error('Sync failed:', err);
  process.exit(1);
});
