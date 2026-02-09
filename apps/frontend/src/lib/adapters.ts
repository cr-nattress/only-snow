/**
 * Adapters between backend API types (@onlysnow/types) and frontend UI types.
 *
 * The backend returns ResortSummary/ResortDetail (API-oriented, numeric IDs, nullable fields).
 * The frontend uses Resort/ResortConditions (UI-oriented, string IDs, display-ready).
 */

import type {
  ResortSummary,
  RegionSummary,
  ChaseAlert,
  SnowRanking,
} from '@onlysnow/types';

import type {
  Resort,
  ResortConditions,
  ResortForecasts,
  StormTrackerState,
  StormSeverity,
  ChaseRegion,
  PassType,
} from '@/data/types';

// ── Resort mapping ──────────────────────────────────────────────────

export function toFrontendResort(summary: ResortSummary): Resort {
  return {
    id: summary.slug,
    name: summary.name,
    passType: (summary.passType as PassType) ?? 'independent',
    driveTime: '—', // Not available until Epic 200
    driveMinutes: 0,
    elevation: summary.elevationSummit,
    region: summary.region,
    lat: summary.lat,
    lng: summary.lng,
  };
}

// ── ResortConditions mapping ────────────────────────────────────────

export function toResortConditions(
  summary: ResortSummary,
  forecasts?: ResortForecasts,
): ResortConditions {
  const c = summary.conditions;
  return {
    resort: toFrontendResort(summary),
    snowfall24hr: c?.snowfall24h ?? 0,
    baseDepth: c?.baseDepth ?? 0,
    openPercent:
      c?.trailsOpen != null && c.trailsOpen > 0
        ? Math.round((c.trailsOpen / Math.max(c.trailsOpen, 1)) * 100)
        : 0,
    trailsOpen: c?.trailsOpen ?? 0,
    trailsTotal: c?.trailsOpen ?? 0, // Backend doesn't expose totalTrails on ResortSummary
    liftsOpen: c?.liftsOpen ?? 0,
    liftsTotal: c?.liftsOpen ?? 0, // Same — totalLifts not on summary
    conditions: c?.surfaceCondition ?? c?.resortStatus ?? 'Unknown',
    forecasts: forecasts ?? {
      '5day': { display: '—', sort: 0 },
      '10day': { display: '—', sort: 0 },
    },
  };
}

// ── Forecasts from rankings data ────────────────────────────────────

/**
 * Build ResortForecasts from snow ranking data.
 * The rankings API gives a single snowfall number per timeframe.
 * We use 7d as the 10-day proxy and estimate 5-day as ~half.
 */
export function toResortForecasts(snowfall7d: number): ResortForecasts {
  const est5d = Math.round(snowfall7d * 0.6); // rough 5-day estimate from 7-day
  return {
    '5day': {
      display: est5d > 0 ? `${est5d}"` : '0"',
      sort: est5d,
    },
    '10day': {
      display: snowfall7d > 0 ? `${Math.round(snowfall7d)}"` : '0"',
      sort: snowfall7d,
    },
  };
}

// ── Storm tracker from chase alerts ─────────────────────────────────

function alertToSeverity(alert: ChaseAlert): StormSeverity {
  if (alert.expectedSnowfall >= 18) return 'chase';
  if (alert.expectedSnowfall >= 12) return 'significant';
  if (alert.expectedSnowfall >= 6) return 'moderate';
  return 'quiet';
}

