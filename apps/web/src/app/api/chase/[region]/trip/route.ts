import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { eq, sql } from 'drizzle-orm';
import { chaseRegions, resorts, forecasts } from '@onlysnow/db';
import type { TripEstimate } from '@onlysnow/types';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getDb } from '@/lib/db';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

// Rough cost estimates by region (would be replaced by real affiliate/pricing data)
const COST_ESTIMATES: Record<string, { flight: [number, number]; lodging: [number, number]; lift: number }> = {
  'co': { flight: [15000, 40000], lodging: [15000, 35000], lift: 20000 },
  'ut': { flight: [15000, 40000], lodging: [12000, 30000], lift: 18000 },
  'wy': { flight: [20000, 50000], lodging: [18000, 40000], lift: 17500 },
  'mt': { flight: [20000, 55000], lodging: [15000, 35000], lift: 12000 },
  'nm': { flight: [15000, 35000], lodging: [10000, 25000], lift: 11000 },
};

function getRegionCode(regionName: string): string {
  const name = regionName.toLowerCase();
  if (name.includes('colorado') || name.includes('i-70') || name.includes('steamboat') || name.includes('aspen') || name.includes('san juan') || name.includes('front range')) return 'co';
  if (name.includes('salt lake') || name.includes('park city') || name.includes('ogden') || name.includes('utah')) return 'ut';
  if (name.includes('jackson') || name.includes('wyoming')) return 'wy';
  if (name.includes('big sky') || name.includes('montana')) return 'mt';
  if (name.includes('taos') || name.includes('new mexico')) return 'nm';
  return 'co';
}

export const GET = withLogging(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ region: string }> },
) {
  const { region: regionIdStr } = await params;
  const regionId = parseInt(regionIdStr, 10);
  if (isNaN(regionId)) {
    return NextResponse.json({ error: 'Invalid region ID' }, { status: 400 });
  }

  const db = getDb();
  const redis = getRedis();

  const [region] = await db
    .select()
    .from(chaseRegions)
    .where(eq(chaseRegions.id, regionId));

  if (!region) {
    return NextResponse.json({ error: 'Region not found' }, { status: 404 });
  }

  const cacheKey = CacheKeys.chaseTripPlan(regionId);

  const estimate = await cache.getOrSet<TripEstimate | null>(
    redis,
    cacheKey,
    CacheTTL.CHASE_TRIP_PLAN,
    async () => {
      // Find best resort by upcoming snowfall
      const today = new Date().toISOString().split('T')[0];
      const sevenDaysOut = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];

      const regionResorts = await db
        .select()
        .from(resorts)
        .where(eq(resorts.chaseRegionId, regionId));

      const snowSums = await db
        .select({
          resortId: forecasts.resortId,
          totalSnow: sql<number>`COALESCE(SUM(${forecasts.snowfall}), 0)`.as('total_snow'),
        })
        .from(forecasts)
        .where(sql`${forecasts.date} >= ${today} AND ${forecasts.date} <= ${sevenDaysOut}`)
        .groupBy(forecasts.resortId);

      const snowByResort = new Map(snowSums.map((s) => [s.resortId, s.totalSnow]));

      let bestResort = regionResorts[0];
      let bestSnow = 0;
      for (const resort of regionResorts) {
        const snow = snowByResort.get(resort.id) ?? 0;
        if (snow > bestSnow) {
          bestSnow = snow;
          bestResort = resort;
        }
      }

      if (!bestResort) return null;

      const code = getRegionCode(region.name);
      const costs = COST_ESTIMATES[code] ?? COST_ESTIMATES['co'];
      const airport = region.bestAirport ?? 'DEN';

      return {
        regionId: region.id,
        regionName: region.name,
        resortName: bestResort.name,
        flightEstimate: { lowCents: costs.flight[0], highCents: costs.flight[1] },
        lodgingEstimate: { lowCents: costs.lodging[0], highCents: costs.lodging[1] },
        liftTicketCents: costs.lift,
        totalEstimate: {
          lowCents: costs.flight[0] + costs.lodging[0] + costs.lift,
          highCents: costs.flight[1] + costs.lodging[1] + costs.lift,
        },
        affiliateLinks: {
          flights: `https://www.skyscanner.com/transport/flights/?destination=${airport}`,
          lodging: `https://www.booking.com/searchresults.html?ss=${encodeURIComponent(bestResort.name)}`,
        },
      };
    },
  );

  if (!estimate) {
    return NextResponse.json({ error: 'No resorts in region' }, { status: 404 });
  }

  return NextResponse.json(estimate, {
    headers: { 'Cache-Control': 'public, s-maxage=1800, stale-while-revalidate=300' },
  });
});
