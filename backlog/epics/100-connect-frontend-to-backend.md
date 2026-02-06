# Epic 100: Connect Frontend to Backend API

**Status:** Not started
**Priority:** Critical — highest-leverage item, enables everything else
**Phase:** A (Foundation)

## Context

The frontend is a complete UI prototype running on hardcoded mock scenarios. The backend has 10 real API routes serving data from PostgreSQL + Redis. The `@onlysnow/api-client` package and `NEXT_PUBLIC_DATA_SOURCE` toggle already exist. This epic wires them together.

## Goal

When `NEXT_PUBLIC_DATA_SOURCE=api`, the frontend fetches real data from the backend. When `=mock`, it continues using hardcoded scenarios. Both modes work side-by-side during development.

## User Stories

### 100.1 — Create data provider with source toggle
- Create `apps/frontend/src/lib/data-provider.ts`
- Read `NEXT_PUBLIC_DATA_SOURCE` env var
- Export functions that delegate to either mock data or `OnlySnowApiClient`
- All components consume data through this provider, never directly

### 100.2 — Build type adapters between frontend and backend
- Frontend uses `Resort`, `ResortConditions`, `ResortForecasts` (UI-oriented)
- Backend returns `ResortSummary`, `ResortDetail` (API-oriented)
- Create `apps/frontend/src/lib/adapters.ts` with mapping functions:
  - `toFrontendResort(summary: ResortSummary): Resort`
  - `toResortConditions(summary: ResortSummary): ResortConditions`
  - `toStormTracker(alerts: ChaseAlert[]): StormTrackerState`
  - `toChaseRegions(regions: RegionSummary[]): ChaseRegion[]`
- Handle missing fields gracefully (drive time not yet available, etc.)

### 100.3 — Wire dashboard to real data
- Replace `scenarios` import in `dashboard/page.tsx` with data provider calls
- Fetch: resorts list, chase alerts (for storm tracker), region summaries
- Maintain scenario switcher as a mock-mode-only feature
- Add loading state while data loads
- Add error state if API unreachable

### 100.4 — Wire chase page to real data
- Replace `chaseRegions` import with `/api/regions` call
- Replace `tellurideTripPlan` with `/api/chase/[region]/trip` call
- Region detail view: call `/api/regions/[id]/compare` for resort ranking

### 100.5 — Wire resort rankings
- Use `/api/rankings/snow` for resort sorting
- Support timeframe parameter (24h, 48h, 72h, 7d)

## Verification

- [ ] `pnpm --filter frontend dev` with `NEXT_PUBLIC_DATA_SOURCE=mock` — everything works as before
- [ ] `pnpm dev` (both apps) with `NEXT_PUBLIC_DATA_SOURCE=api` — dashboard shows data from backend
- [ ] Graceful fallback when backend is unreachable (error message, not crash)
- [ ] `pnpm build` passes
- [ ] `pnpm typecheck` passes

## Dependencies

- Backend must be running locally (`pnpm --filter web dev` on port 3000)
- Database must be seeded (`packages/db/src/seed.ts`)
- At least `forecast-refresh` pipeline must have run once to populate forecast data

## Notes

- Drive times won't be available yet (Epic 200). Show "—" or omit.
- Worth Knowing algorithm doesn't exist yet (Epic 104). The section can be hidden in API mode initially.
- The `Scenario` type is frontend-only. In API mode, we construct the dashboard from individual API calls rather than a single scenario object.
