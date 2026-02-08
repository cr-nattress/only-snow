/**
 * Resort detail data provider.
 *
 * Fetches resort detail from the backend API when in API mode,
 * or returns mock data in mock mode.
 */

import { OnlySnowApiClient } from '@onlysnow/api-client';
import type {
  ResortDetail as ApiResortDetail,
  DailyForecast as ApiDailyForecast,
  SnowpackReading,
  AvalancheInfo,
} from '@onlysnow/types';
import type { DailyForecast as FrontendDailyForecast } from '@/data/types';

import { API_BASE_URL, isApiMode } from './api-config';

// ── Configuration ───────────────────────────────────────────────────

let _client: OnlySnowApiClient | null = null;

function getClient(): OnlySnowApiClient {
  if (!_client) {
    _client = new OnlySnowApiClient({ baseUrl: API_BASE_URL });
  }
  return _client;
}

// ── Resort detail display data ──────────────────────────────────────

export interface ResortDetailData {
  name: string;
  region: string;
  passType: string;
  elevation: number;

  // Conditions
  snowfall24hr: number;
  baseDepth: number;
  openPercent: number;
  trailsOpen: number;
  trailsTotal: number;
  liftsOpen: number;
  liftsTotal: number;
  conditions: string;

  // Forecasts
  forecast5dayDisplay: string;
  forecast10dayDisplay: string;

  // Daily forecast for chart + breakdown
  forecast: FrontendDailyForecast[];

  // Season context
  seasonTotal: number;
  snowpackPercent: number;

  // Snowpack (SNOTEL)
  snowpack: SnowpackReading | null;

  // Avalanche
  avalanche: AvalancheInfo | null;

  // AI analysis
  aiAnalysis?: string;
  contextBanner?: string;
}

// ── Type mapping ────────────────────────────────────────────────────

function mapWeatherIcon(
  conditions: string | null,
  snowfall: number | null,
  cloudCover: number | null,
): FrontendDailyForecast['icon'] {
  if (snowfall && snowfall >= 6) return 'heavy-snow';
  if (snowfall && snowfall > 0) return 'snow';
  if (cloudCover && cloudCover > 70) return 'cloudy';
  if (cloudCover && cloudCover > 30) return 'partly-cloudy';
  return 'sunny';
}

function apiDailyToFrontend(api: ApiDailyForecast): FrontendDailyForecast {
  const d = new Date(api.date);
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  return {
    day: dayNames[d.getUTCDay()],
    date: `${monthNames[d.getUTCMonth()]} ${d.getUTCDate()}`,
    snowfall: api.snowfall ?? 0,
    tempHigh: api.tempHigh ?? 0,
    tempLow: api.tempLow ?? 0,
    wind: api.windSpeed ?? 0,
    icon: mapWeatherIcon(api.conditions, api.snowfall, api.cloudCover),
    conditions: api.conditions ?? 'Unknown',
  };
}

function mapApiDetail(api: ApiResortDetail): ResortDetailData {
  const forecast = api.forecast.map(apiDailyToFrontend);
  const totalSnow = forecast.reduce((sum, d) => sum + d.snowfall, 0);
  const first5 = forecast.slice(0, 5);
  const snow5day = first5.reduce((sum, d) => sum + d.snowfall, 0);

  return {
    name: api.name,
    region: api.region,
    passType: api.passType ?? 'independent',
    elevation: api.elevationSummit,

    snowfall24hr: api.conditions?.snowfall24h ?? 0,
    baseDepth: api.conditions?.baseDepth ?? 0,
    openPercent:
      api.conditions?.trailsOpen != null && api.totalTrails != null && api.totalTrails > 0
        ? Math.round((api.conditions.trailsOpen / api.totalTrails) * 100)
        : api.conditions?.trailsOpen != null
          ? 100
          : 0,
    trailsOpen: api.conditions?.trailsOpen ?? 0,
    trailsTotal: api.totalTrails ?? api.conditions?.trailsOpen ?? 0,
    liftsOpen: api.conditions?.liftsOpen ?? 0,
    liftsTotal: api.totalLifts ?? api.conditions?.liftsOpen ?? 0,
    conditions:
      api.conditions?.surfaceCondition ??
      api.conditions?.resortStatus ??
      'Unknown',

    forecast5dayDisplay: snow5day > 0 ? `${Math.round(snow5day)}"` : '0"',
    forecast10dayDisplay: totalSnow > 0 ? `${Math.round(totalSnow)}"` : '0"',

    forecast,

    seasonTotal: 0, // Not available from API yet
    snowpackPercent: api.snowpack?.sweMedianPct ?? 0,

    snowpack: api.snowpack,
    avalanche: api.avalanche,

    aiAnalysis: undefined,
    contextBanner: undefined,
  };
}

// ── Public API ───────────────────────────────────────────────────────

export async function fetchResortDetail(
  resortId: number | string,
): Promise<ResortDetailData | null> {
  try {
    const client = getClient();
    const detail = await client.getResort(resortId);
    return mapApiDetail(detail);
  } catch {
    return null;
  }
}

export { isApiMode };
