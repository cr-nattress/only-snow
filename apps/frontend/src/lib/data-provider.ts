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

const WITHIN_REACH_MAX_MINUTES = 10 * 60; // 10 hours
const WORTH_THE_TRIP_MIN_SNOWFALL = 6; // 6" minimum for Tier 2

export interface ChasePageData {
  withinReach: ChaseRegion[];
  worthTheTrip: ChaseRegion[];
  regions: ChaseRegion[]; // flat list fallback (no location or chaseWillingness='no')
}

export interface ChaseFilters {
  lat?: number;
  lng?: number;
  chaseWillingness?: string;
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
  const regions = toChaseRegions(regionSummaries);

  // If we have drive time data, split into tiers
  const hasDriveData = regions.some((r) => r.driveMinutes != null);

  if (hasDriveData) {
    const withinReach: ChaseRegion[] = [];
    const worthTheTrip: ChaseRegion[] = [];

    for (const region of regions) {
      if (region.driveMinutes != null && region.driveMinutes <= WITHIN_REACH_MAX_MINUTES) {
        withinReach.push(region);
      } else {
        // Tier 2: far away or no drive data — require minimum snowfall
        const snowfall = parseFloat(region.forecastTotal) || 0;
        if (snowfall >= WORTH_THE_TRIP_MIN_SNOWFALL) {
          worthTheTrip.push(region);
        }
      }
    }

    // Tier 1: sort by chase score (highest first)
    withinReach.sort((a, b) => (b.chaseScore ?? 0) - (a.chaseScore ?? 0));

    // Tier 2: sort by raw snowfall (highest first)
    worthTheTrip.sort((a, b) => {
      const snowA = parseFloat(a.forecastTotal) || 0;
      const snowB = parseFloat(b.forecastTotal) || 0;
      return snowB - snowA;
    });

    // If chaseWillingness is 'driving', hide Tier 2
    const willingness = filters?.chaseWillingness;
    return {
      withinReach,
      worthTheTrip: willingness === 'driving' ? [] : worthTheTrip,
      regions: [...withinReach, ...worthTheTrip],
    };
  }

  // No drive data — fall back to severity-based sort
  const severityOrder: Record<string, number> = {
    chase: 0,
    significant: 1,
    moderate: 2,
    quiet: 3,
  };
  regions.sort(
    (a, b) =>
      (severityOrder[a.severity] ?? 9) - (severityOrder[b.severity] ?? 9),
  );

  return { withinReach: [], worthTheTrip: [], regions };
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
