import { http } from '@google-cloud/functions-framework';
import { logger } from '@onlysnow/pipeline-core';
import { createRedisClient, CacheKeys, CacheTTL, cache } from '@onlysnow/redis';

const log = logger;

interface RoadCondition {
  route: string;
  status: 'open' | 'closed' | 'chain-law' | 'traction-law' | 'unknown';
  description: string | null;
  updatedAt: string;
}

// Key Colorado mountain corridors
const MONITORED_ROUTES = [
  { id: 'i70-eisenhower', name: 'I-70 Eisenhower Tunnel' },
  { id: 'i70-vail-pass', name: 'I-70 Vail Pass' },
  { id: 'i70-glenwood', name: 'I-70 Glenwood Canyon' },
  { id: 'us-40-berthoud', name: 'US-40 Berthoud Pass' },
  { id: 'co-91-fremont', name: 'CO-91 Fremont Pass' },
  { id: 'i-80-parley', name: 'I-80 Parleys Canyon (UT)' },
  { id: 'sr-210-cottonwood', name: 'SR-210 Little Cottonwood Canyon (UT)' },
  { id: 'sr-190-big-cottonwood', name: 'SR-190 Big Cottonwood Canyon (UT)' },
  { id: 'wy-22-teton-pass', name: 'WY-22 Teton Pass' },
];

/**
 * Fetch road conditions from CDOT COtrip API.
 * COtrip provides road condition data for Colorado highways.
 */
async function fetchCDOTConditions(): Promise<Map<string, RoadCondition>> {
  const results = new Map<string, RoadCondition>();

  try {
    // COtrip provides road conditions via their API
    const url = 'https://www.cotrip.org/speed/getSegments.do?format=json';
    const response = await fetch(url);

    if (!response.ok) {
      log.warn(`COtrip API returned ${response.status}`);
      return results;
    }

    const data = (await response.json()) as Record<string, unknown>;
    const speedDetails = data?.SpeedDetails as Record<string, unknown> | undefined;
    const segments = (speedDetails?.Segment ?? []) as Array<Record<string, string>>;

    for (const segment of segments) {
      const roadName = segment.RoadName ?? '';
      const conditions = segment.RoadCondition ?? '';

      // Match to monitored routes
      for (const route of MONITORED_ROUTES) {
        if (matchRoute(roadName, route.id)) {
          const status = parseConditionStatus(conditions);
          results.set(route.id, {
            route: route.id,
            status,
            description: `${route.name}: ${conditions || 'No current alerts'}`,
            updatedAt: new Date().toISOString(),
          });
        }
      }
    }
  } catch (error) {
    log.error('Error fetching CDOT conditions', { error });
  }

  return results;
}

function matchRoute(roadName: string, routeId: string): boolean {
  const lower = roadName.toLowerCase();
  if (routeId.includes('i70') && lower.includes('i-70')) return true;
  if (routeId.includes('us-40') && lower.includes('us 40')) return true;
  if (routeId.includes('co-91') && lower.includes('co 91')) return true;
  return false;
}

function parseConditionStatus(condition: string): RoadCondition['status'] {
  const lower = (condition ?? '').toLowerCase();
  if (lower.includes('closed')) return 'closed';
  if (lower.includes('chain law')) return 'chain-law';
  if (lower.includes('traction')) return 'traction-law';
  if (lower.includes('open') || lower.includes('dry') || lower.includes('clear')) return 'open';
  return 'unknown';
}

http('roadConditions', async (req, res) => {
  const startTime = Date.now();
  log.info('Starting road conditions refresh');

  const redis = createRedisClient();

  const conditions = await fetchCDOTConditions();

  // Also set defaults for unmatched routes
  for (const route of MONITORED_ROUTES) {
    if (!conditions.has(route.id)) {
      conditions.set(route.id, {
        route: route.id,
        status: 'unknown',
        description: `${route.name}: No data available`,
        updatedAt: new Date().toISOString(),
      });
    }
  }

  let updated = 0;
  for (const [routeId, condition] of conditions) {
    await cache.set(redis, CacheKeys.roadConditions(routeId), condition, CacheTTL.ROAD_CONDITIONS);
    updated++;
  }

  const duration = Date.now() - startTime;
  log.info('Road conditions refresh complete', { updated, durationMs: duration });

  res.json({ updated, durationMs: duration });
});
