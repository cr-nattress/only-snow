import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq, sql } from 'drizzle-orm';
import { resorts, resortConditions } from '@onlysnow/db';
import type { ResortSummary, Freshness } from '@onlysnow/types';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export const GET = withLogging(async function GET(request: NextRequest) {
  const db = getDb();
  const params = request.nextUrl.searchParams;

  const region = params.get('region');
  const passType = params.get('passType');
  const lat = params.get('lat');
  const lng = params.get('lng');
  const radiusMiles = params.get('radiusMiles');

  let query = db
    .select({
      resort: resorts,
      conditions: resortConditions,
    })
    .from(resorts)
    .leftJoin(resortConditions, eq(resorts.id, resortConditions.resortId))
    .$dynamic();

  const conditions = [];

  if (region) {
    conditions.push(eq(resorts.region, region));
  }

  if (passType) {
    conditions.push(eq(resorts.passType, passType));
  }

  if (conditions.length > 0) {
    for (const cond of conditions) {
      query = query.where(cond);
    }
  }

  const rows = await query;

  // If lat/lng/radius provided, filter by distance in-app
  // (PostGIS ST_DWithin would be better but we're using real columns not geometry)
  let filtered = rows;
  if (lat && lng && radiusMiles) {
    const centerLat = parseFloat(lat);
    const centerLng = parseFloat(lng);
    const radius = parseFloat(radiusMiles);

    filtered = rows.filter((row) => {
      const dLat = row.resort.lat - centerLat;
      const dLng = row.resort.lng - centerLng;
      // Approximate miles from degrees (rough, good enough for filtering)
      const distMiles = Math.sqrt(dLat * dLat + dLng * dLng) * 69;
      return distMiles <= radius;
    });
  }

  const results: ResortSummary[] = filtered.map((row) => {
    const freshness: Freshness = {
      dataAgeMinutes: row.conditions?.updatedAt
        ? Math.round((Date.now() - new Date(row.conditions.updatedAt).getTime()) / 60000)
        : -1,
      source: row.conditions?.source ?? 'none',
      updatedAt: row.conditions?.updatedAt?.toISOString() ?? new Date().toISOString(),
    };

    return {
      id: row.resort.id,
      name: row.resort.name,
      slug: row.resort.slug,
      lat: row.resort.lat,
      lng: row.resort.lng,
      elevationSummit: row.resort.elevationSummit,
      elevationBase: row.resort.elevationBase,
      region: row.resort.region,
      passType: row.resort.passType,
      conditions: row.conditions
        ? {
            snowfall24h: row.conditions.snowfall24h,
            snowfall48h: row.conditions.snowfall48h,
            baseDepth: row.conditions.baseDepth,
            liftsOpen: row.conditions.liftsOpen,
            trailsOpen: row.conditions.trailsOpen,
            surfaceCondition: row.conditions.surfaceCondition,
            resortStatus: row.conditions.resortStatus,
          }
        : null,
      freshness,
    };
  });

  return NextResponse.json(results, {
    headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
  });
});
