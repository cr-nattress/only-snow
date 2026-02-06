/**
 * Worth Knowing algorithm.
 *
 * Identifies non-pass resorts that significantly outperform the user's
 * pass resorts, surfacing "blind spot" opportunities the user might miss.
 */

import type { ResortConditions, WorthKnowingEntry, TimeWindow } from '@/data/types';

// ── Thresholds ──────────────────────────────────────────────────────

/** Minimum absolute snow differential (inches) over user's best */
const MIN_SNOW_DIFFERENTIAL = 4;

/** Minimum percentage more snow than user's best (e.g., 1.5 = 50% more) */
const MIN_SNOW_RATIO = 1.5;

/** Maximum number of entries to return */
const MAX_ENTRIES = 3;

// ── Types ───────────────────────────────────────────────────────────

interface CandidateResort {
  resort: ResortConditions;
  /** Total forecasted snowfall for the selected time window */
  snowTotal: number;
}

interface WorthKnowingInput {
  /** User's pass resorts with forecasts */
  userResorts: ResortConditions[];
  /** All resorts in the region (includes non-pass resorts) */
  allResorts: ResortConditions[];
  /** User's pass type */
  userPassType: string;
  /** Selected time window */
  timeWindow: TimeWindow;
  /** User's max drive radius in minutes (0 = no filter) */
  driveRadiusMinutes?: number;
}

// ── Algorithm ───────────────────────────────────────────────────────

function getSnowTotal(resort: ResortConditions, tw: TimeWindow): number {
  const forecast = resort.forecasts[tw];
  if (forecast.daily) {
    return forecast.daily.reduce((a, b) => a + b, 0);
  }
  return forecast.sort;
}

function generateReason(
  candidate: CandidateResort,
  userBest: CandidateResort,
  userPassType: string,
  timeWindow: TimeWindow,
): string {
  const diff = Math.round(candidate.snowTotal - userBest.snowTotal);
  const ratio = userBest.snowTotal > 0
    ? (candidate.snowTotal / userBest.snowTotal).toFixed(1)
    : 'N/A';

  const isOnPass = candidate.resort.resort.passType === userPassType;
  const windowLabel = timeWindow === '5day' ? '5-day' : '10-day';

  if (isOnPass) {
    return `${candidate.resort.resort.name} is getting ${diff}" more than ${userBest.resort.resort.name} over the ${windowLabel} window. On your pass.`;
  }

  return `${candidate.resort.resort.name} is getting ${diff}" more snow than your best pass resort (${ratio}x). Worth the walk-up ticket.`;
}

/**
 * Compute Worth Knowing entries from resort data.
 *
 * Returns up to MAX_ENTRIES resorts that significantly outperform the
 * user's best pass resort for the selected time window.
 */
export function computeWorthKnowing(input: WorthKnowingInput): WorthKnowingEntry[] {
  const { userResorts, allResorts, userPassType, timeWindow, driveRadiusMinutes } = input;

  if (userResorts.length === 0 || allResorts.length === 0) return [];

  // Find the user's best resort by snow total
  const userCandidates: CandidateResort[] = userResorts.map((r) => ({
    resort: r,
    snowTotal: getSnowTotal(r, timeWindow),
  }));
  userCandidates.sort((a, b) => b.snowTotal - a.snowTotal);
  const userBest = userCandidates[0];

  // IDs of user's resorts (to exclude from candidates)
  const userResortIds = new Set(userResorts.map((r) => r.resort.id));

  // Score all non-user resorts
  const candidates: (CandidateResort & { score: number })[] = [];

  for (const resort of allResorts) {
    if (userResortIds.has(resort.resort.id)) continue;

    // Filter by drive radius if specified
    if (driveRadiusMinutes && driveRadiusMinutes > 0 && resort.resort.driveMinutes > driveRadiusMinutes) {
      continue;
    }

    const snowTotal = getSnowTotal(resort, timeWindow);
    const differential = snowTotal - userBest.snowTotal;
    const ratio = userBest.snowTotal > 0 ? snowTotal / userBest.snowTotal : 0;

    // Must exceed at least one threshold
    const exceedsDifferential = differential >= MIN_SNOW_DIFFERENTIAL;
    const exceedsRatio = ratio >= MIN_SNOW_RATIO;

    if (!exceedsDifferential && !exceedsRatio) continue;

    // Score: weighted combination of absolute and relative advantage
    const score = differential * 0.6 + (ratio - 1) * 10 * 0.4;

    candidates.push({ resort, snowTotal, score });
  }

  // Sort by score descending, take top entries
  candidates.sort((a, b) => b.score - a.score);
  const top = candidates.slice(0, MAX_ENTRIES);

  return top.map((c) => ({
    resort: c.resort.resort,
    snowfall24hr: c.resort.snowfall24hr,
    baseDepth: c.resort.baseDepth,
    openPercent: c.resort.openPercent,
    walkUpPrice: c.resort.resort.passType === userPassType ? 0 : 0, // walk-up price not available yet
    reason: generateReason(c, userBest, userPassType, timeWindow),
    forecasts: c.resort.forecasts,
  }));
}
