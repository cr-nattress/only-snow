# Epic 403: Resort Conditions Data — Snowfall, Base Depth, Webcams & Open Status

**Status:** Not started
**Priority:** P1 — Core data gaps make resort detail page show 0" for all conditions
**Phase:** Data infrastructure
**Source:** Product review, Feb 8 2026

---

## Context

The resort detail page displays three key stats — **Last 24hr snowfall**, **Next 5 days forecast**, and **Base depth** — but all show **0"** for most resorts. The `resort_conditions` table has columns for this data (`snowfall_24h`, `snowfall_48h`, `base_depth`, `summit_depth`) but nothing populates them. Additionally, `webcam_url` is null for all 183 resorts, and `resort_status` (open/closed) is only inferred from lift data.

### Current Data Sources

| Data Point | Source | Pipeline | Status |
|-----------|--------|----------|--------|
| **Lifts open/total** | Liftie API | conditions-refresh | Working (~70 resorts mapped) |
| **Trails open/total** | Vail Resorts scraper | conditions-refresh | Working (Vail resorts only) |
| **Resort status** | Inferred from `liftsOpen > 0` | conditions-refresh | Working but inaccurate |
| **Daily forecast** | Open-Meteo API | forecast-refresh | Working (all resorts) |
| **Snowfall 24h/48h** | — | — | **Not populated** |
| **Base depth** | — | — | **Not populated** |
| **Summit depth** | — | — | **Not populated** |
| **Surface condition** | — | — | **Not populated** |
| **Webcam URL** | — | — | **Null for all resorts** |
| **Open/closed (explicit)** | Scraper `open_flag` | scraper (not synced) | **In snow_reports only** |

### The Gap

The conditions-refresh pipeline talks to **Liftie** (lifts) and **Vail Resorts terrain pages** (trails), but neither source provides snowfall, base depth, or surface conditions. The scraper pipeline extracts all of this from resort websites into `snow_reports`, but that data never reaches `resort_conditions` (see Epic 401, Story 401.2).

Meanwhile, the forecast pipeline provides accurate **future** snowfall from Open-Meteo, but there's no source for **observed/reported** snowfall (what actually fell in the last 24h).

---

## Story 403.1: Research — Snowfall & Base Depth Data Sources

**Status:** Not started
**Priority:** P1

Identify and evaluate data sources for real-time snowfall (24h, 48h, 72h) and base/summit depth.

### Sources to Evaluate

**Free / Open APIs:**
- **SNOTEL (NRCS)** — Already have a snotel-daily pipeline. SNOTEL provides SWE (snow water equivalent) and snow depth at ~900 stations. Can derive snowfall from depth changes. Limitation: stations aren't at resorts, they're in the backcountry.
- **Open-Meteo historical weather** — Provides past precipitation and snowfall. Could compute 24h/48h observed snowfall from hourly data we may already fetch.
- **NWS (National Weather Service)** — Observation stations near resorts. Free API, but station coverage varies.
- **Synoptic Data / MesoWest** — Weather station network. Free tier available. Many stations near ski areas.

**Resort-reported (scraper):**
- The existing scraper pipeline (`pipelines/scraper/`) already extracts snowfall and depth from resort websites. This is the most accurate "reported" data, but requires the sync from `snow_reports` → `resort_conditions` (Epic 401.2).

**Commercial APIs:**
- **Weather Underground** — Has ski resort conditions, but API is limited/deprecated.
- **OnTheSnow / Ski Resort Info** — Aggregated resort data. No public API. Would require scraping (terms of service concerns).
- **Powderlin.es** — Crowdsourced snow reports. No API.

### Research Tasks
- [ ] Test Open-Meteo historical endpoint for 24h/48h observed snowfall accuracy at resort coordinates
- [ ] Evaluate SNOTEL-to-resort mapping — how many resorts have a nearby SNOTEL station?
- [ ] Check if NWS has observation stations near top 20 resorts
- [ ] Assess scraper pipeline reliability for snowfall/depth data (how many resorts return usable data?)
- [ ] Compare scraped "reported" snowfall vs Open-Meteo "modeled" snowfall for accuracy

### Acceptance Criteria
- [ ] Decision documented: which source(s) to use for snowfall and base depth
- [ ] Coverage map: how many of our resorts can be served by each source
- [ ] Accuracy assessment: comparison of at least 2 sources against manually verified resort reports

---

## Story 403.2: Research — Webcam URLs

**Status:** Not started
**Priority:** P2

Populate `webcam_url` for all resorts. This is a link to the resort's webcam page (not an embedded stream).

### Approach Options

**Option A: Manual curation (fastest)**
- Visit each resort's website, find their webcam/mountain-cams page
- Store URL in `resorts.webcam_url`
- Estimated effort: 2-3 hours for 183 resorts
- Pro: Most reliable, guaranteed correct
- Con: Doesn't scale, needs periodic maintenance

