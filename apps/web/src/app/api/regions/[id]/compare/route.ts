import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq, sql } from 'drizzle-orm';
import { chaseRegions, resorts, resortConditions, forecasts } from '@onlysnow/db';
import type { RegionComparison, ResortComparisonRow, Freshness } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export const GET = withLogging(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const regionId = parseInt(id, 10);
  if (isNaN(regionId)) {
    return NextResponse.json({ error: 'Invalid region ID' }, { status: 400 });
  }

  const redis = getRedis();
  const cacheKey = CacheKeys.regionCompare(regionId);

  const result = await cache.getOrSet<RegionComparison>(
    redis,
    cacheKey,
    CacheTTL.REGION_COMPARE,
    async () => {
      const db = getDb();

      const [region] = await db
        .select()
        .from(chaseRegions)
        .where(eq(chaseRegions.id, regionId));

      if (!region) {
        throw new Error('NOT_FOUND');
      }

      // Get resorts in this region with conditions
      const regionResorts = await db
        .select({ resort: resorts, conditions: resortConditions })
        .from(resorts)
        .leftJoin(resortConditions, eq(resorts.id, resortConditions.resortId))
        .where(eq(resorts.chaseRegionId, regionId));

      // Get 5-day snowfall sums
      const fiveDaysOut = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
      const today = new Date().toISOString().split('T')[0];

      const snowfallSums = await db
        .select({
          resortId: forecasts.resortId,
          totalSnow: sql<number>`COALESCE(SUM(${forecasts.snowfall}), 0)`.as('total_snow'),
        })
        .from(forecasts)
        .where(sql`${forecasts.date} >= ${today} AND ${forecasts.date} <= ${fiveDaysOut}`)
        .groupBy(forecasts.resortId);

      const snowByResort = new Map(snowfallSums.map((s) => [s.resortId, s.totalSnow]));

      const comparisonResorts: ResortComparisonRow[] = regionResorts
        .map((row) => ({
          id: row.resort.id,
          name: row.resort.name,
          slug: row.resort.slug,
          passType: row.resort.passType,
          elevationSummit: row.resort.elevationSummit,
          snowfall24h: row.conditions?.snowfall24h ?? null,
          snowfall48h: row.conditions?.snowfall48h ?? null,
          snowfall5Day: snowByResort.get(row.resort.id) ?? null,
          baseDepth: row.conditions?.baseDepth ?? null,
          liftsOpen: row.conditions?.liftsOpen ?? null,
          totalLifts: row.resort.totalLifts,
          conditions: row.conditions?.surfaceCondition ?? null,
        }))
        .sort((a, b) => (b.snowfall5Day ?? 0) - (a.snowfall5Day ?? 0));

      const freshness: Freshness = {
        dataAgeMinutes: 0,
        source: 'composite',
        updatedAt: new Date().toISOString(),
      };

      return {
        regionId: region.id,
        regionName: region.name,
        resorts: comparisonResorts,
        freshness,
      };
    },
  );

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
});
