# Epic 102: Dynamic Resort Detail Page

**Status:** Not started
**Priority:** High — currently hardcoded to Vail regardless of which resort is tapped
**Phase:** A (Foundation)

## Context

The resort detail page (`apps/frontend/src/app/resort/[id]/page.tsx`) accepts a dynamic `[id]` route parameter but ignores it — it always renders `vailDetail` and `vailForecast` from hardcoded scenario data. The backend has a comprehensive `/api/resorts/[id]` endpoint that returns resort details with 10-day forecast, SNOTEL snowpack data, and avalanche ratings.

## Goal

Tapping any resort navigates to `/resort/[id]` and shows that resort's real data from the API.

## User Stories

### 102.1 — Fetch resort detail from API
- Use the `[id]` route param to call `GET /api/resorts/[id]`
- Map backend `ResortDetail` to frontend display format
- Handle loading state (skeleton or spinner)
- Handle not-found (404 from API → friendly message)

### 102.2 — Render real forecast data
- Call `GET /api/resorts/[id]/forecast` for detailed forecast
- Render daily forecast in the existing bar chart component
- Show hourly breakdown if available (currently backend serves it, frontend ignores it)
- Display confidence indicators (high/medium/low) from forecast data

### 102.3 — Show snowpack and avalanche data
- Display SNOTEL snowpack reading (SWE, % of median, snow depth)
- Display avalanche danger rating with color coding
- Link to full avalanche forecast URL when available
- Show "Data unavailable" gracefully when SNOTEL/avalanche data is null

### 102.4 — Maintain mock mode fallback
- When `NEXT_PUBLIC_DATA_SOURCE=mock`, continue showing hardcoded Vail detail
- When `=api`, fetch dynamically by ID

## Verification

- [ ] Tap Vail on dashboard → resort detail shows Vail data
- [ ] Tap Breckenridge → resort detail shows Breckenridge data (not Vail)
- [ ] Forecast chart renders real daily snowfall data
- [ ] Avalanche rating displays when available
- [ ] SNOTEL snowpack displays when available
- [ ] Loading state shows while fetching
- [ ] 404 handled gracefully for invalid resort IDs
- [ ] `pnpm build` and `pnpm typecheck` pass

## Dependencies

- Epic 100 (data provider wiring)
- Backend `/api/resorts/[id]` and `/api/resorts/[id]/forecast` — already implemented
- Pipelines must have run at least once to populate forecast + conditions data
