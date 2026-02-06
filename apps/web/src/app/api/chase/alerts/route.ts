import { NextResponse } from 'next/server';
import { eq, sql } from 'drizzle-orm';
import { chaseRegions, resorts, forecasts } from '@onlysnow/db';
import type { ChaseAlert } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

const CHASE_THRESHOLD_INCHES = 6;

export async function GET() {
  const redis = getRedis();
  const cacheKey = CacheKeys.chaseAlerts();

  const result = await cache.getOrSet<ChaseAlert[]>(
    redis,
    cacheKey,
    CacheTTL.CHASE_ALERTS,
    async () => {
      const db = getDb();

      const regions = await db.select().from(chaseRegions);
      const allResorts = await db.select().from(resorts);

      const today = new Date().toISOString().split('T')[0];
      const sevenDaysOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      // Get snowfall per resort per day for next 7 days
      const forecastRows = await db
        .select({
          resortId: forecasts.resortId,
          date: forecasts.date,
          snowfall: forecasts.snowfall,
          confidence: forecasts.confidence,
        })
        .from(forecasts)
        .where(sql`${forecasts.date} >= ${today} AND ${forecasts.date} <= ${sevenDaysOut}`);

      // Group by resort
      const snowByResort = new Map<number, { total: number; byDay: { date: string; snowfall: number }[] }>();
      for (const row of forecastRows) {
        const existing = snowByResort.get(row.resortId) ?? { total: 0, byDay: [] };
        const snow = row.snowfall ?? 0;
        existing.total += snow;
        if (snow > 0) {
          existing.byDay.push({ date: row.date, snowfall: snow });
        }
        snowByResort.set(row.resortId, existing);
      }

      const alerts: ChaseAlert[] = [];

      for (const region of regions) {
        const regionResorts = allResorts.filter((r) => r.chaseRegionId === region.id);
        if (regionResorts.length === 0) continue;

        // Find best resort by total snowfall
        let bestResort = regionResorts[0];
        let bestSnow = 0;
        let allPeakDays = new Set<string>();

        for (const resort of regionResorts) {
          const data = snowByResort.get(resort.id);
          if (data && data.total > bestSnow) {
            bestSnow = data.total;
            bestResort = resort;
          }
          if (data) {
            for (const day of data.byDay) {
              if (day.snowfall >= 3) {
                allPeakDays.add(day.date);
              }
            }
          }
        }

        if (bestSnow >= CHASE_THRESHOLD_INCHES) {
          // Determine confidence based on when peak snow falls
          const bestData = snowByResort.get(bestResort.id);
          const peakDays = bestData?.byDay
            .sort((a, b) => b.snowfall - a.snowfall)
            .map((d) => d.date) ?? [];

          let confidence: 'high' | 'medium' | 'low' = 'low';
          if (peakDays.length > 0) {
            const firstPeakDate = new Date(peakDays[0]);
            const daysUntilPeak = Math.round((firstPeakDate.getTime() - Date.now()) / 86400000);
            if (daysUntilPeak <= 3) confidence = 'high';
            else if (daysUntilPeak <= 5) confidence = 'medium';
          }

          alerts.push({
            regionId: region.id,
            regionName: region.name,
            bestAirport: region.bestAirport,
            expectedSnowfall: Math.round(bestSnow * 10) / 10,
            bestResort: bestResort.name,
            bestResortSlug: bestResort.slug,
            peakDays: Array.from(allPeakDays).sort(),
            confidence,
          });
        }
      }

      // Sort by expected snowfall descending
      return alerts.sort((a, b) => b.expectedSnowfall - a.expectedSnowfall);
    },
  );

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' },
  });
}
