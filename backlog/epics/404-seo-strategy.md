# Epic 404: SEO Strategy — Make OnlySnow the #1 Ski Decision Site

**Status:** Not started
**Priority:** P1 — Without SEO, the only growth channel is paid/referral
**Phase:** Growth infrastructure
**Source:** Competitive analysis + site audit, Feb 8 2026

---

## Executive Summary

OnlySnow is currently **invisible to search engines**. SEO readiness score: **2/10**. There's no robots.txt, no sitemap, no structured data, no Open Graph tags, no per-page metadata, and nearly all content is behind authentication. Meanwhile, competitors have massive organic footprints:

| Competitor | Monthly Visits | Indexed Pages | Domain Rating |
|-----------|---------------|---------------|---------------|
| Snow-Forecast.com | ~2.25M | 3,300 resort pages | 77 |
| OnTheSnow.com | ~1.4M | 1,420,000 | ~65 |
| OpenSnow.com | ~1.2M | Moderate (paywalled) | ~55 |
| ZRankings.com | Smaller | 221 resort pages | ~45 |
| **OnlySnow** | **~0** | **1-2 pages** | **0** |

**The opportunity:** No competitor owns the "region-first decision engine" angle. Nobody answers "Where's the best snow I can reach from Denver with my Epic pass this weekend?" OnlySnow can own this entire keyword cluster — but only if Google can see the content.

---

## Competitive Landscape

### What Each Competitor Does Best

- **OpenSnow** — Expert meteorologist forecasts, paid model ($50-100/yr), strong brand loyalty (64% direct traffic). Weakness: paywall hides content from Google.
- **OnTheSnow** — Massive programmatic footprint (1.42M pages), UGC reviews/photos, 14 languages, 20 countries, 300K email subscribers. Weakness: templated content, dated interface.
- **Snow-Forecast.com** — Highest domain rating (77) driven by embeddable widgets generating 12,700 backlinks. 3,300 resort pages updated 4x daily. Weakness: weather-data platform, not ski-culture brand.
- **ZRankings** — Owns "where is it snowing" query with regularly-updated article. Data-driven rankings, comparison content. Weakness: only 221 resorts.
- **SkiResort.info** — 6,100 resort profiles, 62% organic traffic (most search-dependent). Weakness: encyclopedia format, no decision support.

### The Gap Nobody Fills

1. **Region-first decision support** — Every competitor is resort-first
2. **Pass-aware filtering** — Epic/Ikon sites only show their own resorts; aggregators don't filter by pass
3. **Drive-time aware recommendations** — No one generates "best skiing within 3 hours of [city]" content
4. **Personalized narrative** — OpenSnow has expert forecasts but they're not personalized to user context

---

## Current Site Audit

### What Exists
- Root layout has basic title ("OnlySnow") and description
- Resort detail pages are server-rendered (good for SEO)
- URL structure uses slugs (`/resort/vail`) — SEO-friendly
- Resort data available: name, region, elevation, lat/lng, conditions, forecasts, pass type

### What's Missing (Critical)
- No `robots.txt` — Google has no crawl guidance
- No `sitemap.xml` — Google doesn't know what pages exist
- No Open Graph tags — no rich previews when shared
- No per-page metadata — every page shows "OnlySnow" as title
- No structured data (JSON-LD) — no rich snippets in search results
- No `generateMetadata()` on resort pages — generic titles
- No `generateStaticParams()` — pages aren't pre-rendered
- `dynamic = 'force-dynamic'` on resort pages — zero caching
- Almost all content behind authentication — Google can't see it
- Auth pages not marked `noindex` — could get indexed accidentally
- No canonical tags — risk of duplicate content

---

## Implementation Plan

### Phase 1: SEO Foundation (Week 1)

#### Story 404.1: robots.txt and Sitemap

**Priority:** P0 — Without these, nothing else matters

Create `robots.txt` and dynamic `sitemap.ts` so Google can discover and crawl public pages.

