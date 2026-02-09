import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq, sql } from 'drizzle-orm';
import { chaseRegions, resorts, forecasts, driveTimes } from '@onlysnow/db';
import type { RegionSummary } from '@onlysnow/types';
import { CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export const GET = withLogging(async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get('lat') ?? '');
  const lng = parseFloat(params.get('lng') ?? '');
  const hasLocation = !isNaN(lat) && !isNaN(lng);

  const redis = getRedis();

  // Find nearest origin city if location provided (used for drive time enrichment)
  let originCity: string | null = null;
  if (hasLocation) {
    const db = getDb();
    const nearestOrigin = await db
      .selectDistinct({ originCity: driveTimes.originCity })
      .from(driveTimes)
      .orderBy(
        sql`(${driveTimes.originLat} - ${lat}) * (${driveTimes.originLat} - ${lat}) + (${driveTimes.originLng} - ${lng}) * (${driveTimes.originLng} - ${lng})`,
      )
      .limit(1);
    if (nearestOrigin.length > 0) {
      originCity = nearestOrigin[0].originCity;
    }
  }

  const cacheKey = originCity
    ? `onlysnow:regions:${originCity}`
    : 'onlysnow:regions:all';

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

      // Look up drive times from nearest origin city to all resorts
      const driveByResort = new Map<number, number>();
      if (originCity) {
        const driveRows = await db
          .select({
            resortId: driveTimes.resortId,
            durationMinutes: driveTimes.durationMinutes,
          })
          .from(driveTimes)
          .where(eq(driveTimes.originCity, originCity));

        for (const row of driveRows) {
          driveByResort.set(row.resortId, row.durationMinutes);
        }
      }

      return regions.map((region) => {
        const regionResorts = allResorts.filter((r) => r.chaseRegionId === region.id);
        let bestResort: RegionSummary['bestResort'] = null;
        let totalSnowfall5Day = 0;

        // Compute minimum drive time and collect pass types among resorts in this region
        let minDriveMinutes: number | null = null;
        const passTypesSet = new Set<string>();
        for (const resort of regionResorts) {
          const snow = snowByResort.get(resort.id) ?? 0;
          totalSnowfall5Day += snow;
          if (!bestResort || snow > bestResort.snowfall5Day) {
            bestResort = { name: resort.name, slug: resort.slug, snowfall5Day: snow };
          }
          const drive = driveByResort.get(resort.id);
          if (drive != null && (minDriveMinutes == null || drive < minDriveMinutes)) {
            minDriveMinutes = drive;
          }
          if (resort.passType) {
            passTypesSet.add(resort.passType);
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
          driveMinutes: minDriveMinutes,
          passTypes: Array.from(passTypesSet),
        };
      });
    },
  );

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
});
