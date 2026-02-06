import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { resorts, driveTimes } from '@onlysnow/db';
import type { DriveTime } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

/**
 * GET /api/drive-times?lat=...&lng=...
 *
 * Returns drive times from the nearest pre-computed origin city to all resorts.
 * Optionally filter by resortId: /api/drive-times?lat=...&lng=...&resortId=123
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const lat = parseFloat(params.get('lat') ?? '');
  const lng = parseFloat(params.get('lng') ?? '');
  const resortId = params.get('resortId') ? parseInt(params.get('resortId')!, 10) : undefined;

  if (isNaN(lat) || isNaN(lng)) {
    return NextResponse.json(
      { error: 'lat and lng query parameters are required' },
      { status: 400 },
    );
  }

  const db = getDb();
  const redis = getRedis();

  // Find the nearest origin city by haversine distance
  const nearestOrigin = await db
    .selectDistinct({ originCity: driveTimes.originCity })
    .from(driveTimes)
    .orderBy(
      sql`(${driveTimes.originLat} - ${lat}) * (${driveTimes.originLat} - ${lat}) + (${driveTimes.originLng} - ${lng}) * (${driveTimes.originLng} - ${lng})`,
    )
    .limit(1);

  if (nearestOrigin.length === 0) {
    return NextResponse.json(
      { error: 'No drive time data available. Run the drive-times pipeline first.' },
      { status: 404 },
    );
  }

  const originCity = nearestOrigin[0].originCity;
  const cacheKey = CacheKeys.driveTimes(originCity);

  const result = await cache.getOrSet<DriveTime[]>(
    redis,
    cacheKey,
    CacheTTL.DRIVE_TIMES,
    async () => {
      let query = db
        .select({
          resortId: driveTimes.resortId,
          resortName: resorts.name,
          durationMinutes: driveTimes.durationMinutes,
          distanceMiles: driveTimes.distanceMiles,
        })
        .from(driveTimes)
        .innerJoin(resorts, eq(driveTimes.resortId, resorts.id))
        .where(eq(driveTimes.originCity, originCity))
        .orderBy(driveTimes.durationMinutes)
        .$dynamic();

      if (resortId) {
        query = query.where(eq(driveTimes.resortId, resortId));
      }

      return query;
    },
  );

  return NextResponse.json(
    { originCity, driveTimes: result },
    { headers: { 'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=3600' } },
  );
}
