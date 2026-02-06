# Epic 200: Drive Times Pipeline

**Status:** Not started (scheduler + Pub/Sub topic exist, no implementation)
**Priority:** High — drive time is core to "where to ski" ranking
**Phase:** B (Core product)

## Context

Drive time from the user's location to each resort is fundamental to the product. The frontend `Resort` type has `driveTime` and `driveMinutes` fields. The product spec emphasizes "conditions per hour invested" as a key metric. But no drive time data exists.

The Terraform infrastructure already defines a `drive_times` Cloud Scheduler job (weekly, Sundays 3 AM) and Pub/Sub topic, but **no pipeline implementation exists**.

## Goal

Pre-computed drive times from major metro areas to all resorts, refreshed weekly. Frontend displays drive time for each resort based on user's location.

## User Stories

### 200.1 — Create drive-times pipeline
- New directory: `pipelines/drive-times/`
- Package: `@onlysnow/pipeline-drive-times`
- Data source: Google Maps Distance Matrix API
- Process:
  1. Define origin cities (Denver, SLC, Scranton, etc. — from seed data or config)
  2. For each origin × resort pair, fetch drive time + distance
  3. Store in new `drive_times` database table
  4. Invalidate cache

### 200.2 — Database schema for drive times
- Add `drive_times` table to `packages/db/src/schema/`:
  - `id` (serial)
  - `originCity` (text) — e.g., "Denver, CO"
  - `originLat`, `originLng` (real)
  - `resortId` (FK to resorts)
  - `durationMinutes` (integer)
  - `distanceMiles` (real)
  - `updatedAt` (timestamp)
  - Unique index on (originCity, resortId)

### 200.3 — API endpoint for drive times
- `GET /api/drive-times?lat=...&lng=...&resortId=...` or batch
- Option A: Return pre-computed from nearest origin city
- Option B: Compute on-demand for exact user location (more expensive, slower)
- Cache aggressively (7-day TTL — drive times don't change often)

### 200.4 — Frontend integration
- When user's location is known, fetch drive times for their resorts
- Display in resort row (existing `driveTime` field)
- Factor into "conditions per hour invested" calculation
- Sort option: "Closest" sorts by drive time

## Verification

- [ ] `pnpm pipeline:drive-times` populates drive times for Denver → all CO resorts
- [ ] API returns drive time for a given origin + resort
- [ ] Frontend displays drive time in resort rows
- [ ] Cache is populated and refreshed weekly
- [ ] `pnpm build` and `pnpm typecheck` pass

## Notes

- Google Maps Distance Matrix API costs ~$5 per 1000 elements
- 50 resorts × 10 origin cities = 500 elements = ~$2.50 per weekly run
- Consider batching requests (max 25 origins × 25 destinations per call)
- Alternative: use OSRM (free, self-hosted) for cost savings
