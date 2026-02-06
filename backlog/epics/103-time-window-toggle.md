# Epic 103: Wire Time Window Toggle

**Status:** Not started (component exists, not connected)
**Priority:** High — core to the "when to ski" question
**Phase:** B (Core product)

## Context

The `TimeToggle` component exists and renders a 5-day / 10-day switcher. The scenario data already has per-window overrides (`timeWindows` with separate `5day` and `10day` recommendation text, context banners, daily labels, and Worth Knowing entries). But the dashboard is hardcoded to always show 10-day data.

In API mode, the backend returns full 10-day forecasts — the frontend would slice to 5-day or 10-day client-side.

## Goal

Toggling the time window re-ranks resorts, updates recommendations, changes map markers, and adjusts all downstream displays.

## User Stories

### 103.1 — Add time window state to dashboard
- Lift `timeWindow` state to dashboard page level
- Pass down to `ResortTable`, `Recommendation`, `WorthKnowing`, `ResortMap`
- Default to `5day` (the more actionable window)

### 103.2 — Resort re-ranking on toggle
- Sort resorts by `forecasts[timeWindow].sort` value
- Animate rank changes (resorts slide to new positions)
- Map markers update snowfall amounts for selected window

### 103.3 — Recommendation text updates
- In mock mode: use `scenario.timeWindows[timeWindow].recommendation`
- In API mode: derive recommendation from top-ranked resort per window
- Context banner updates per window

### 103.4 — Daily labels update
- Column headers change to match selected window (e.g., "Mon Tue Wed Thu Fri" for 5-day)
- In API mode: derive from forecast dates

## Verification

- [ ] Toggle 5-day → 10-day: resorts re-rank if ordering differs
- [ ] Recommendation text changes per window
- [ ] Map marker sizes/colors update
- [ ] Daily column count changes (5 vs 10)
- [ ] Default is 5-day on page load
- [ ] Works in both mock and API modes
- [ ] `pnpm build` and `pnpm typecheck` pass
