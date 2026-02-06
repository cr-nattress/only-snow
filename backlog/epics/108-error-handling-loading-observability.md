# Epic 108: Error Handling, Loading States & Observability

**Status:** Not started
**Priority:** Medium — required for production readiness
**Phase:** E (Quality & polish)

## Context

The frontend has no React error boundaries, no loading skeletons, no Suspense boundaries, and no analytics. The backend API routes have no rate limiting (except user preferences which checks JWT). No observability beyond pipeline-core's structured logging.

## Goal

The app handles errors gracefully, shows loading states, and operators can monitor system health.

## User Stories

### 108.1 — React error boundaries
- Add error boundary at layout level (catch all)
- Add error boundary per page (dashboard, chase, resort detail)
- Friendly error messages with "try again" action
- Error details logged to console (dev) / reporting service (prod)

### 108.2 — Loading skeletons
- Dashboard: skeleton cards for resort table while data loads
- Resort detail: skeleton for forecast chart + stats
- Chase page: skeleton cards for region grid
- Use Tailwind `animate-pulse` on gray placeholder shapes
- Matches existing Epic 005 requirement

### 108.3 — Suspense boundaries for data fetching
- Wrap data-dependent sections in React Suspense
- Server components where possible (Next.js App Router)
- Streaming for slow data (forecasts, chase alerts)

### 108.4 — API rate limiting
- Add rate limiting middleware to backend API routes
- Options: Upstash Ratelimit (already have Redis), or Next.js middleware
- Limits: 100 req/min per IP for public routes, 30 req/min for write routes
- Return 429 with Retry-After header

### 108.5 — Frontend error reporting
- Integrate error reporting (Sentry, or simple `/api/log` endpoint)
- Capture: unhandled errors, API failures, slow loads
- Include context: route, user persona, data source mode

### 108.6 — Backend health check
- Add `GET /api/health` endpoint
- Checks: database reachable, Redis reachable, pipeline freshness
- Returns: `{ status: "ok" | "degraded" | "down", checks: {...} }`
- Used by deployment health checks and monitoring

### 108.7 — Pipeline monitoring
- Alert on pipeline failures (Cloud Functions error rate)
- Alert on stale data (forecast > 12h old, conditions > 4h old)
- Dashboard or simple status page showing last pipeline run times
- Leverage existing `PipelineMetrics` interface from pipeline-core

## Verification

- [ ] API error → friendly error message in UI (not white screen)
- [ ] Slow API → loading skeleton visible before data appears
- [ ] Burst API requests → 429 response after limit
- [ ] `/api/health` returns accurate status
- [ ] Pipeline failure → alert fires
- [ ] `pnpm build` and `pnpm typecheck` pass