**Option B: Automated discovery script**
- For each resort, try common webcam page paths against their `website` URL:
  - `/webcams`, `/mountain-cams`, `/live-cams`, `/the-mountain/mountain-cams`
  - `/conditions/webcams`, `/mountain-conditions/mountain-cams.aspx`
- HTTP HEAD request to check which paths return 200
- Pro: Fast, repeatable
- Con: Won't catch non-standard paths, may get false positives

**Option C: Windy Webcams API**
- Free tier: 1000 requests/day
- Search by lat/lng near each resort
- Returns webcam stream URLs (not resort's own page)
- Pro: Embeddable streams, auto-discovery
- Con: API dependency, may not have all resorts, different UX than linking to resort page

### Research Tasks
- [ ] Audit 10 resorts manually to identify common webcam URL patterns
- [ ] Build and test Option B discovery script against those 10
- [ ] Evaluate Windy Webcams API coverage for our resort set
- [ ] Decide: link to resort webcam page vs embed third-party stream

### Acceptance Criteria
- [ ] Approach selected and documented
- [ ] Webcam URL populated for at least top 50 resorts (by traffic/popularity)

---

## Story 403.3: Research — Open/Closed Status

**Status:** Not started
**Priority:** P2

Get accurate open/closed/expected status for each resort beyond `liftsOpen > 0`.

### Current Problem
- `resortStatus` is derived from `liftsOpen > 0 ? 'open' : 'closed'` in conditions-refresh
- This fails for resorts without Liftie mapping (shows null)
- Doesn't distinguish "closed for the day" vs "closed for the season" vs "expected to open"
- Scraper pipeline gets `open_flag` (1=open, 0=closed, 2=partially) but it's in `snow_reports`, not `resort_conditions`

### Sources to Evaluate
- **Liftie API** — Already used. Reliable for open/closed during operating hours, but only covers ~70 resorts
- **Scraper pipeline** — Gets explicit open_flag from resort websites. More nuanced (partially open). Needs Epic 401.2 sync
- **Resort operating calendars** — Most resorts publish season dates. Could seed an `expected_open_date` / `expected_close_date` on the resorts table
- **Crowdsourced / social** — Twitter/X feeds, resort Instagram. Low reliability, high effort

### Research Tasks
- [ ] Count resorts with Liftie coverage vs without
- [ ] Assess scraper `open_flag` accuracy across resort types
- [ ] Determine if season calendar data is available programmatically (resort websites, skiresort.info)
- [ ] Define status enum: `'open' | 'closed' | 'partially-open' | 'closed-for-season' | 'expected'`

### Acceptance Criteria
- [ ] Recommended approach for open/closed status
- [ ] Coverage gap identified: which resorts have no status source at all

---

## Story 403.4: Implementation — Populate resort_conditions with Snowfall & Depth

**Status:** Not started — blocked by Story 403.1 research
**Priority:** P1

Based on research findings, implement the chosen approach to populate `snowfall_24h`, `snowfall_48h`, `snowfall_72h`, `base_depth`, `summit_depth`, and `surface_condition` in the `resort_conditions` table.

### Likely Approaches (to be refined after research)

**Path A: Extend conditions-refresh pipeline**
- Add a new data source fetch (Open-Meteo historical, SNOTEL, or NWS) alongside existing Liftie calls
- Write snowfall/depth fields in the same upsert that writes lift data

**Path B: Sync scraper → resort_conditions (Epic 401.2)**
- After scraper writes to `snow_reports`, sync relevant fields to `resort_conditions`
- Leverages existing scraper infrastructure
- Most accurate (resort-reported data)

**Path C: Hybrid**
- Use Open-Meteo for modeled snowfall (broad coverage)
- Overlay scraper data when available (higher accuracy for covered resorts)
- Fallback gracefully when neither is available

### Acceptance Criteria
- [ ] `snowfall_24h` populated for at least 80% of resorts
- [ ] `base_depth` populated for at least 50% of resorts
- [ ] Resort detail page shows real numbers instead of 0"
- [ ] Data refreshes at least every 6 hours

---

## Story 403.5: Implementation — Populate Webcam URLs

**Status:** Not started — blocked by Story 403.2 research
**Priority:** P2

Based on research findings, populate `webcam_url` for all resorts.

### Acceptance Criteria
- [ ] `webcam_url` populated for 80%+ of resorts
- [ ] Resort detail page renders a "View Webcams" link when URL is available
- [ ] URLs validated (return 200, not redirect to 404)

---

## Dependencies

- **Epic 401 (Story 401.2)**: Syncing `snow_reports` → `resort_conditions` is a likely implementation path for snowfall/depth data
- **SNOTEL pipeline**: Already running, could be extended if SNOTEL-to-resort mapping proves viable
- **Forecast pipeline**: Already provides future snowfall; could be extended to fetch historical observed data from Open-Meteo

## Not In Scope
- Embedding live webcam video streams (just link to resort's page)
- Real-time snowfall push notifications (separate epic)
- Season pass pricing or ticket availability
