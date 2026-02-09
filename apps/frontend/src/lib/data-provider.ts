/**
 * Data provider — abstracts data source behind a unified API.
 *
 * When NEXT_PUBLIC_DATA_SOURCE=mock (default), returns hardcoded scenario data.
 * When NEXT_PUBLIC_DATA_SOURCE=api, fetches from the backend via OnlySnowApiClient.
 */

import { OnlySnowApiClient } from '@onlysnow/api-client';
import type {
  ResortConditions,
  StormTrackerState,
  ChaseRegion,
  Recommendation,
} from '@/data/types';
import type { MapResort } from '@/components/ResortMap';
import {
  toResortConditions,
  toResortForecasts,
  toStormTracker,
  toChaseRegions,
  toFrontendResort,
} from './adapters';

import { API_BASE_URL, isApiMode } from './api-config';

// ── Configuration ───────────────────────────────────────────────────

let _client: OnlySnowApiClient | null = null;

function getClient(): OnlySnowApiClient {
  if (!_client) {
    _client = new OnlySnowApiClient({ baseUrl: API_BASE_URL });
  }
  return _client;
}

// ── Dashboard data ──────────────────────────────────────────────────

export interface DashboardData {
  resorts: ResortConditions[];
  stormTracker: StormTrackerState;
  recommendation: Recommendation;
  mapResorts: MapResort[];
  aiAnalysis?: string;
  contextBanner?: string;
  dateLabel: string;
}

export interface DashboardFilters {
  lat?: number;
  lng?: number;
  radiusMiles?: number;
  passType?: string;
}

export async function fetchDashboardData(filters?: DashboardFilters): Promise<DashboardData> {
  if (!isApiMode()) {
    throw new Error('fetchDashboardData should not be called in mock mode');
  }

  const client = getClient();

  // Fetch resorts, chase alerts, rankings, and regions in parallel
  const [resortSummaries, chaseAlerts, rankings, regionSummaries] = await Promise.all([
    client.getResorts(filters),
    client.getChaseAlerts(),
    client.getSnowRankings(),
    client.getRegions(),
  ]);

  // Build a snowfall lookup from rankings (slug → snowfall)
  const snowfallBySlug = new Map<string, number>();
  for (const r of rankings) {
    snowfallBySlug.set(r.resort.slug, r.snowfall);
  }

  // Convert resort summaries to frontend types
  const resorts: ResortConditions[] = resortSummaries.map((s) => {
    const snowfall = snowfallBySlug.get(s.slug) ?? 0;
    const forecasts = toResortForecasts(snowfall);
    return toResortConditions(s, forecasts);
  });

  // Sort by forecast (highest first)
  resorts.sort((a, b) => b.forecasts['10day'].sort - a.forecasts['10day'].sort);

  // Build storm tracker from chase alerts (prefer nearby alerts when user location available)
  const regionCoords = new Map<number, { lat: number; lng: number }>();
  for (const r of regionSummaries) {
    regionCoords.set(r.id, { lat: r.lat, lng: r.lng });
  }
  const stormTracker = toStormTracker(chaseAlerts, regionCoords, filters?.lat, filters?.lng);

  // Build recommendation from top resorts
  const top = resorts[0];
  const recommendation: Recommendation = {
    onPass: top
      ? `${top.resort.name} — ${top.forecasts['10day'].display} forecast. Highest snow on your pass.`
      : 'Check back when new forecasts are available.',
  };

  // Build map data
  const mapResorts: MapResort[] = resorts.map((rc) => ({
    id: rc.resort.id,
    name: rc.resort.name,
    lat: rc.resort.lat,
    lng: rc.resort.lng,
    snowfallTotal: rc.forecasts['10day'].sort,
    snowfallDisplay: rc.forecasts['10day'].display,
  }));

  // Date label
  const now = new Date();
  const end = new Date(now);
  end.setDate(end.getDate() + 10);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  const dateLabel = `Next 10 Days · ${fmt(now)}-${fmt(end)}`;

  return {
    resorts,
    stormTracker,
    recommendation,
    mapResorts,
    dateLabel,
  };
}

// ── Chase page data ─────────────────────────────────────────────────

const WITHIN_REACH_MAX_MINUTES = 6 * 60; // 6 hours
const WORTH_THE_TRIP_MIN_SNOWFALL = 6; // 6" minimum for Tier 2
const MAX_VISIBLE_REGIONS = 15;
const MIN_SNOWFALL_VISIBLE = 1; // Hide 0" regions unless nearby

export interface ChasePageData {
  withinReach: ChaseRegion[];
  worthTheTrip: ChaseRegion[];
  regions: ChaseRegion[]; // visible regions (filtered + ranked)
  hiddenRegions: ChaseRegion[]; // regions behind "show all"
  hiddenQuietCount: number; // count of 0" regions not shown
  totalRegionCount: number; // total before filtering
}

export interface ChaseFilters {
  lat?: number;
  lng?: number;
  chaseWillingness?: string;
  passType?: string;
}

/** Score a region for relevance ranking. Higher = more relevant to user. */
function scoreRegion(r: ChaseRegion): number {
  let score = r.snowfallNumeric * 2; // Snow is king
  if (r.hasUserPass) score += 20; // Big bonus for user's pass
  if (r.driveMinutes != null) {
    const driveHours = r.driveMinutes / 60;
    score += Math.max(0, 10 - driveHours); // Proximity bonus (up to 10 pts)
  }
  if (r.chaseScore) score += r.chaseScore; // Include existing chase score
  return score;
}

