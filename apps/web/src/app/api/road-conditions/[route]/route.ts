import { NextRequest, NextResponse } from 'next/server';
import { withLogging } from '@/lib/api-logger';
import { CacheKeys, CacheTTL, cache } from '@onlysnow/redis';
import { getRedis } from '@/lib/redis';

export const dynamic = 'force-dynamic';

interface RoadCondition {
  route: string;
  status: 'open' | 'closed' | 'chain-law' | 'traction-law' | 'unknown';
  description: string | null;
  updatedAt: string;
}

export const GET = withLogging(async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ route: string }> },
) {
  const { route } = await params;

  const redis = getRedis();
  const cacheKey = CacheKeys.roadConditions(route);

  // Road conditions are populated by the road-conditions pipeline
  // This endpoint reads from cache (written by pipeline) or returns defaults
  const cached = await cache.get<RoadCondition>(redis, cacheKey);

  if (cached) {
    return NextResponse.json(cached, {
      headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=60' },
    });
  }

  // No data available yet — return unknown status
  const result: RoadCondition = {
    route,
    status: 'unknown',
    description: 'Road condition data not yet available. Data is refreshed by the road-conditions pipeline.',
    updatedAt: new Date().toISOString(),
  };

  return NextResponse.json(result, {
    headers: { 'Cache-Control': 'public, s-maxage=60' },
  });
});
