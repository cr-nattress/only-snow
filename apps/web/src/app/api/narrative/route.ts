import { NextRequest, NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { resorts, resortConditions, forecasts } from '@onlysnow/db';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';
import { generateDashboardNarrative, generateResortNarrative } from '@/lib/narrative';

export const dynamic = 'force-dynamic';

/**
 * GET /api/narrative?type=dashboard&region=Colorado
 * GET /api/narrative?type=resort&resortId=1
 *
 * Optional: ?persona=powder-hunter
 */
export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const type = params.get('type') ?? 'dashboard';
  const persona = params.get('persona') ?? undefined;

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { narrative: null, error: 'AI narratives not configured' },
      { status: 200 },
    );
  }

  const db = getDb();
  const redis = getRedis();

  if (type === 'resort') {
    const resortId = parseInt(params.get('resortId') ?? '', 10);
    if (isNaN(resortId)) {
      return NextResponse.json({ error: 'resortId is required' }, { status: 400 });
    }

    const cacheKey = CacheKeys.narrativeResort(resortId);
    const narrative = await cache.getOrSet<string>(
      redis,
      cacheKey,
      CacheTTL.NARRATIVE_RESORT,
      async () => {
        // Fetch full resort detail
        const [resort] = await db
          .select()
          .from(resorts)
          .where(eq(resorts.id, resortId))
          .limit(1);

        if (!resort) return 'Resort not found.';

        const [conditions] = await db
          .select()
          .from(resortConditions)
          .where(eq(resortConditions.resortId, resortId))
          .limit(1);

        const forecastRows = await db
          .select()
          .from(forecasts)
          .where(eq(forecasts.resortId, resortId))
          .orderBy(forecasts.date)
          .limit(10);

        const resortDetail: import('@onlysnow/types').ResortDetail = {
          id: resort.id,
          name: resort.name,
          slug: resort.slug,
          lat: resort.lat,
          lng: resort.lng,
          elevationSummit: resort.elevationSummit,
          elevationBase: resort.elevationBase,
          region: resort.region,
          passType: resort.passType,
          aspect: resort.aspect,
          terrainProfile: resort.terrainProfile as import('@onlysnow/types').TerrainProfile | null,
          totalLifts: resort.totalLifts,
          totalTrails: resort.totalTrails,
          terrainAcres: resort.terrainAcres,
          annualSnowfall: resort.annualSnowfall,
          nightSkiing: resort.nightSkiing,
          snowmakingPercent: resort.snowmakingPercent,
          longestRun: resort.longestRun,
          terrainParks: resort.terrainParks,
          website: resort.website,
          webcamUrl: resort.webcamUrl,
          nearestAirport: resort.nearestAirport,
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
          forecast: forecastRows.map((f) => ({
            date: f.date,
            snowfall: f.snowfall,
            tempHigh: f.tempHigh,
            tempLow: f.tempLow,
            windSpeed: f.windSpeed,
            cloudCover: f.cloudCover,
            conditions: f.conditions,
            confidence: (f.confidence ?? 'medium') as 'high' | 'medium' | 'low',
            narrative: f.forecastNarrative,
          })),
          snowpack: null,
          avalanche: null,
          freshness: { dataAgeMinutes: 0, source: 'db', updatedAt: new Date().toISOString() },
        };

        return generateResortNarrative({ resort: resortDetail, persona });
      },
    );

    return NextResponse.json({ narrative });
  }

  // Dashboard narrative
  const region = params.get('region') ?? 'Colorado';
  const cacheKey = CacheKeys.narrativeDashboard(region);

  const narrative = await cache.getOrSet<string>(
    redis,
    cacheKey,
    CacheTTL.NARRATIVE_DASHBOARD,
    async () => {
      const today = new Date().toISOString().split('T')[0];
      const fiveDaysOut = new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0];
      const tenDaysOut = new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0];

      const rows = await db
        .select({
          resort: resorts,
          conditions: resortConditions,
          snow5day: sql<number>`COALESCE(SUM(CASE WHEN ${forecasts.date} <= ${fiveDaysOut} THEN ${forecasts.snowfall} ELSE 0 END), 0)`.as('snow_5day'),
          snow10day: sql<number>`COALESCE(SUM(${forecasts.snowfall}), 0)`.as('snow_10day'),
        })
        .from(resorts)
        .leftJoin(resortConditions, eq(resorts.id, resortConditions.resortId))
        .leftJoin(forecasts, eq(resorts.id, forecasts.resortId))
        .where(sql`${resorts.region} = ${region} AND ${forecasts.date} >= ${today} AND ${forecasts.date} <= ${tenDaysOut}`)
        .groupBy(resorts.id, resortConditions.id)
        .orderBy(sql`snow_10day DESC`)
        .limit(10);

      const resortData = rows.map((row) => ({
        name: row.resort.name,
        snowfall24h: row.conditions?.snowfall24h ?? null,
        baseDepth: row.conditions?.baseDepth ?? null,
        forecast5day: row.snow5day,
        forecast10day: row.snow10day,
      }));

      return generateDashboardNarrative({ region, resorts: resortData, persona });
    },
  );

  return NextResponse.json({ narrative });
}