export function toStormTracker(
  alerts: ChaseAlert[],
  regionCoords?: Map<number, { lat: number; lng: number }>,
  userLat?: number,
  userLng?: number,
): StormTrackerState {
  if (alerts.length === 0) {
    return {
      severity: 'quiet',
      text: 'No major storms in the next 10 days.',
    };
  }

  let top: ChaseAlert;

  if (regionCoords && userLat != null && userLng != null) {
    const maxMiles = 600; // 10-hour drive
    // Filter to nearby alerts, then pick the most significant
    const nearby = alerts
      .map((a) => {
        const coords = regionCoords.get(a.regionId);
        const dist = coords
          ? haversineDistance(userLat, userLng, coords.lat, coords.lng)
          : 9999;
        return { alert: a, dist };
      })
      .filter((a) => a.dist <= maxMiles)
      .sort((a, b) => b.alert.expectedSnowfall - a.alert.expectedSnowfall);

    if (nearby.length > 0) {
      top = nearby[0].alert;
    } else {
      return {
        severity: 'quiet',
        text: 'No major storms near you in the next 10 days.',
      };
    }
  } else {
    // No location — pick highest snowfall
    const sorted = [...alerts].sort(
      (a, b) => b.expectedSnowfall - a.expectedSnowfall,
    );
    top = sorted[0];
  }

  const severity = alertToSeverity(top);

  const dates =
    top.peakDays.length > 0
      ? formatDateRange(top.peakDays[0], top.peakDays[top.peakDays.length - 1])
      : '';

  return {
    severity,
    text: `${top.regionName}: ${Math.round(top.expectedSnowfall)}" expected${dates ? ` ${dates}` : ''}. Best: ${top.bestResort}.`,
    region: top.regionName,
    forecastTotal: `${Math.round(top.expectedSnowfall)}"`,
    dates,
  };
}

/** Haversine distance in miles */
function haversineDistance(
  lat1: number, lng1: number,
  lat2: number, lng2: number,
): number {
  const R = 3959;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDateRange(start: string, end: string): string {
  try {
    const s = new Date(start);
    const e = new Date(end);
    const fmt = (d: Date) =>
      d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (start === end) return fmt(s);
    return `${fmt(s)}-${fmt(e)}`;
  } catch {
    return '';
  }
}

// ── Chase regions from region summaries ─────────────────────────────

function regionSeverityToStormSeverity(
  severity: RegionSummary['stormSeverity'],
): StormSeverity {
  // Map the backend's 5-value severity to our 8-value superset
  const map: Record<string, StormSeverity> = {
    none: 'quiet',
    light: 'moderate',
    moderate: 'significant',
    heavy: 'chase',
    epic: 'chase',
  };
  return map[severity] ?? 'quiet';
}

/** Format drive time in minutes to a human-readable string */
export function formatDriveTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

function passMatchesRegion(userPass: string, regionPassTypes: string[]): boolean {
  if (!userPass || userPass === 'none') return false;
  if (userPass === 'multi') return regionPassTypes.some((p) => p !== 'independent');
  return regionPassTypes.some((p) => p === userPass || p === 'both');
}

export function toChaseRegions(regions: RegionSummary[], userPassType?: string): ChaseRegion[] {
  return regions.map((r) => {
    const driveMinutes = r.driveMinutes ?? null;
    const driveDisplay = driveMinutes != null ? formatDriveTime(driveMinutes) : undefined;
    const driveHours = driveMinutes != null ? driveMinutes / 60 : null;
    // Chase score: snowfall / (driveHours + 1) — only meaningful with drive data
    const chaseScore =
      driveHours != null && r.totalSnowfall5Day > 0
        ? r.totalSnowfall5Day / (driveHours + 1)
        : undefined;

    const passTypes = r.passTypes ?? [];
    const hasUserPass = userPassType ? passMatchesRegion(userPassType, passTypes) : false;

    return {
      id: String(r.id),
      name: r.name,
      severity: regionSeverityToStormSeverity(r.stormSeverity),
      forecastTotal: r.totalSnowfall5Day > 0 ? `${Math.round(r.totalSnowfall5Day)}"` : '0"',
      dates: '', // Backend regions don't carry date ranges
      resorts: r.bestResort ? [r.bestResort.name] : [],
      description: r.bestResort
        ? `Best: ${r.bestResort.name} (${Math.round(r.bestResort.snowfall5Day)}" in 5 days)`
        : `${r.resortCount} resorts`,
      bestAirport: r.bestAirport ?? undefined,
      lat: r.lat,
      lng: r.lng,
      driveMinutes,
      driveDisplay,
      chaseScore,
      passTypes,
      hasUserPass,
      snowfallNumeric: r.totalSnowfall5Day,
    };
  });
}

// ── Rankings to ResortConditions ────────────────────────────────────

export function rankingsToResortConditions(
  rankings: SnowRanking[],
): ResortConditions[] {
  return rankings.map((r) => {
    const forecasts = toResortForecasts(r.snowfall);
    return toResortConditions(r.resort, forecasts);
  });
}