**robots.txt:**
```
User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /onboarding
Disallow: /settings
Disallow: /notifications
Disallow: /auth
Disallow: /api/

Sitemap: https://onlysnow.app/sitemap.xml
```

**sitemap.ts** (Next.js dynamic sitemap):
- Homepage
- All resort pages (`/resort/[slug]`) with `lastModified` from conditions data
- All region pages (once created)
- Static content pages (about, guides)
- Revalidate sitemap every 6 hours

**Files to create:**
- `apps/frontend/src/app/robots.ts`
- `apps/frontend/src/app/sitemap.ts`

**Acceptance Criteria:**
- [ ] `robots.txt` accessible at production URL
- [ ] `sitemap.xml` lists all public pages with lastmod dates
- [ ] Auth routes disallowed from crawling
- [ ] Sitemap submitted to Google Search Console

---

#### Story 404.2: Global Metadata & Open Graph

**Priority:** P0

Add comprehensive metadata to root layout and per-page metadata generation.

**Root layout (`layout.tsx`):**
- Open Graph tags: `og:title`, `og:description`, `og:image`, `og:type`, `og:url`, `og:site_name`
- Twitter Card tags: `twitter:card` (summary_large_image), `twitter:title`, `twitter:description`, `twitter:image`
- Canonical URL
- Favicon reference
- Theme color

**Resort detail page — `generateMetadata()`:**
```typescript
// Dynamic metadata per resort
export async function generateMetadata({ params }) {
  const resort = await fetchResort(params.id);
  return {
    title: `${resort.name} Snow Report & Forecast | OnlySnow`,
    description: `${resort.name} ski conditions: ${resort.snowfall24h}" new snow, ${resort.baseDepth}" base. 10-day forecast, lift status, and drive times from your location.`,
    openGraph: {
      title: `${resort.name} — ${resort.snowfall24h}" New Snow`,
      description: `...`,
      type: 'website',
    },
  };
}
```

**Files to modify:**
- `apps/frontend/src/app/layout.tsx` — global metadata
- `apps/frontend/src/app/resort/[id]/page.tsx` — `generateMetadata()`
- `apps/frontend/src/app/page.tsx` — homepage metadata

**Acceptance Criteria:**
- [ ] Every public page has unique title and description
- [ ] Open Graph tags render correctly (test with Facebook debugger)
- [ ] Twitter Cards render correctly (test with Twitter Card validator)
- [ ] Resort pages have dynamic, data-driven titles

---

#### Story 404.3: Structured Data (JSON-LD Schema Markup)

**Priority:** P1

Add schema.org markup to enable rich snippets in search results.

**Homepage — Organization schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "OnlySnow",
  "url": "https://onlysnow.app",
  "description": "Tell us where you live and what pass you have. We'll tell you where to ski and when.",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://onlysnow.app/resort/{search_term}",
    "query-input": "required name=search_term"
  }
}
```

**Resort pages — SkiResort schema:**
```json
{
  "@context": "https://schema.org",
  "@type": "SkiResort",
  "name": "Vail",
  "geo": { "@type": "GeoCoordinates", "latitude": 39.64, "longitude": -106.37 },
  "address": { "@type": "PostalAddress", "addressRegion": "CO" },
  "elevation": { "@type": "QuantitativeValue", "value": 11570, "unitCode": "FOT" },
  "url": "https://onlysnow.app/resort/vail",
  "dateModified": "2026-02-08T14:30:00Z"
}
```

