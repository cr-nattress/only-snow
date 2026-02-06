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

// ── Configuration ───────────────────────────────────────────────────

const DATA_SOURCE = process.env.NEXT_PUBLIC_DATA_SOURCE ?? 'mock';
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3000';

function isApiMode(): boolean {
  return DATA_SOURCE === 'api';
}

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

export async function fetchDashboardData(): Promise<DashboardData> {
  if (!isApiMode()) {
    throw new Error('fetchDashboardData should not be called in mock mode');
  }

  const client = getClient();

  // Fetch resorts and chase alerts in parallel
  const [resortSummaries, chaseAlerts, rankings] = await Promise.all([
    client.getResorts(),
    client.getChaseAlerts(),
    client.getSnowRankings(),
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

  // Build storm tracker from chase alerts
  const stormTracker = toStormTracker(chaseAlerts);

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

export interface ChasePageData {
  regions: ChaseRegion[];
}

export async function fetchChasePageData(): Promise<ChasePageData> {
  if (!isApiMode()) {
    throw new Error('fetchChasePageData should not be called in mock mode');
  }

  const client = getClient();
  const regionSummaries = await client.getRegions();
  const regions = toChaseRegions(regionSummaries);

  // Sort by severity (most active first)
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

  return { regions };
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
