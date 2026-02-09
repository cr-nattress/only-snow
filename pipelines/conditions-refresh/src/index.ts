import { http } from '@google-cloud/functions-framework';
import { createDb } from '@onlysnow/db';
import { resorts, resortConditions } from '@onlysnow/db';
import { eq } from 'drizzle-orm';
import { logger } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';
import { RESORT_TO_LIFTIE } from './liftie-mapping.js';
import { fetchTrailConditions, RESORT_TO_TERRAIN_URL } from './vail-resorts-scraper.js';

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

  let liftUpdates = 0;
  let trailUpdates = 0;
  let skipped = 0;
  let errors = 0;

  for (const resort of allResorts) {
    const liftieSlug = RESORT_TO_LIFTIE[resort.slug];
    const hasTrailScraper = resort.slug in RESORT_TO_TERRAIN_URL;

    if (!liftieSlug && !hasTrailScraper) {
      skipped++;
      continue;
    }

    // Fetch lift data from Liftie
    const liftData = liftieSlug ? await fetchLiftieConditions(liftieSlug) : null;

    // Fetch trail data from Vail Resorts scraper
    const trailData = hasTrailScraper ? await fetchTrailConditions(resort.slug) : null;

    if (!liftData && !trailData) {
      errors++;
      continue;
    }

    // Build the upsert payload with only the fields we have data for
    const conditionValues: Record<string, unknown> = {
      source: 'liftie+scraper',
      updatedAt: new Date(),
    };

    if (liftData) {
      conditionValues.liftsOpen = liftData.liftsOpen;
      conditionValues.resortStatus = liftData.resortStatus;
      liftUpdates++;
    }

    if (trailData) {
      conditionValues.trailsOpen = trailData.trailsOpen;
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

    // Rate-limit: 100ms between requests
    await new Promise((r) => setTimeout(r, 100));
  }

  const duration = Date.now() - startTime;
  log.info('Conditions refresh complete', { liftUpdates, trailUpdates, skipped, errors, durationMs: duration });

  res.json({ liftUpdates, trailUpdates, skipped, errors, durationMs: duration });
});