**BreadcrumbList schema on all pages:**
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://onlysnow.app" },
    { "@type": "ListItem", "position": 2, "name": "Vail", "item": "https://onlysnow.app/resort/vail" }
  ]
}
```

**Files to create/modify:**
- `apps/frontend/src/components/JsonLd.tsx` — reusable JSON-LD component
- `apps/frontend/src/app/layout.tsx` — Organization/WebSite schema
- `apps/frontend/src/app/resort/[id]/page.tsx` — SkiResort schema

**Acceptance Criteria:**
- [ ] Google Rich Results Test validates all schema
- [ ] SkiResort schema on every resort page with dynamic data
- [ ] BreadcrumbList on all multi-level pages

---

#### Story 404.4: Make Resort Pages Public & Cacheable

**Priority:** P0

Resort pages are the highest-value SEO asset. They must be publicly accessible and efficiently cached.

**Changes:**
1. Remove authentication requirement from `/resort/[id]` (keep personalized features for logged-in users, but show public data to everyone)
2. Change `dynamic = 'force-dynamic'` to ISR with `revalidate = 3600` (1 hour)
3. Add `generateStaticParams()` to pre-render top resort pages at build time
4. Add `noindex` meta tag to auth routes (`/auth/*`, `/settings`, `/onboarding`)

**Files to modify:**
- `apps/frontend/src/app/resort/[id]/page.tsx` — ISR + generateStaticParams
- `apps/frontend/src/app/auth/signin/page.tsx` — add noindex
- `apps/frontend/src/app/settings/page.tsx` — add noindex
- `apps/frontend/src/app/onboarding/page.tsx` — add noindex

**Acceptance Criteria:**
- [ ] `/resort/vail` accessible without login
- [ ] Resort pages cached and revalidated every hour
- [ ] Top 50 resort pages pre-rendered at build time
- [ ] Auth routes have `<meta name="robots" content="noindex">`

---

### Phase 2: Content That Ranks (Weeks 2-4)

#### Story 404.5: Public Resort Index Page

**Priority:** P1

Create a public `/resorts` page listing all resorts — the hub page for internal linking.

**Page:** `/resorts`
- All resorts grouped by region/state
- Current conditions summary (snowfall, status)
- Links to individual resort pages
- Filter by pass type, state, conditions
- FAQPage schema for "Which resorts are on Epic Pass?" etc.

**Also create:** `/resorts/[pass-type]` pages
- `/resorts/epic` — All Epic Pass resorts with conditions
- `/resorts/ikon` — All Ikon Pass resorts with conditions
- Target keywords: "epic pass resorts", "ikon pass resorts" (5-10K monthly volume each)

**Files to create:**
- `apps/frontend/src/app/resorts/page.tsx`
- `apps/frontend/src/app/resorts/[passType]/page.tsx`

**Acceptance Criteria:**
- [ ] `/resorts` lists all resorts with current conditions
- [ ] Internal links to every resort detail page
- [ ] Pass-type filtered views at `/resorts/epic`, `/resorts/ikon`
- [ ] FAQPage schema on pass pages

---

#### Story 404.6: Region Pages (Programmatic SEO)

**Priority:** P1

Create public region pages — these target the highest-intent search queries.

**Pages:** `/regions/[region-slug]`
- Example: `/regions/vail-valley`, `/regions/park-city`, `/regions/lake-tahoe`
- Current conditions across all resorts in region
- 5-day forecast summary
- Best resort recommendation (data-driven)
- Drive times from nearest major cities
- Pass availability breakdown

**Target keywords:**
- "skiing in [region]" (e.g., "skiing in Park City" — 5-10K/mo)
- "[region] snow report" (e.g., "Vail snow report" — 1-5K/mo)
- "[region] ski conditions" (1-5K/mo per region)

**Files to create:**
- `apps/frontend/src/app/regions/page.tsx` — regions index
- `apps/frontend/src/app/regions/[slug]/page.tsx` — region detail

**Acceptance Criteria:**
- [ ] Region pages generated for all chase regions
- [ ] Each page has unique metadata and SkiResort aggregate schema
- [ ] Internal links to resort detail pages within each region
- [ ] `lastModified` timestamps visible and in structured data

---

#### Story 404.7: "Best Skiing Near [City]" Pages

**Priority:** P1 — This is the keyword cluster nobody owns

Create location-aware landing pages for major metro areas.

**Pages:** `/near/[city-slug]`
- Example: `/near/denver`, `/near/salt-lake-city`, `/near/philadelphia`, `/near/new-york`
- Resorts within driving distance, sorted by conditions
- Drive times to each resort
- Pass-type breakdown
- "Best skiing near Denver this weekend" — updated weekly

**Target keywords (low competition, high intent):**
- "best skiing near Denver" (~2K/mo)
- "ski resorts near Philadelphia" (~1.5K/mo)
- "skiing near New York" (~3K/mo)
- "best skiing within 3 hours of [city]"
- "where to ski this weekend near [city]"

**Initial cities (25):**
Denver, Salt Lake City, Seattle, Portland, San Francisco, Los Angeles, New York, Boston, Philadelphia, Washington DC, Chicago, Minneapolis, Detroit, Pittsburgh, Albany, Burlington VT, Reno, Boise, Missoula, Albuquerque, Colorado Springs, Spokane, Anchorage, Hartford, Richmond

**Files to create:**
- `apps/frontend/src/app/near/[city]/page.tsx`
- `apps/frontend/src/lib/city-data.ts` — city coordinates and nearby resort mapping

**Acceptance Criteria:**
- [ ] 25 city pages live with unique metadata
- [ ] Drive times shown for each resort
- [ ] Pass-type badges on each resort card
- [ ] Updated conditions data via ISR
- [ ] FAQPage schema: "What are the best ski resorts near Denver?"

---

### Phase 3: Authority Building (Weeks 4-8)

#### Story 404.8: Weekly "Where to Ski This Weekend" Content

**Priority:** P2

Create an auto-generated weekly article targeting the highest-intent query in skiing.

**Page:** `/this-weekend`
- Updated every Thursday
- Top 10 recommendations based on forecast data
- Grouped by region
- Pass-aware recommendations
- AI-generated narrative (Claude) summarizing conditions

**Target keywords:**
- "where to ski this weekend" (~5K/mo, peak season)
- "best skiing this weekend" (~3K/mo)
- "powder alert this weekend" (~1K/mo)

**Files to create:**
- `apps/frontend/src/app/this-weekend/page.tsx`
- Backend endpoint or build-time generation for weekly content

**Acceptance Criteria:**
- [ ] Page updates automatically each Thursday
- [ ] Unique, data-driven content (not templated)
- [ ] Visible "Updated: Thursday, Feb 6, 2026" timestamp
- [ ] Article schema with `dateModified`
- [ ] Internal links to region and resort pages

---

#### Story 404.9: Embeddable Snow Widget (Backlink Strategy)

**Priority:** P2

Create an embeddable widget that resort websites and travel blogs can add to their pages — the strategy that gave Snow-Forecast.com 12,700 backlinks.

**Widget:** `<script src="https://onlysnow.app/widget/[resort-slug].js">`
- Shows current conditions: snowfall, forecast, status
- Links back to OnlySnow resort page (backlink)
- Light/dark theme
- Responsive sizing

**Target adopters:**
- Resort marketing pages
- Travel/tourism blogs
- Local ski shop websites
- Mountain town chamber of commerce sites

**Files to create:**
- `apps/frontend/src/app/widget/[slug]/route.ts` — widget JS endpoint
- Widget landing page at `/widgets` explaining how to embed

**Acceptance Criteria:**
- [ ] Widget renders correctly on third-party sites
- [ ] Each widget embed creates a dofollow backlink to OnlySnow
- [ ] Widget loads in <500ms
- [ ] Landing page with copy-paste embed code

---

#### Story 404.10: Core Web Vitals Optimization

**Priority:** P2

Google uses Core Web Vitals as a ranking signal. The app needs optimization.

**Issues identified:**
- Homepage is client-rendered (`"use client"`) — slow FCP
- Onboarding component is 842 lines of client-side JS
- `force-dynamic` prevents any caching
- No image optimization for resort/condition images

**Fixes:**
1. Convert homepage splash to server component (or hybrid)
2. Code-split large client components
3. Implement Next.js Image optimization
4. Add `loading="lazy"` to below-fold images
5. Preconnect to API and external resources

**Targets:**
- LCP < 2.5s
- FID < 100ms
- CLS < 0.1

**Acceptance Criteria:**
- [ ] Lighthouse performance score > 80 on resort pages
- [ ] Core Web Vitals pass in Google Search Console
- [ ] Homepage FCP < 1.5s

---

### Phase 4: Scale & Dominate (Weeks 8-12)

#### Story 404.11: Programmatic Pass Comparison Pages

**Priority:** P3

**Pages:** `/compare/[pass1]-vs-[pass2]`
- `/compare/epic-vs-ikon` — "Epic vs Ikon" (~1.9K/mo)
- `/compare/epic-vs-ikon/colorado` — Regional comparison
- Data-driven: resort count, total terrain, current conditions, price
- Updated conditions make these pages "fresh" even though the structure is evergreen

---

#### Story 404.12: Google Search Console Setup & Monitoring

**Priority:** P1 (do early, but listed here for completeness)

- Verify site ownership in Google Search Console
- Submit sitemap
- Monitor indexing status
- Track keyword rankings
- Set up performance alerts

---

#### Story 404.13: AI Overviews Optimization

**Priority:** P3

Google AI Overviews appear in 50%+ of searches and cite from 5-6 websites. Optimize for citation.

**Tactics:**
- Structure content with clear question-answer format
- Add FAQPage schema to all content pages
- Write concise, authoritative first paragraphs (these get pulled into AI Overviews)
- Ensure E-E-A-T signals: show data sources, update timestamps, methodology transparency

---

## Keyword Strategy Summary

### Tier 1: Own These First (Low Competition, High Intent)
| Keyword Pattern | Volume | Competition | Page |
|----------------|--------|-------------|------|
| best skiing near [city] | 1-3K each | Low | `/near/[city]` |
| [pass] resorts conditions | 2-5K | Medium | `/resorts/[pass]` |
| where to ski this weekend | 3-5K | Medium | `/this-weekend` |
| [region] snow report | 1-5K each | Medium | `/regions/[slug]` |

### Tier 2: Compete For (Medium Competition)
| Keyword Pattern | Volume | Competition | Page |
|----------------|--------|-------------|------|
| [resort] snow report | 1-5K each | Medium | `/resort/[slug]` |
| [resort] ski conditions | 1-5K each | Medium | `/resort/[slug]` |
| epic vs ikon | ~1.9K | Medium | `/compare/epic-vs-ikon` |
| where is it snowing | 3-8K | Medium | `/this-weekend` |

### Tier 3: Long-Term (High Competition)
| Keyword Pattern | Volume | Competition | Page |
|----------------|--------|-------------|------|
| ski resorts | 450K | Very High | `/resorts` |
| snow report | 5-20K | High | `/` |
| ski conditions | 10-20K | High | `/` |

---

## Measurement & Success Criteria

### 3-Month Targets
- [ ] 50+ pages indexed in Google
- [ ] 500+ organic visits/week during ski season
- [ ] Top 10 ranking for at least 5 "best skiing near [city]" keywords
- [ ] Core Web Vitals passing on all public pages

### 6-Month Targets
- [ ] 200+ pages indexed
- [ ] 5,000+ organic visits/week during ski season
- [ ] 50+ backlinks from resort/travel sites (via widget)
- [ ] Top 5 for "where to ski this weekend" + 10 city-specific queries

### 12-Month Targets
- [ ] Top 3 for "best skiing near [city]" for 15+ cities
- [ ] 20,000+ organic visits/week during peak season
- [ ] Domain Rating > 30
- [ ] Featured in Google AI Overviews for 10+ ski queries

---

## Dependencies

- **Epic 403** (Resort conditions data) — SEO pages need real condition data to show, not 0"
- **Epic 401** (Scraper pipeline) — More condition data = richer page content = better rankings
- **Vercel deployment** — Need production domain (`onlysnow.app`) verified in Search Console

## Not In Scope
- Paid search / Google Ads (separate growth channel)
- Social media strategy (separate epic)
- Email marketing / newsletter (separate epic)
- Content in languages other than English
- Mobile app store optimization (ASO)
