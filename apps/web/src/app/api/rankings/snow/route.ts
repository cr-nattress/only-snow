import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { resorts, resortConditions, forecasts } from '@onlysnow/db';
import type { SnowRanking, ResortSummary, Freshness } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const timeframe = (params.get('timeframe') ?? '48h') as '24h' | '48h' | '72h' | '7d';
  const region = params.get('region') ?? undefined;
  const limit = parseInt(params.get('limit') ?? '20', 10);

  const redis = getRedis();
  const cacheKey = CacheKeys.rankings(timeframe, region);

  const result = await cache.getOrSet<SnowRanking[]>(
    redis,
    cacheKey,
    CacheTTL.RANKINGS,
    async () => {
      const db = getDb();

      // For 24h/48h/72h use conditions data; for 7d use forecast sums
      if (timeframe === '7d') {
        const daysOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];

        let query = db
          .select({
            resort: resorts,
            conditions: resortConditions,
            totalSnow: sql<number>`COALESCE(SUM(${forecasts.snowfall}), 0)`.as('total_snow'),
          })
          .from(resorts)
          .leftJoin(resortConditions, eq(resorts.id, resortConditions.resortId))
          .leftJoin(forecasts, eq(resorts.id, forecasts.resortId))
          .where(sql`${forecasts.date} >= ${today} AND ${forecasts.date} <= ${daysOut}`)
          .groupBy(resorts.id, resortConditions.id)
          .orderBy(sql`total_snow DESC`)
          .limit(limit)
          .$dynamic();

        if (region) {
          query = query.where(eq(resorts.region, region));
        }

        const rows = await query;
        return rows.map((row, index) => ({
          rank: index + 1,
          resort: mapResortSummary(row.resort, row.conditions),
          snowfall: row.totalSnow,
          timeframe: '7d' as const,
        }));
      }

      // For 24h/48h/72h, use resort_conditions
      const snowColumn =
        timeframe === '24h'
          ? resortConditions.snowfall24h
          : timeframe === '48h'
            ? resortConditions.snowfall48h
            : resortConditions.snowfall72h;

      let query = db
        .select({ resort: resorts, conditions: resortConditions })
        .from(resorts)
        .innerJoin(resortConditions, eq(resorts.id, resortConditions.resortId))
        .orderBy(sql`${snowColumn} DESC NULLS LAST`)
        .limit(limit)
        .$dynamic();

      if (region) {
        query = query.where(eq(resorts.region, region));
      }

      const rows = await query;
      return rows.map((row, index) => ({
        rank: index + 1,
        resort: mapResortSummary(row.resort, row.conditions),
        snowfall:
          timeframe === '24h'
            ? row.conditions.snowfall24h ?? 0
            : timeframe === '48h'
              ? row.conditions.snowfall48h ?? 0
              : row.conditions.snowfall72h ?? 0,
        timeframe,
      }));
    },
  );

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
}

function mapResortSummary(
  resort: typeof resorts.$inferSelect,
  conditions: typeof resortConditions.$inferSelect | null,
): ResortSummary {
  const freshness: Freshness = {
    dataAgeMinutes: conditions?.updatedAt
      ? Math.round((Date.now() - new Date(conditions.updatedAt).getTime()) / 60000)
      : -1,
    source: conditions?.source ?? 'none',
    updatedAt: conditions?.updatedAt?.toISOString() ?? new Date().toISOString(),
  };

  return {
    id: resort.id,
    name: resort.name,
    slug: resort.slug,
    lat: resort.lat,
    lng: resort.lng,
    elevationSummit: resort.elevationSummit,
    elevationBase: resort.elevationBase,
    region: resort.region,
    passType: resort.passType,
    conditions: conditions
      ? {
          snowfall24h: conditions.snowfall24h,
          snowfall48h: conditions.snowfall48h,
          baseDepth: conditions.baseDepth,
          liftsOpen: conditions.liftsOpen,
          trailsOpen: conditions.trailsOpen,
          surfaceCondition: conditions.surfaceCondition,
          resortStatus: conditions.resortStatus,
        }
      : null,
    freshness,
  };
}
