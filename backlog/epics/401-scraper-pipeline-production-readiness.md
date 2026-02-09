# Epic 401: Scraper Pipeline — Production Readiness & Integration

**Status:** Not started
**Priority:** P1 — Populates live snow conditions data that powers dashboard, chase page, and onboarding
**Phase:** Production readiness
**Source:** Codebase analysis, Feb 8 2026

---

## Context

The scraper pipeline (`pipelines/scraper/`) is a 3-stage system that gathers live snow report data from resort websites:

1. **Scrape** — Playwright visits resort snow report pages, captures HTML
2. **Extract** — Claude API (Sonnet 4.5) parses HTML into structured snow data (depths, snowfall, lifts, runs)
3. **Persist** — PATCH updates to `snow_reports` table (only changed fields, skips unchanged content)

The pipeline is architecturally sound — it has robots.txt compliance, HTML change detection (SHA-256), data quality flagging, and cost optimization (~$0.33/resort/month). But it's not yet integrated with the production stack, has security issues, and needs automation before it can run unattended.

### What's Already Good (preserve these)
- **PATCH update logic** — Only updates changed fields, preserving data integrity and reducing writes by 60-80%
- **HTML change detection** — SHA-256 hash comparison skips expensive Claude API calls when content unchanged
- **Robots.txt compliance** — Checks before each scrape, auto-blacklists non-compliant domains
- **Quality monitoring** — Confidence scores, anomaly detection, data quality flags table
- **Cost efficiency** — ~$40.50/month for 200 resorts at 30% change rate

### What Needs Work
- **Security:** `.env.example` contains real Supabase credentials and database password
- **Integration:** Uses Supabase JS client directly instead of shared `@onlysnow/db` Drizzle package
- **Schema gap:** `snow_reports` table has no Drizzle schema in `packages/db` — backend queries it via raw SQL
- **No automation:** Must be run manually via CLI; no scheduled execution
- **Coverage:** Only 10 test resorts configured; needs 80+ for production
- **No `resort_conditions` sync:** Backend API reads from `resort_conditions` (Drizzle), but scraper writes to `snow_reports` (Supabase JS) — data never flows between them

---

## SECURITY: Credential Leak in .env.example (P0)

### Current State

**File:** `pipelines/scraper/.env.example`

The `.env.example` file contains real production credentials that should never be in version control:

- **Supabase project URL:** `pczgfwlaywxbvgvvtafo.supabase.co`
- **Supabase anon key:** Full JWT token (line 20)
- **Supabase service role key:** Full JWT token with privileged access (line 22)
- **Database URL with password:** `postgresql://postgres.pczgfwlaywxbvgvvtafo:Progressive%2112@aws-0-us-west-2.pooler.supabase.com:5432/postgres` (line 25)

### 401.0 — Rotate credentials & sanitize .env.example

**Tasks:**
- [ ] Replace all real values in `.env.example` with placeholders (`your-supabase-url`, `your-key-here`, etc.)
- [ ] Rotate the Supabase service role key in the Supabase dashboard (compromised)
- [ ] Rotate the Supabase anon key (compromised)
- [ ] Change the database password (compromised: `Progressive!2`)
- [ ] Update all `.env` / `.env.local` files and Vercel env vars with new credentials
- [ ] Audit git history for other leaked secrets (`git log -p -- '*.env*'`)
- [ ] Add `*.env.example` to a pre-commit hook that rejects lines matching JWT patterns

**Verification:**
- `.env.example` contains only placeholder values
- Old credentials no longer grant access
- All services (frontend, backend, pipelines) still work with new credentials

---

## Story 1: Add Drizzle Schema for snow_reports (P1)

### Current State

The scraper writes to `snow_reports` via Supabase JS client. The backend API queries it via raw SQL in the onboarding recommendations route:

```typescript
// apps/web/src/app/api/onboarding/recommendations/route.ts (lines 96-107)
const snowRows = await db.execute(sql`
  SELECT DISTINCT ON (resort_id)
    resort_id, snowfall_24h_cm, depth_base_cm, lifts_open, runs_open, surface_description
  FROM snow_reports
  ORDER BY resort_id, report_date DESC, updated_at DESC
`);
```

No Drizzle schema exists for `snow_reports`. The shared `@onlysnow/db` package exports `resortConditions` but not `snowReports`. This means:
- No type safety for snow_reports queries
- Raw SQL is fragile and can't leverage Drizzle's query builder
- Schema changes require updating raw SQL in every consumer

### 401.1 — Create Drizzle schema for snow_reports

