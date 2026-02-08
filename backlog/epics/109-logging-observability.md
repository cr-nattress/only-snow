# Epic 109: UI & API Logging

**Status:** Not started
**Priority:** Medium — required for production observability
**Phase:** E (Quality & polish)

## Context

The frontend has no interaction logging and the backend API routes have no structured request/response logging. All code runs on Vercel as serverless functions, so logs should write to stdout/stderr (which Vercel captures as Function Logs). No external logging service needed — Vercel's built-in log drain and dashboard are sufficient.

## Goal

Every user interaction in the frontend and every API request/response is logged to Vercel Function Logs, enabling debugging, usage analytics, and performance monitoring.

## Architecture

- **Frontend:** A thin `log()` utility that POSTs events to a new `/api/log` endpoint, which writes to stdout. Client-side `console.log` is not visible in Vercel logs — only server-side output is captured.
- **API:** A shared middleware/wrapper that logs request method, path, query params, response status, and duration for every route. Writes structured JSON to stdout.
- **Format:** Structured JSON lines (`{ timestamp, type, event, ... }`) for easy filtering in Vercel's log dashboard.

## User Stories

### 109.1 — API request/response logging middleware

Add a shared logging wrapper for all API route handlers. Each request logs:
- `timestamp`, `method`, `path`, `query` (redacted of sensitive params)
- `status`, `durationMs`, `cacheHit` (if applicable)
- `error` (message only, no stack traces in production)

**Routes to instrument (13 total):**

| Route | Methods |
|-------|---------|
| `GET /api/resorts` | List resorts (filterable) |
| `GET /api/resorts/[id]` | Resort detail |
| `GET /api/resorts/[id]/forecast` | Resort forecast |
| `GET /api/regions` | List regions |
| `GET /api/regions/[id]/compare` | Region comparison |
| `GET /api/rankings/snow` | Snow rankings |
| `GET /api/chase/alerts` | Chase alerts |
| `GET /api/chase/[region]/trip` | Trip estimate |
| `GET /api/road-conditions/[route]` | Road conditions |
| `GET /api/narrative` | AI narrative |
| `GET /api/user/preferences` | Get user prefs (auth) |
| `PUT /api/user/preferences` | Update user prefs (auth) |
| `POST /api/onboarding/recommendations` | Persona recommendations |

### 109.2 — Frontend event logging endpoint

Create `POST /api/log` in the API app (or frontend app) that accepts batched UI events and writes them to stdout. Keep the endpoint lightweight — no auth required, minimal validation.

Event payload shape:
```ts
{ events: Array<{ event: string, properties?: Record<string, string>, timestamp: string }> }
```

### 109.3 — Frontend logging utility

Create a `log(event, properties?)` utility in `apps/frontend/src/lib/log.ts` that:
- Buffers events in memory
- Flushes to `POST /api/log` every 5 seconds or on page unload (via `navigator.sendBeacon`)
- No-ops in development (or logs to console) based on env flag

### 109.4 — Log button clicks and user interactions

Add `log()` calls to all interactive elements. Group by page:

**Header & Navigation (6 events):**
- `nav.logo_click` — Header logo → dashboard
- `nav.persona_badge_click` — Persona badge → settings
- `nav.account_click` — Account icon → settings/signin
- `nav.tab_click` — Bottom nav tab (property: `tab`)
- `nav.storm_banner_click` — Storm banner → chase
- `nav.storm_tracker_click` — Storm tracker bar → chase

**Dashboard (3 events):**
- `dashboard.resort_click` — Resort row click (property: `resortSlug`)
- `dashboard.time_toggle` — 5-day/10-day toggle (property: `window`)
- `dashboard.scenario_search` — Scenario switcher submit (property: `query`)

**Chase Page (4 events):**
- `chase.region_select` — Region card click (property: `regionId`)
- `chase.alert_cta_click` — Alert CTA → trip view
- `chase.build_trip_click` — Build trip button
- `chase.back_click` — Back navigation (property: `from`)

**Settings (10 events):**
- `settings.sign_out` — Sign out button
- `settings.location_edit` — Toggle location editing
- `settings.location_save` — Save location
- `settings.radius_change` — Drive radius change (property: `radius`)
- `settings.pass_select` — Pass type selection (property: `passType`)
- `settings.persona_select` — Persona selection (property: `persona`)
- `settings.resort_remove` — Remove saved resort (property: `resortId`)
- `settings.chase_toggle` — Chase mode toggle (property: `enabled`)
- `settings.chase_willingness` — Chase willingness change (property: `value`)
- `settings.notification_toggle` — Notification toggle (property: `notifId`, `enabled`)

**Onboarding (10 events):**
- `onboarding.location_select` — Location selection (property: `location`)
- `onboarding.pass_select` — Pass selection (property: `passType`)
- `onboarding.radius_select` — Drive radius (property: `radius`)
- `onboarding.frequency_select` — Ski frequency (property: `frequency`)
- `onboarding.group_select` — Group type (property: `groupType`)
- `onboarding.child_age_toggle` — Child age bracket (property: `age`)
- `onboarding.chase_select` — Chase willingness (property: `value`)
- `onboarding.trigger_toggle` — Decision trigger (property: `trigger`)
- `onboarding.experience_select` — Experience level (property: `level`)
- `onboarding.persona_override` — Manual persona selection (property: `persona`)
- `onboarding.step_next` — Next/continue button (property: `step`)
- `onboarding.step_back` — Back button (property: `step`)

**Auth (1 event):**
- `auth.google_signin` — Google OAuth button click

**Resort Detail (1 event):**
- `resort.back_click` — Back to dashboard

### 109.5 — Log page views

Add a `usePageView()` hook that fires a `page.view` event with `path` and `referrer` on route changes. Use Next.js `usePathname()` to detect navigation.

## Implementation Notes

- All logging writes to `console.log()` with structured JSON — Vercel captures stdout from serverless functions automatically.
- No external services (Datadog, Sentry, etc.) in this epic. Those can be added later as log drains.
- Keep logging non-blocking — never `await` the log POST from the UI. Fire-and-forget.
- Redact sensitive data: never log tokens, passwords, or full user IDs.

## Verification

- [ ] Hit any API route → structured JSON log line appears in Vercel Function Logs
- [ ] Click any button in the UI → event appears in Vercel Function Logs via `/api/log`
- [ ] Navigate between pages → `page.view` events logged
- [ ] Log entries include timestamp, event name, and relevant properties
- [ ] No sensitive data (tokens, secrets) in log output
- [ ] `pnpm build` and `pnpm typecheck` pass
