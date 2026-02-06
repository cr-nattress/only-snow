import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { forecasts, forecastHourly, resorts } from '@onlysnow/db';
import type { ForecastResponse, DailyForecast, HourlyForecast, Freshness } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const resortId = parseInt(id, 10);
  if (isNaN(resortId)) {
    return NextResponse.json({ error: 'Invalid resort ID' }, { status: 400 });
  }

  const redis = getRedis();
  const cacheKey = CacheKeys.forecast(resortId);

  const result = await cache.getOrSet<ForecastResponse>(
    redis,
    cacheKey,
    CacheTTL.FORECAST,
    async () => {
      const db = getDb();

      // Verify resort exists
      const [resort] = await db
        .select({ id: resorts.id })
        .from(resorts)
        .where(eq(resorts.id, resortId));

      if (!resort) {
        throw new Error('NOT_FOUND');
      }

      // Fetch daily forecasts
      const dailyRows = await db
        .select()
        .from(forecasts)
        .where(eq(forecasts.resortId, resortId))
        .orderBy(forecasts.date);

      const daily: DailyForecast[] = dailyRows.map((f) => ({
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

      // Fetch hourly forecasts
      const hourlyRows = await db
        .select()
        .from(forecastHourly)
        .where(eq(forecastHourly.resortId, resortId))
        .orderBy(forecastHourly.datetime);

      const hourly: HourlyForecast[] = hourlyRows.map((h) => ({
        datetime: h.datetime.toISOString(),
        temperature: h.temperature,
        snowfall: h.snowfall,
        precipitation: h.precipitation,
        windSpeed: h.windSpeed,
        windDirection: h.windDirection,
        cloudCover: h.cloudCover,
        freezingLevel: h.freezingLevel,
      }));

      const latestUpdate = dailyRows.length > 0 ? dailyRows[0].updatedAt : new Date();
      const freshness: Freshness = {
        dataAgeMinutes: Math.round(
          (Date.now() - new Date(latestUpdate).getTime()) / 60000,
        ),
        source: dailyRows[0]?.source ?? 'open-meteo',
        updatedAt: new Date(latestUpdate).toISOString(),
      };

      return { resortId, daily, hourly, freshness };
    },
  );

  return NextResponse.json(result);
}