**Tasks:**
- [ ] Add `packages/db/src/schema/snow-reports.ts` matching the migration schema
- [ ] Export from `packages/db/src/schema/index.ts`
- [ ] Fields: `id`, `resortId`, `reportDate`, `openFlag`, `depthBaseCm`, `depthMiddleCm`, `depthSummitCm`, `snowfall24hCm`, `snowfall48hCm`, `snowfall72hCm`, `snowfall7dayCm`, `liftsTotal`, `liftsOpen`, `runsTotal`, `runsOpen`, `surfaceDescription`, `dataSource`, `lastUpdatedAt`, `createdAt`, `updatedAt`
- [ ] Replace raw SQL in `onboarding/recommendations/route.ts` with typed Drizzle query
- [ ] Add to any other routes that query `snow_reports`

**Files to create:**
- `packages/db/src/schema/snow-reports.ts`

**Files to modify:**
- `packages/db/src/schema/index.ts`
- `apps/web/src/app/api/onboarding/recommendations/route.ts`

**Verification:**
- `pnpm typecheck` passes
- Onboarding recommendations endpoint returns data using new schema
- Raw SQL eliminated from snow_reports queries

---

## Story 2: Sync snow_reports → resort_conditions (P1)

### Current State

Two separate tables hold conditions data:

| Table | Written by | Read by | Schema |
|-------|-----------|---------|--------|
| `resort_conditions` | conditions-refresh pipeline | All backend API routes (`/api/resorts`, `/api/resorts/[id]`, `/api/resorts/[id]/forecast`) | Drizzle |
| `snow_reports` | Scraper pipeline | `/api/onboarding/recommendations` (raw SQL) | Supabase migration only |

The `resort_conditions` table is what the dashboard actually displays (snowfall24h, baseDepth, liftsOpen, etc.). The `snow_reports` table has richer data (72h/7day snowfall, surface descriptions, open flags) but it's barely consumed.

**The problem:** When the scraper runs, it updates `snow_reports` but the dashboard still reads stale `resort_conditions` data from the conditions-refresh pipeline. The two tables are disconnected.

### 401.2 — Bridge scraper data into resort_conditions

**Option A (recommended): Post-scrape sync step**
- After scraper finishes, run a sync step that updates `resort_conditions` from `snow_reports`
- Map fields: `snowfall_24h_cm` → `snowfall24h` (convert cm to inches), `depth_base_cm` → `baseDepth`, etc.
- Set `source = 'scraped'` to distinguish from conditions-refresh pipeline data
- Only update if `snow_reports.updated_at > resort_conditions.updated_at`

**Option B: Merge at query time**
- Backend API routes already do this partially (onboarding route prefers `snow_reports` over `resort_conditions`)
- Extend this pattern to `/api/resorts` and `/api/resorts/[id]`
- More complex, requires changing multiple routes

**Tasks (Option A):**
- [ ] Create `pipelines/scraper/src/sync.ts` — reads latest `snow_reports`, updates `resort_conditions`
- [ ] Add `sync` CLI command to scraper
- [ ] Unit conversion: cm → inches for snowfall/depth fields
- [ ] Run sync after extract step in main pipeline
- [ ] Add timestamp comparison to avoid overwriting fresher data

**Verification:**
- Scrape a resort → `resort_conditions` reflects the scraped data
- Dashboard shows scraped snow data (not just conditions-refresh data)
- Data freshness preserved (newer source wins)

---

## Story 3: Expand Resort Coverage (P1)

### Current State

Only 10 test resorts have scraping configs:
- Colorado: Vail, Breckenridge, Crested Butte, Aspen, Loveland, Arapahoe Basin, Steamboat, Telluride
- Utah: Alta
- Wyoming: Jackson Hole

The database has 80+ resorts (seeded by `supabase/seed/resorts.json`). The `setup-new-resorts.mjs` script exists but hasn't been run for the full roster.

### 401.3 — Configure scraping for all seeded resorts

**Tasks:**
- [ ] Audit all resorts in database, identify their official snow report URLs
- [ ] Run `setup-new-resorts.mjs` or equivalent to populate `scraping_config` for all resorts
- [ ] Group by region and verify URLs are correct:
  - [ ] Colorado (20 resorts) — most already done
  - [ ] Utah (10+ resorts) — Snowbird, Brighton, Solitude, Park City, Deer Valley, Sundance, Powder Mountain, Snowbasin, Brian Head
  - [ ] California (10 resorts) — Mammoth, Palisades Tahoe, Heavenly, Northstar, Kirkwood, etc.
  - [ ] Pacific Northwest (5+ resorts) — Mt. Baker, Crystal Mountain, Stevens Pass, Mt. Hood, Mt. Bachelor
  - [ ] Northeast (25+ resorts) — Killington, Stowe, Jay Peak, Sunday River, Camelback, etc.
  - [ ] Rocky Mountain (7+ resorts) — Jackson Hole, Big Sky, Whitefish, Taos, Sun Valley, etc.
