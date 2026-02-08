import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq, sql } from 'drizzle-orm';
import { chaseRegions, resorts, forecasts } from '@onlysnow/db';
import type { RegionSummary } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export const GET = withLogging(async function GET() {
  const redis = getRedis();
  const cacheKey = 'onlysnow:regions:all';

  const result = await cache.getOrSet<RegionSummary[]>(
    redis,
    cacheKey,
    CacheTTL.REGION_COMPARE,
    async () => {
      const db = getDb();

      const regions = await db.select().from(chaseRegions);
      const allResorts = await db.select().from(resorts);

      // Get 5-day snowfall sums per resort
      const today = new Date().toISOString().split('T')[0];
      const fiveDaysOut = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];

      const snowfallSums = await db
        .select({
          resortId: forecasts.resortId,
          totalSnow: sql<number>`COALESCE(SUM(${forecasts.snowfall}), 0)`.as('total_snow'),
        })
        .from(forecasts)
        .where(sql`${forecasts.date} >= ${today} AND ${forecasts.date} <= ${fiveDaysOut}`)
        .groupBy(forecasts.resortId);

      const snowByResort = new Map(snowfallSums.map((s) => [s.resortId, s.totalSnow]));

      return regions.map((region) => {
        const regionResorts = allResorts.filter((r) => r.chaseRegionId === region.id);
        let bestResort: RegionSummary['bestResort'] = null;
        let totalSnowfall5Day = 0;

        for (const resort of regionResorts) {
          const snow = snowByResort.get(resort.id) ?? 0;
          totalSnowfall5Day += snow;
          if (!bestResort || snow > bestResort.snowfall5Day) {
            bestResort = { name: resort.name, slug: resort.slug, snowfall5Day: snow };
          }
        }

        let stormSeverity: RegionSummary['stormSeverity'] = 'none';
        const avgSnow = regionResorts.length > 0 ? totalSnowfall5Day / regionResorts.length : 0;
        if (avgSnow >= 24) stormSeverity = 'epic';
        else if (avgSnow >= 12) stormSeverity = 'heavy';
        else if (avgSnow >= 6) stormSeverity = 'moderate';
        else if (avgSnow >= 2) stormSeverity = 'light';

        return {
          id: region.id,
          name: region.name,
          lat: region.lat,
          lng: region.lng,
          bestAirport: region.bestAirport,
          resortCount: regionResorts.length,
          totalSnowfall5Day,
          bestResort,
          stormSeverity,
        };
      });
    },
  );

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
});
