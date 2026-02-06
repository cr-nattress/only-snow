/** Cache key naming convention: onlysnow:{entity}:{identifier} */
export const CacheKeys = {
  forecast: (resortId: number) => `onlysnow:forecast:${resortId}`,
  forecastHourly: (resortId: number) => `onlysnow:forecast-hourly:${resortId}`,
  conditions: (resortId: number) => `onlysnow:conditions:${resortId}`,
  resortDetail: (resortId: number) => `onlysnow:resort:${resortId}`,
  regionCompare: (regionId: number) => `onlysnow:region-compare:${regionId}`,
  rankings: (timeframe: string, region?: string) =>
    `onlysnow:rankings:${timeframe}${region ? `:${region}` : ''}`,
  chaseAlerts: () => `onlysnow:chase-alerts`,
  roadConditions: (route: string) => `onlysnow:road:${route}`,
  snowpack: (stationId: string) => `onlysnow:snowpack:${stationId}`,
  narrativeDashboard: (region: string) => `onlysnow:narrative:dashboard:${region}`,
  narrativeResort: (resortId: number) => `onlysnow:narrative:resort:${resortId}`,
} as const;

/** TTL values in seconds */
export const CacheTTL = {
  RESORT_DETAIL: 30 * 60, // 30 minutes
  FORECAST: 3 * 60 * 60, // 3 hours
  CONDITIONS: 30 * 60, // 30 minutes
  REGION_COMPARE: 60 * 60, // 1 hour
  RANKINGS: 60 * 60, // 1 hour
  CHASE_ALERTS: 30 * 60, // 30 minutes
  ROAD_CONDITIONS: 5 * 60, // 5 minutes
  SNOWPACK: 6 * 60 * 60, // 6 hours
  DRIVE_TIMES: 7 * 24 * 60 * 60, // 7 days
  NARRATIVE_DASHBOARD: 6 * 60 * 60, // 6 hours (matches forecast refresh)
  NARRATIVE_RESORT: 2 * 60 * 60, // 2 hours (matches conditions refresh)
} as const;