- [ ] Test scrape each new resort (verify HTML loads, extraction works)
- [ ] Update `scraping_blacklist` for any resorts that block bots
- [ ] Document any resorts with unusual page structures requiring extraction prompt tweaks

**Verification:**
- `scraping_config` has entries for all 80+ resorts
- Test scrape of 5 resorts per region succeeds
- Blacklisted domains documented with alternatives

---

## Story 4: Migrate Scraper to Shared Packages (P2)

### Current State

The scraper uses `@supabase/supabase-js` directly for all database operations. Every other pipeline and the backend API use `@onlysnow/db` (Drizzle) and `@onlysnow/redis` (Upstash). This creates:

- **Two database clients** — Supabase JS vs Drizzle, same database
- **No Redis caching** — Scraper doesn't benefit from the shared cache layer
- **Different type systems** — Scraper's `types.ts` duplicates fields from `@onlysnow/types`
- **Different conventions** — Snake_case in scraper types vs camelCase in shared types

### 401.4 — Migrate to @onlysnow/db and @onlysnow/types

**Tasks:**
- [ ] Add `@onlysnow/db` dependency to scraper `package.json`
- [ ] Replace `Database` class (Supabase JS) with Drizzle client via `createDb()`
- [ ] Use Drizzle schema tables for reads/writes (resorts, snowReports, scrapingConfig)
- [ ] Add Drizzle schemas for `scraped_data`, `scraping_config`, `scraping_blacklist`, `data_quality_flags` if needed
- [ ] Move shared types (`ExtractedSnowReport`, `SnowReport`) to `@onlysnow/types` if consumed by other packages
- [ ] Keep scraper-specific types (`ScrapedData`, `ScraperStats`) in scraper's `types.ts`
- [ ] Add `@onlysnow/pipeline-core` for structured logging (replace `console.log`)

**Files to modify:**
- `pipelines/scraper/package.json`
- `pipelines/scraper/src/database.ts` (rewrite)
- `pipelines/scraper/src/types.ts` (reduce to scraper-specific types)
- `pipelines/scraper/src/index.ts` (use shared DB init)
- `pipelines/scraper/src/scraper.ts` (use Drizzle for scraping_config)
- `pipelines/scraper/src/extractor.ts` (use Drizzle for scraped_data)

**Verification:**
- Scraper uses Drizzle for all DB operations
- No Supabase JS dependency remains (except for edge cases)
- `pnpm typecheck` passes across monorepo
- Test scrape produces same results as before migration

---

## Story 5: Automated Scheduling (P2)

### Current State

The scraper must be run manually:
```bash
cd pipelines/scraper && pnpm dev all
```

No scheduled execution exists. The `scraping_config` table has `next_scrape_at` and `scrape_frequency_hours` columns that track scheduling, but nothing triggers the pipeline.

### 401.5 — Automate daily scraper execution

**Option A: Vercel Cron Job**
- Add a cron API route to the backend (`apps/web/src/app/api/cron/scrape/route.ts`)
- Vercel cron runs daily at 5:00 AM UTC (10 PM MT)
- Triggers scrape → extract → sync pipeline
- Requires Vercel Pro plan for cron jobs

**Option B: GitHub Actions**
- `.github/workflows/scraper.yml` — scheduled workflow
- Runs daily at 5:00 AM UTC
- Installs Playwright, runs pipeline
- Free tier supports scheduled workflows

**Option C: External scheduler (Railway, Render, etc.)**
- Deploy scraper as a standalone service
- Use platform's built-in cron
- More infrastructure to manage

**Tasks (Option B — recommended for cost/simplicity):**
- [ ] Create `.github/workflows/scraper.yml`
- [ ] Schedule: `cron: '0 5 * * *'` (daily 5 AM UTC / 10 PM MT)
- [ ] Steps: checkout → install pnpm → install Playwright → run `pnpm dev all`
- [ ] Set secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `DATABASE_URL`
- [ ] Add notification on failure (GitHub Actions has built-in email alerts)
- [ ] Add optional manual trigger (`workflow_dispatch`) for on-demand runs
- [ ] Log results to a summary artifact for debugging
- [ ] Consider splitting: scrape at 10 PM, extract at 11 PM (staged)

