# Epic 002: Time Toggle — Shift the Planning Window

## Summary

Wire up the time toggle component to dynamically switch between 5-day and 10-day views. Resorts re-rank with animation when the window changes, recommendations update, and the Worth Knowing section adapts.

## Current State

The `TimeToggle` component exists but isn't connected to the dashboard. The dashboard is hardcoded to `timeWindow="10day"`. The scenario data already has `timeWindows["5day"]` and `timeWindows["10day"]` overrides with per-window recommendations and worth knowing entries.

## Goal

When the user toggles between 5-day and 10-day views:
1. Resorts re-rank based on the selected window's forecast sort values
2. The recommendation text updates to match the window
3. Worth Knowing entries change if the window has different entries
4. Daily labels update (Thu-Mon for 5-day, Thu-Sat for 10-day)
5. Context banner updates if different per window

---

## User Stories

### 1. Wire TimeToggle into dashboard

**As a** user on the main screen,
**I want** to see a 5-day / 10-day toggle above the resort table,
**so that** I can shift my planning horizon.

#### Acceptance Criteria
- Add `TimeToggle` component between the map and resort table
- Store `timeWindow` state in dashboard (`useState<TimeWindow>("10day")`)
- Pass `timeWindow` and `onToggle` to `TimeToggle`
- Responsive styling consistent with other dashboard elements

---

### 2. Dynamic resort re-ranking

**As a** user switching time windows,
**I want** the resort list to re-sort based on the new window's forecast,
**so that** I see which resort is best for that timeframe.

#### Acceptance Criteria
- `ResortTable` receives `timeWindow` prop (already does)
- Sorting uses `forecasts[timeWindow].sort` (already does)
- Verify 5-day and 10-day produce different orderings for Denver scenarios
- Add subtle CSS transition on resort rows for smooth reorder

---

### 3. Per-window recommendations and context

**As a** user viewing the 5-day vs 10-day window,
**I want** the recommendation and context banner to update,
**so that** I get advice specific to that timeframe.

#### Acceptance Criteria
- Dashboard reads `scenario.timeWindows[timeWindow].recommendation`
- Dashboard reads `scenario.timeWindows[timeWindow].contextBanner`
- AI Analysis uses scenario-level `aiAnalysis` (doesn't change per window)
- Worth Knowing uses `windowData.worthKnowing ?? scenario.worthKnowing`

---

### 4. Daily labels update

**As a** user viewing different time windows,
**I want** the daily forecast labels to show the correct days,
**so that** I know which days I'm looking at.

#### Acceptance Criteria
- 5-day: Shows 5 day labels (e.g., "Thu Fri Sat Sun Mon")
- 10-day: Shows 10 day labels (e.g., "Thu Fri Sat Sun Mon Tue Wed Thu Fri Sat")
- Labels come from `windowData.dailyLabels`

---

### 5. Map snowfall totals update

**As a** user switching time windows,
**I want** the map markers to show snowfall totals for the selected window,
**so that** the map reflects what I'm planning for.

#### Acceptance Criteria
- Map marker snowfall comes from `forecasts[timeWindow].daily` sum
- Switching windows updates the map markers
- Display shows e.g., "6"" for 5-day vs "10"" for 10-day

---

## Implementation Notes

- The scenario data structure already supports this — `timeWindows["5day"]` and `timeWindows["10day"]` exist
- The `TimeToggle` component already exists and is styled
- Main work is wiring state through the dashboard and ensuring all downstream components use the selected window

## Files to Modify

- `src/app/dashboard/page.tsx` — Add state, wire toggle, pass window to children
- `src/components/TimeToggle.tsx` — Ensure it accepts `value` and `onChange` props
- Verify `ResortTable`, `ResortRow`, `ResortMap` already accept `timeWindow`

## Verification

- Toggle between 5-day and 10-day on Denver Dry scenario
- Verify resort order changes (Vail should rank higher in both but verify sort values differ)
- Verify recommendation text changes
- Verify map markers update
- `npm run build` passes
