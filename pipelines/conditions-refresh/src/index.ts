import { http } from '@google-cloud/functions-framework';
import { createDb } from '@onlysnow/db';
import { resorts, resortConditions } from '@onlysnow/db';
import { logger, batchProcess } from '@onlysnow/pipeline-core';
import { tryCreateRedisClient, CacheKeys, cache } from '@onlysnow/redis';

const log = logger;

// ---------------------------------------------------------------------------
// Region → State mapping (exhaustive for all 53 regions in resorts.json)
// ---------------------------------------------------------------------------

export const REGION_TO_STATE: Record<string, string> = {
  // Colorado
  'i70-corridor': 'CO',
  'front-range': 'CO',
  'steamboat-area': 'CO',
  'aspen-area': 'CO',
  'san-juans': 'CO',
  // Utah
  'salt-lake-cottonwoods': 'UT',
  'park-city-area': 'UT',
  'ogden-area': 'UT',
  // New Mexico
  'taos-area': 'NM',
  // Wyoming
  'jackson-hole-area': 'WY',
  // Montana
  'big-sky-area': 'MT',
  // California
  'lake-tahoe': 'CA',
  'sierra-nevada': 'CA',
  'southern-california': 'CA',
  // Pacific Northwest — WA by default (OR resorts use 'pacific-northwest' too)
  'pacific-northwest': 'WA',
  // Idaho
  'sun-valley-area': 'ID',
  'northern-idaho': 'ID',
  'mccall-area': 'ID',
  'boise-area': 'ID',
  // Arizona
  'arizona': 'AZ',
  // Pennsylvania
  'poconos': 'PA',
  'laurel-highlands': 'PA',
  // Maine
  'western-maine': 'ME',
  'northern-maine': 'ME',
  'southern-maine': 'ME',
  // Connecticut / Rhode Island
  'connecticut': 'CT',
  'rhode-island': 'RI',
  // Vermont
  'central-vermont': 'VT',
  'northern-vermont': 'VT',
  'southern-vermont': 'VT',
  'northeast-kingdom': 'VT',
  // New Hampshire
  'white-mountains': 'NH',
  'lakes-region-nh': 'NH',
  // New York
  'adirondacks': 'NY',
  'catskills': 'NY',
  'western-ny': 'NY',
  'central-ny': 'NY',
  // New Jersey
  'northern-nj': 'NJ',
  // Single-state regions
  'massachusetts': 'MA',
  'michigan': 'MI',
  'wisconsin': 'WI',
  'minnesota': 'MN',
  'west-virginia': 'WV',
  'north-carolina': 'NC',
  'virginia': 'VA',
  'tennessee': 'TN',
  'maryland': 'MD',
  'indiana': 'IN',
  'iowa': 'IA',
  'ohio': 'OH',
  'missouri': 'MO',
  'alaska': 'AK',
  'nevada': 'NV',
};

// ---------------------------------------------------------------------------
// SnoCountry API types
// ---------------------------------------------------------------------------

export interface SnoCountryConditions {
  snowfall24h: number | null;
  snowfall48h: number | null;
  snowfall72h: number | null;
  baseDepth: number | null;
  summitDepth: number | null;
  liftsOpen: number | null;
  trailsOpen: number | null;
  surfaceCondition: string | null;
  resortStatus: string | null;
}

export interface SnoCountryRow {
  resort_name: string;
  snowfall_24hr: string;
  snowfall_48hr: string;
  snowfall_72hr: string;
  base_depth: string;
  summit_depth: string;
  lifts_open: string;
  trails_open: string;
  surface_condition: string;
  resort_status: string;
  [key: string]: string;
}

// ---------------------------------------------------------------------------
// API fetchers (exported for CLI reuse)
// ---------------------------------------------------------------------------

/**
 * Fetch all resort conditions for a given state from the SnoCountry API.
 * Returns the raw rows array, or null on error.
 */
export async function fetchConditionsForState(state: string): Promise<SnoCountryRow[] | null> {
  try {
    const url = `https://skiapp.onthesnow.com/app/widgets/resortGuide?region=${encodeURIComponent(state)}&regionType=state&lang=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      log.warn(`SnoCountry API returned ${response.status} for ${state}`);
      return null;
    }

    const data = (await response.json()) as Record<string, unknown>;
    return (data?.rows ?? []) as SnoCountryRow[];
  } catch (error) {
    log.error(`Error fetching conditions for state ${state}`, {
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

/**
 * Match a resort name against the SnoCountry rows for a state.
 * Uses fuzzy matching (normalized alphanumeric comparison).
 */
export function matchResortConditions(
  resortName: string,
  rows: SnoCountryRow[],
): SnoCountryConditions | null {
  const normalizedName = resortName.toLowerCase().replace(/[^a-z0-9]/g, '');

  const match = rows.find((row) => {
    const candidateName = (row.resort_name ?? '').toLowerCase().replace(/[^a-z0-9]/g, '');
    return candidateName.includes(normalizedName) || normalizedName.includes(candidateName);
  });

  if (!match) return null;

  return {
    snowfall24h: parseFloat(match.snowfall_24hr) || null,
    snowfall48h: parseFloat(match.snowfall_48hr) || null,
    snowfall72h: parseFloat(match.snowfall_72hr) || null,
    baseDepth: parseInt(match.base_depth) || null,
    summitDepth: parseInt(match.summit_depth) || null,
    liftsOpen: parseInt(match.lifts_open) || null,
    trailsOpen: parseInt(match.trails_open) || null,
    surfaceCondition: match.surface_condition ?? null,
    resortStatus: match.resort_status ?? null,
  };
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

  // Group resorts by state
  const resortsByState = new Map<string, typeof allResorts>();
  for (const resort of allResorts) {
    const state = REGION_TO_STATE[resort.region];
    if (!state) {
      log.warn(`No state mapping for region "${resort.region}"`, { resort: resort.name });
      continue;
    }
    const list = resortsByState.get(state) ?? [];
    list.push(resort);
    resortsByState.set(state, list);
  }

  let updated = 0;
  let errors = 0;

  // Fetch conditions per state (batched)
  for (const [state, stateResorts] of resortsByState) {
    const stateData = await fetchConditionsForState(state);
    if (!stateData) {
      errors += stateResorts.length;
      continue;
    }

    for (const resort of stateResorts) {
      const conditions = matchResortConditions(resort.name, stateData);
      if (!conditions) {
        errors++;
        continue;
      }

      await db
        .insert(resortConditions)
        .values({
          resortId: resort.id,
          ...conditions,
          source: 'snocountry',
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: resortConditions.resortId,
          set: {
            ...conditions,
            source: 'snocountry',
            updatedAt: new Date(),
          },
        });

      await cache.invalidate(redis, CacheKeys.conditions(resort.id));
      await cache.invalidate(redis, CacheKeys.resortDetail(resort.id));
      updated++;
    }

    // Rate-limit between state API calls
    await new Promise((r) => setTimeout(r, 300));
  }

  const duration = Date.now() - startTime;
  log.info('Conditions refresh complete', { updated, errors, durationMs: duration });

  res.json({ updated, errors, durationMs: duration });
});
