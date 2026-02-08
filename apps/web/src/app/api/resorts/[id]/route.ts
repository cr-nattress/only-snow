import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq, gte, sql } from 'drizzle-orm';
import {
  resorts,
  resortConditions,
  forecasts,
  snotelStations,
  snotelReadings,
  avalancheZones,
} from '@onlysnow/db';
import type { ResortDetail, DailyForecast, Freshness } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export const GET = withLogging(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numericId = parseInt(id, 10);
  const isSlug = isNaN(numericId);

  const db = getDb();
  const redis = getRedis();

  // Resolve resort by numeric ID or slug
  const [resortRow] = await db
    .select({
      resort: resorts,
      conditions: resortConditions,
    })
    .from(resorts)
    .leftJoin(resortConditions, eq(resorts.id, resortConditions.resortId))
    .where(isSlug ? eq(resorts.slug, id) : eq(resorts.id, numericId));

  if (!resortRow) {
    return NextResponse.json({ error: 'Resort not found' }, { status: 404 });
  }

  const resortId = resortRow.resort.id;
  const cacheKey = CacheKeys.resortDetail(resortId);

  const result = await cache.getOrSet<ResortDetail>(
    redis,
    cacheKey,
    CacheTTL.RESORT_DETAIL,
    async () => {
      // Fetch 10-day forecast
      const forecastRows = await db
        .select()
        .from(forecasts)
        .where(eq(forecasts.resortId, resortId))
        .orderBy(forecasts.date);

      const dailyForecasts: DailyForecast[] = forecastRows.map((f) => ({
        date: f.date,
        snowfall: f.snowfall,
        tempHigh: f.tempHigh,
        tempLow: f.tempLow,
        windSpeed: f.windSpeed,
        cloudCover: f.cloudCover,
        conditions: f.conditions,
        confidence: (f.confidence as 'high' | 'medium' | 'low') ?? 'low',
        narrative: f.forecastNarrative,
      }));

      // Fetch latest SNOTEL reading for mapped stations
      let snowpack = null;
      const stationRows = await db.select().from(snotelStations);
      for (const station of stationRows) {
        const mappings = station.resortMappings as
          | Array<{ resort_slug: string; distance_miles: number }>
          | null;
        if (!mappings) continue;
        const mapped = mappings.some(
          (m) => m.resort_slug === resortRow.resort.slug,
        );
        if (mapped) {
          const [reading] = await db
            .select()
            .from(snotelReadings)
            .where(eq(snotelReadings.stationId, station.stationId))
            .orderBy(sql`${snotelReadings.date} DESC`)
            .limit(1);
          if (reading) {
            snowpack = {
              stationName: station.name,
              swe: reading.swe,
              sweMedianPct: reading.sweMedianPct,
              snowDepth: reading.snowDepth,
              date: reading.date,
            };
          }
          break;
        }
      }

      // Fetch avalanche info (simplified — real impl would match by resort's region/location)
      let avalanche = null;
      const [zone] = await db
        .select()
        .from(avalancheZones)
        .limit(1);

      if (zone) {
        avalanche = {
          zoneName: zone.name,
          dangerRating: (zone.dangerRating as 'low' | 'moderate' | 'considerable' | 'high' | 'extreme') ?? 'low',
          forecastUrl: zone.forecastUrl,
          updatedAt: zone.updatedAt.toISOString(),
        };
      }

      const freshness: Freshness = {
        dataAgeMinutes: resortRow.conditions?.updatedAt
          ? Math.round(
              (Date.now() - new Date(resortRow.conditions.updatedAt).getTime()) / 60000,
            )
          : -1,
        source: resortRow.conditions?.source ?? 'none',
        updatedAt:
          resortRow.conditions?.updatedAt?.toISOString() ?? new Date().toISOString(),
      };

      return {
        id: resortRow.resort.id,
        name: resortRow.resort.name,
        slug: resortRow.resort.slug,
        lat: resortRow.resort.lat,
        lng: resortRow.resort.lng,
        elevationSummit: resortRow.resort.elevationSummit,
        elevationBase: resortRow.resort.elevationBase,
        region: resortRow.resort.region,
        passType: resortRow.resort.passType,
        aspect: resortRow.resort.aspect,
        terrainProfile: resortRow.resort.terrainProfile as ResortDetail['terrainProfile'],
        totalLifts: resortRow.resort.totalLifts,
        totalTrails: resortRow.resort.totalTrails,
        terrainAcres: resortRow.resort.terrainAcres,
        annualSnowfall: resortRow.resort.annualSnowfall,
        nightSkiing: resortRow.resort.nightSkiing,
        snowmakingPercent: resortRow.resort.snowmakingPercent,
        longestRun: resortRow.resort.longestRun,
        terrainParks: resortRow.resort.terrainParks,
        website: resortRow.resort.website,
        webcamUrl: resortRow.resort.webcamUrl,
        nearestAirport: resortRow.resort.nearestAirport,
        conditions: resortRow.conditions
          ? {
              snowfall24h: resortRow.conditions.snowfall24h,
              snowfall48h: resortRow.conditions.snowfall48h,
              baseDepth: resortRow.conditions.baseDepth,
              liftsOpen: resortRow.conditions.liftsOpen,
              trailsOpen: resortRow.conditions.trailsOpen,
              surfaceCondition: resortRow.conditions.surfaceCondition,
              resortStatus: resortRow.conditions.resortStatus,
            }
          : null,
        forecast: dailyForecasts,
        snowpack,
        avalanche,
        freshness,
      };
    },
  );

  return NextResponse.json(result);
});