**Verification:**
- GitHub Action runs on schedule
- Snow data updates in database after run
- Failure alerts delivered
- Manual trigger works for debugging

---

## Story 6: Error Recovery & Resilience (P2)

### Current State

The scraper has basic error handling but lacks:
- **Retry logic** — A failed scrape is marked as failed; no automatic retry
- **Exponential backoff** — No delay increase on repeated failures
- **Partial failure handling** — If 3 of 80 resorts fail, the whole run is flagged but no retry
- **Stale data detection** — No alert when a resort's data hasn't updated in 48+ hours
- **Circuit breaker** — If Claude API is down, all extractions fail without early termination

### 401.6 — Add retry logic and circuit breaker

**Tasks:**
- [ ] Add retry with exponential backoff for scrape failures (max 3 retries, 5s/15s/45s delays)
- [ ] Add retry for Claude API extraction failures (max 2 retries)
- [ ] Circuit breaker: after 5 consecutive extraction failures, pause and alert
- [ ] Stale data detection: log warning for resorts not updated in 48+ hours
- [ ] Track `consecutive_errors` in `scraping_config` — disable after 10 consecutive failures
- [ ] Add `--retry-failed` CLI flag to reprocess only failed resorts from last run
- [ ] Add pipeline summary output: `X succeeded, Y failed, Z skipped (unchanged), $N cost`

**Verification:**
- Transient scrape failure → automatic retry succeeds
- Claude API timeout → retry with backoff
- 5+ consecutive failures → pipeline pauses early
- `--retry-failed` reprocesses only the failures

---

## Story Priority & Sequencing

| Story | Priority | Effort | Blocked By |
|-------|----------|--------|------------|
| **401.0** Rotate leaked credentials | P0 | 30 min | Nothing — do this immediately |
| **401.1** Drizzle schema for snow_reports | P1 | 2 hours | Nothing |
| **401.2** Sync snow_reports → resort_conditions | P1 | 3 hours | 401.1 |
| **401.3** Expand resort coverage | P1 | 4-6 hours | Nothing (can run in parallel) |
| **401.4** Migrate to shared packages | P2 | 4-6 hours | 401.1 |
| **401.5** Automated scheduling | P2 | 2-3 hours | 401.3 (need resorts configured first) |
| **401.6** Error recovery & resilience | P2 | 3-4 hours | Nothing |

**Total estimated effort:** 3-4 days

**Deploy order:**
1. **401.0 first** — Security fix, non-negotiable
2. **401.1 + 401.3 in parallel** — Schema + resort coverage (unblocks everything)
3. **401.2** — Sync layer (makes scraped data visible in dashboard)
4. **401.4 + 401.5** — Clean integration + automation
5. **401.6** — Resilience (polish for unattended operation)

---

## Architecture: Current vs Target

### Current Data Flow
```
Scraper (Playwright + Claude)
  → snow_reports table (via Supabase JS)
    → Only consumed by /api/onboarding/recommendations (raw SQL)

Conditions-refresh pipeline (Open-Meteo)
  → resort_conditions table (via Drizzle)
    → Consumed by /api/resorts, /api/resorts/[id], dashboard
```

### Target Data Flow
```
Scraper (Playwright + Claude)
  → snow_reports table (via Drizzle)
    → Sync step → resort_conditions table
      → All API routes, dashboard, chase page

Conditions-refresh pipeline (Open-Meteo)
  → resort_conditions table (via Drizzle, lower priority if scraper data is fresher)

Both data sources → API routes pick freshest data
```

---

## Relationship to Existing Epics

- **Epic 108** (Error Handling & Observability) — 401.6 covers pipeline-specific error handling; Epic 108 covers frontend/API error handling
- **Epic 109** (Logging & Observability) — 401.4 brings the scraper into the shared `pipeline-core` logging infrastructure
- **Epic 200** (Drive Times Pipeline) — Shares the same pipeline architecture; lessons from 401.4 migration apply

---

## Verification (Full Epic)

- [ ] No real credentials in `.env.example` or git history
- [ ] `snow_reports` has a Drizzle schema in `@onlysnow/db`
- [ ] Scraped data flows through to the dashboard via `resort_conditions`
- [ ] 80+ resorts have scraping configs
- [ ] Scraper runs daily on schedule without manual intervention
- [ ] Transient failures retry automatically
- [ ] `pnpm build` and `pnpm typecheck` pass
- [ ] Cost stays under $100/month for full resort coverage