/** Filter and rank regions, returning visible + hidden sets. */
function filterAndRankRegions(regions: ChaseRegion[]): {
  visible: ChaseRegion[];
  hidden: ChaseRegion[];
  hiddenQuietCount: number;
} {
  // Separate out zero-snowfall regions (keep nearby ones for context)
  const meaningful = regions.filter((r) => {
    if (r.snowfallNumeric >= MIN_SNOWFALL_VISIBLE) return true;
    if (r.driveMinutes != null && r.driveMinutes <= WITHIN_REACH_MAX_MINUTES) return true;
    return false;
  });
  const quietCount = regions.length - meaningful.length;

  // Score and sort by relevance
  const scored = meaningful
    .map((r) => ({ region: r, score: scoreRegion(r) }))
    .sort((a, b) => b.score - a.score);

  const visible = scored.slice(0, MAX_VISIBLE_REGIONS).map((s) => s.region);
  const hidden = scored.slice(MAX_VISIBLE_REGIONS).map((s) => s.region);

  return { visible, hidden, hiddenQuietCount: quietCount };
}

export async function fetchChasePageData(filters?: ChaseFilters): Promise<ChasePageData> {
  if (!isApiMode()) {
    throw new Error('fetchChasePageData should not be called in mock mode');
  }

  const client = getClient();
  const hasLocation = filters?.lat != null && filters?.lng != null;

  // Pass lat/lng so backend can enrich with drive times
  const regionSummaries = await client.getRegions(
    hasLocation ? { lat: filters!.lat, lng: filters!.lng } : undefined,
  );
  const regions = toChaseRegions(regionSummaries, filters?.passType);
  const totalRegionCount = regions.length;

  // If we have drive time data, split into tiers
  const hasDriveData = regions.some((r) => r.driveMinutes != null);

  if (hasDriveData) {
    const withinReach: ChaseRegion[] = [];
    const farRegions: ChaseRegion[] = [];

    for (const region of regions) {
      if (region.driveMinutes != null && region.driveMinutes <= WITHIN_REACH_MAX_MINUTES) {
        withinReach.push(region);
      } else {
        farRegions.push(region);
      }
    }

    // Within reach: filter out 0" regions, sort by composite score (pass + chase score)
    const reachFiltered = withinReach.filter((r) => r.snowfallNumeric >= MIN_SNOWFALL_VISIBLE || r.hasUserPass);
    reachFiltered.sort((a, b) => scoreRegion(b) - scoreRegion(a));

    // Worth the trip: require minimum snowfall, prefer user's pass, sort by snow
    const worthTheTrip = farRegions
      .filter((r) => r.snowfallNumeric >= WORTH_THE_TRIP_MIN_SNOWFALL)
      .sort((a, b) => {
        // User's pass first, then by snowfall
        if (a.hasUserPass !== b.hasUserPass) return a.hasUserPass ? -1 : 1;
        return b.snowfallNumeric - a.snowfallNumeric;
      });

    // Count hidden quiet regions
    const quietInReach = withinReach.length - reachFiltered.length;
    const quietFar = farRegions.filter((r) => r.snowfallNumeric < MIN_SNOWFALL_VISIBLE).length;
    const droppedFromWorth = farRegions.length - worthTheTrip.length - quietFar;
    const hiddenQuietCount = quietInReach + quietFar;

    // If chaseWillingness is 'driving', hide Tier 2
    const willingness = filters?.chaseWillingness;
    const tier2 = willingness === 'driving' ? [] : worthTheTrip;

    // Remaining far regions that didn't make Worth The Trip (1-5" range)
    const hiddenRegions = farRegions
      .filter((r) => r.snowfallNumeric >= MIN_SNOWFALL_VISIBLE && r.snowfallNumeric < WORTH_THE_TRIP_MIN_SNOWFALL)
      .sort((a, b) => b.snowfallNumeric - a.snowfallNumeric);

    return {
      withinReach: reachFiltered,
      worthTheTrip: tier2,
      regions: [...reachFiltered, ...tier2],
      hiddenRegions,
      hiddenQuietCount,
      totalRegionCount,
    };
  }

  // No drive data — use smart filtering engine
  const { visible, hidden, hiddenQuietCount } = filterAndRankRegions(regions);

  return {
    withinReach: [],
    worthTheTrip: [],
    regions: visible,
    hiddenRegions: hidden,
    hiddenQuietCount,
    totalRegionCount,
  };
}

// ── Region comparison ───────────────────────────────────────────────

export interface RegionComparisonData {
  regionName: string;
  resorts: Array<{
    name: string;
    passType: string;
    snowfall5Day: string;
    baseDepth: string;
    liftsOpen: string;
    conditions: string;
  }>;
}

export async function fetchRegionComparison(
  regionId: number,
): Promise<RegionComparisonData> {
  const client = getClient();
  const comparison = await client.getRegionComparison(regionId);

  return {
    regionName: comparison.regionName,
    resorts: comparison.resorts.map((r) => ({
      name: r.name,
      passType: r.passType ?? 'independent',
      snowfall5Day: r.snowfall5Day != null ? `${r.snowfall5Day}"` : '—',
      baseDepth: r.baseDepth != null ? `${r.baseDepth}"` : '—',
      liftsOpen:
        r.liftsOpen != null && r.totalLifts != null
          ? `${r.liftsOpen}/${r.totalLifts}`
          : '—',
      conditions: r.conditions ?? '—',
    })),
  };
}

// ── Trip estimate ───────────────────────────────────────────────────

export async function fetchTripEstimate(region: string) {
  const client = getClient();
  return client.getTripEstimate(region);
}

// ── Utility: check data source mode ─────────────────────────────────

export { isApiMode };
