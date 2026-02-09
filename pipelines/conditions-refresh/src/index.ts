import { http } from '@google-cloud/functions-framework';
import { createDb } from '@onlysnow/db';
import { resorts, resortConditions } from '@onlysnow/db';
import { eq } from 'drizzle-orm';
import { logger } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';
import { RESORT_TO_LIFTIE } from './liftie-mapping.js';
import { fetchTrailConditions, RESORT_TO_TERRAIN_URL } from './vail-resorts-scraper.js';
import { fetchObservedSnowfall } from './open-meteo-observed.js';
import { syncSnowReports } from './sync-snow-reports.js';

const log = logger;

// ---------------------------------------------------------------------------
// Liftie API types
// ---------------------------------------------------------------------------

export interface LiftieResponse {
  id: string;
  name: string;
  lifts: {
    status: Record<string, 'open' | 'closed' | 'scheduled' | 'hold'>;
    stats: {
      open: number;
      hold: number;
      scheduled: number;
      closed: number;
      percentage: {
        open: number;
        hold: number;
        scheduled: number;
        closed: number;
      };
    };
  };
  weather?: {
    conditions?: string;
    temperature?: { max: number };
  };
}

export interface LiftConditions {
  liftsOpen: number;
  liftsTotal: number;
  resortStatus: 'open' | 'closed';
}

// ---------------------------------------------------------------------------
// API fetcher (exported for CLI reuse)
// ---------------------------------------------------------------------------

/**
 * Fetch lift status for a resort from the Liftie API.
 * Returns parsed conditions, or null on error.
 */
export async function fetchLiftieConditions(liftieSlug: string): Promise<LiftConditions | null> {
  try {
    const url = `https://liftie.info/api/resort/${encodeURIComponent(liftieSlug)}`;
    const response = await fetch(url);

    if (!response.ok) {
      log.warn(`Liftie API returned ${response.status} for ${liftieSlug}`);
      return null;
    }

    const data = (await response.json()) as LiftieResponse;
    const stats = data.lifts?.stats;
    if (!stats) {
      log.warn(`No lift stats in Liftie response for ${liftieSlug}`);
      return null;
    }

    const liftsOpen = stats.open ?? 0;
    const liftsTotal = (stats.open ?? 0) + (stats.hold ?? 0) + (stats.scheduled ?? 0) + (stats.closed ?? 0);

    return {
      liftsOpen,
      liftsTotal,
      resortStatus: liftsOpen > 0 ? 'open' : 'closed',
    };
  } catch (error) {
    log.error(`Error fetching Liftie data for ${liftieSlug}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

// ---------------------------------------------------------------------------
// Google Cloud Function HTTP handler (kept for GCF deployment)
// ---------------------------------------------------------------------------

http('conditionsRefresh', async (req, res) => {
  const startTime = Date.now();
  log.info('Starting conditions refresh');

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    log.error('DATABASE_URL not set');
    res.status(500).json({ error: 'DATABASE_URL not configured' });
    return;
  }

  const db = createDb(dbUrl);
  const redis = tryCreateRedisClient();

  const allResorts = await db.select().from(resorts);
  log.info(`Processing ${allResorts.length} resorts`);

  let snowfallUpdates = 0;
  let liftUpdates = 0;
  let trailUpdates = 0;
  let errors = 0;

  for (const resort of allResorts) {
    const liftieSlug = RESORT_TO_LIFTIE[resort.slug];
    const hasTrailScraper = resort.slug in RESORT_TO_TERRAIN_URL;

    // Fetch all data sources in parallel
    const [snowData, liftData, trailData] = await Promise.all([
      fetchObservedSnowfall(resort.lat, resort.lng, resort.elevationSummit),
      liftieSlug ? fetchLiftieConditions(liftieSlug) : Promise.resolve(null),
      hasTrailScraper ? fetchTrailConditions(resort.slug) : Promise.resolve(null),
    ]);

    if (!snowData && !liftData && !trailData) {
      errors++;
      continue;
    }

    // Build the upsert payload with only the fields we have data for
    const conditionValues: Record<string, unknown> = {
      updatedAt: new Date(),
    };

    if (snowData) {
      conditionValues.snowfall24h = snowData.snowfall24h;
      conditionValues.snowfall48h = snowData.snowfall48h;
      conditionValues.snowfall72h = snowData.snowfall72h;
      conditionValues.source = 'open-meteo';
      snowfallUpdates++;
    }

    if (liftData) {
      conditionValues.liftsOpen = liftData.liftsOpen;
      conditionValues.resortStatus = liftData.resortStatus;
      conditionValues.source = snowData ? 'open-meteo+liftie' : 'liftie';
      liftUpdates++;
    }

    if (trailData) {
      conditionValues.trailsOpen = trailData.trailsOpen;
      conditionValues.source = (conditionValues.source || '') + '+scraper';
      trailUpdates++;
    }

    await db
      .insert(resortConditions)
      .values({
        resortId: resort.id,
        ...conditionValues,
      })
      .onConflictDoUpdate({
        target: resortConditions.resortId,
        set: conditionValues,
      });

    // Update static totals on the resorts table if they changed
    const resortUpdates: Record<string, unknown> = {};
    if (liftData && liftData.liftsTotal > 0 && liftData.liftsTotal !== resort.totalLifts) {
      resortUpdates.totalLifts = liftData.liftsTotal;
    }
    if (trailData && trailData.trailsTotal > 0 && trailData.trailsTotal !== resort.totalTrails) {
      resortUpdates.totalTrails = trailData.trailsTotal;
    }
    if (Object.keys(resortUpdates).length > 0) {
      resortUpdates.updatedAt = new Date();
      await db.update(resorts).set(resortUpdates).where(eq(resorts.id, resort.id));
    }

    await cache.invalidate(redis, CacheKeys.conditions(resort.id));
    await cache.invalidate(redis, CacheKeys.resortDetail(resort.id));

    // Rate-limit: 200ms between resorts (Open-Meteo allows 600/min)
    await new Promise((r) => setTimeout(r, 200));
  }

  // Sync scraped data (baseDepth, summitDepth, surfaceCondition) from snow_reports
  const syncResult = await syncSnowReports(db, redis, { invalidate: cache.invalidate, keys: CacheKeys });
  log.info('Snow reports sync', { synced: syncResult.synced, skipped: syncResult.skipped });

  const duration = Date.now() - startTime;
  log.info('Conditions refresh complete', { snowfallUpdates, liftUpdates, trailUpdates, errors, syncedFromScraper: syncResult.synced, durationMs: duration });

  res.json({ snowfallUpdates, liftUpdates, trailUpdates, errors, syncedFromScraper: syncResult.synced, durationMs: duration });
});
