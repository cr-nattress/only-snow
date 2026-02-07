# OnlySnow Free Data Gathering Strategy
## Leveraging Browser APIs, LLMs, and Free APIs

**Last Updated:** February 2026
**Version:** 1.0
**Cost Target:** $0-500/month (vs $7,000+/month for commercial APIs)

---

## Executive Summary

This document outlines OnlySnow's **zero-cost data gathering strategy** using browser automation, LLM-powered extraction, and free APIs to build a comprehensive ski resort database **without expensive commercial APIs like OnTheSnow ($500-5K/month)**.

**Core Strategy:**
1. **Free Weather APIs** — Open-Meteo (no API key), NOAA (public domain)
2. **Browser-Based Scraping** — Playwright to extract resort websites (legal, robots.txt compliant)
3. **LLM Data Extraction** — Claude API ($15/1M tokens) to parse unstructured HTML into structured JSON
4. **Free Geocoding** — Convert resort addresses to coordinates
5. **Community Data** — OpenStreetMap, SNOTEL (USDA public data)

**Cost Comparison:**
| Approach | Monthly Cost | Coverage | Data Quality |
|---|---|---|---|
| **OnTheSnow API** | $500-5,000 | 2,000 resorts | ⭐⭐⭐⭐⭐ Excellent |
| **OnlySnow Free Strategy** | $50-500 | 500-1,000 resorts | ⭐⭐⭐⭐ Very Good |
| **Savings** | **$450-4,500/month** | — | **90% cost reduction** |

---

## Table of Contents

1. [Free API Catalog](#1-free-api-catalog)
2. [Browser-Based Scraping Strategy](#2-browser-based-scraping-strategy)
3. [LLM-Powered Data Extraction](#3-llm-powered-data-extraction)
4. [Legal Compliance Framework](#4-legal-compliance-framework)
5. [Data Architecture](#5-data-architecture)
6. [Implementation Guide](#6-implementation-guide)
7. [Cost Analysis](#7-cost-analysis)
8. [Quality Assurance](#8-quality-assurance)

---

## 1. Free API Catalog

### 1.1 Weather & Snow Data (Free)

#### ⭐ Open-Meteo API (BEST OPTION)

**What It Provides:**
- 16-day weather forecasts (temperature, precipitation, snowfall, wind)
- Multiple weather models: GFS (NOAA), ECMWF, ICON
- Hourly and daily data
- Historical weather data (1940-present)
- No API key required, no registration, no credit card

**Coverage:** Global (any lat/lng coordinates)
**Cost:** Free for non-commercial use (10,000 requests/day)
**API Endpoint:** `https://api.open-meteo.com/v1/forecast`

**Example Request:**
```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=39.64&longitude=-106.37&hourly=temperature_2m,precipitation,snowfall&daily=snowfall_sum&timezone=America/Denver"
```

**Example Response:**
```json
{
  "hourly": {
    "time": ["2026-02-06T00:00", "2026-02-06T01:00"],
    "temperature_2m": [-5.2, -6.1],
    "precipitation": [0.3, 0.5],
    "snowfall": [0.8, 1.2]
  },
  "daily": {
    "time": ["2026-02-06"],
    "snowfall_sum": [25.5]
  }
}
```

**Available Parameters:**
- `snowfall` — Snowfall amount in cm
- `snow_depth` — Snow depth on ground in meters
- `precipitation` — Total precipitation (rain + snow water equivalent)
- `temperature_2m` — Temperature at 2 meters
- `windspeed_10m`, `windgusts_10m` — Wind data
- `weathercode` — WMO weather code (0-99)

**Documentation:** [Open-Meteo Docs](https://open-meteo.com/en/docs)

---

#### NOAA Weather API

**What It Provides:**
- Official U.S. government weather forecasts
- Real-time observations from weather stations
- Hourly forecasts for 7 days
- Severe weather alerts

**Coverage:** United States only
**Cost:** Free (public domain, U.S. government data)
**API Endpoint:** `https://api.weather.gov/`

**Example Request:**
```bash
# Get forecast for a location
curl "https://api.weather.gov/points/39.64,-106.37"
# Returns forecast URLs for that location
```

**Documentation:** [NOAA Weather API](https://www.weather.gov/documentation/services-web-api)

---

### 1.2 Snowpack Data (Free)

#### SNOTEL (USDA NRCS)

**What It Provides:**
- Snow Water Equivalent (SWE) — Water content in snowpack
- Snow depth in inches
- Precipitation (cumulative and daily)
- Temperature (air and soil)
- Snowpack % of normal (historical average)

**Coverage:** 800+ automated stations in Western U.S. (AK, AZ, CA, CO, ID, MT, NV, NM, OR, UT, WA, WY)
**Cost:** Free (public domain, USDA data)
**API Endpoint:** AWDB (Air and Water Database) web service

**Example Request:**
```bash
# Get latest data from a SNOTEL station
curl "https://wcc.sc.egov.usda.gov/reportGenerator/view_csv/customSingleStationReport/daily/719:CO:SNTL%7Cid=%22%22%7Cname/CurrentWY/SNWD::value,WTEQ::value,PREC::value"
```

**Web Tools:**
- [SNOTEL Interactive Map](https://www.nrcs.usda.gov/resources/data-and-reports/snow-and-water-interactive-map)
- [Report Generator](https://wcc.sc.egov.usda.gov/reportGenerator/)

**Use Case for OnlySnow:**
- Find SNOTEL stations within 50km of each resort
- Use snowpack data to enhance snow reports (e.g., "110% of normal snowpack")

**Documentation:** [SNOTEL Data Access](https://www.nrcs.usda.gov/resources/data-and-reports/snow-and-water-interactive-map)

---

### 1.3 Geocoding & Maps (Free)

#### Nominatim (OpenStreetMap Geocoding)

**What It Provides:**
- Forward geocoding: Address → lat/lng
- Reverse geocoding: Lat/lng → address
- Powered by OpenStreetMap data

**Coverage:** Global
**Cost:** Free (usage limit: 1 request/second)
**API Endpoint:** `https://nominatim.openstreetmap.org/`

**Example Request:**
```bash
# Forward geocoding (address to coordinates)
curl "https://nominatim.openstreetmap.org/search?q=Vail+Resort+Colorado&format=json"

# Response:
[{
  "lat": "39.6403",
  "lon": "-106.3742",
  "display_name": "Vail, Eagle County, Colorado, USA"
}]
```

**Rate Limits:**
- 1 request per second
- Must provide a valid User-Agent header
- Do not abuse (or use commercial alternatives)

**Documentation:** [Nominatim API](https://nominatim.org/release-docs/latest/api/Overview/)

---

#### Geocode.maps.co (Free Geocoding)

**What It Provides:**
- Forward and reverse geocoding
- Higher rate limits than Nominatim

**Coverage:** Global
**Cost:** Free (10,000 requests/month)
**API Endpoint:** `https://geocode.maps.co/`

**Example Request:**
```bash
curl "https://geocode.maps.co/search?q=Vail+Colorado"
```

**Documentation:** [Geocode Maps API](https://geocode.maps.co/)

---

### 1.4 Trail Maps (Free)

#### OpenStreetMap (OSM) via Overpass API

**What It Provides:**
- Ski piste data (trails with difficulty, grooming status)
- Ski lift locations (chairlifts, gondolas, surface lifts)
- Ski area boundaries
- Base lodge locations

**Coverage:** 100,000+ km of mapped pistes worldwide
**Cost:** Free (Open Database License)
**API Endpoint:** `https://overpass-api.de/api/interpreter`

**Example Query:**
```bash
# Get all ski trails (pistes) in a bounding box
curl -X POST "https://overpass-api.de/api/interpreter" \
  -d '[out:json];way["piste:type"="downhill"](39.6,−106.4,39.7,−106.3);out geom;'
```

**Response:** GeoJSON with trail coordinates, difficulty, name

**Tools:**
- [Overpass Turbo](https://overpass-turbo.eu/) — Interactive query builder
- [OpenSnowMap](https://www.opensnowmap.org/) — Visualize ski areas
- [OpenSkiMap](https://openskimap.org/) — Check OSM coverage

**Documentation:** [OSM Pistes Wiki](https://wiki.openstreetmap.org/wiki/Pistes)

---

### 1.5 Free API Summary Table

| API | What It Provides | Rate Limit | API Key? | Cost |
|---|---|---|---|---|
| **Open-Meteo** | 16-day weather, snowfall | 10K req/day | ❌ No | Free |
| **NOAA Weather** | U.S. weather forecasts | No published limit | ❌ No | Free |
| **SNOTEL** | Snowpack data (800+ stations) | No published limit | ❌ No | Free |
| **Nominatim** | Geocoding (OSM) | 1 req/sec | ❌ No | Free |
| **Geocode.maps.co** | Geocoding | 10K req/month | ❌ No | Free |
| **Overpass API** | Trail maps (OSM) | No published limit | ❌ No | Free |

**Total Monthly Cost:** $0 🎉

---

## 2. Browser-Based Scraping Strategy

### 2.1 Why Scrape Resort Websites?

**Gap in Free APIs:**
- Free APIs provide weather, but NOT real-time resort conditions
- Resort websites have: lift status, trail counts, grooming reports, surface conditions
- Example: "32 of 34 lifts open, 185 of 195 trails open, packed powder"

**Legal Scraping:**
- Only scrape publicly accessible pages (no login required)
- Respect `robots.txt`
- Rate limit (1-2 requests per second)
- Don't scrape copyrighted assets (logos, photos, maps)
- Only extract factual data (trail counts, lift status, snow depth)

### 2.2 Playwright vs Puppeteer

**Comparison:**

| Feature | Playwright | Puppeteer |
|---|---|---|
| **Browser Support** | Chromium, Firefox, WebKit (Safari) | Chromium only |
| **Speed** | ⚡ Faster in some scenarios | ⚡⚡ Fastest overall |
| **Auto-wait** | Built-in (waits for elements) | Manual |
| **Stealth Mode** | Better (harder to detect) | Good |
| **Language Support** | Node.js, Python, C#, Java | Node.js, Python |
| **Best For** | Multi-browser testing, complex scraping | Simple scraping, speed-critical |

**Recommendation:** Use **Playwright** for OnlySnow (better stealth, multi-browser, auto-wait)

**Sources:**
- [Playwright vs Puppeteer 2026](https://research.aimultiple.com/playwright-vs-puppeteer/)
- [Browsercat: Playwright vs Puppeteer](https://www.browsercat.com/post/playwright-vs-puppeteer-web-scraping-comparison)

---

### 2.3 Scraping Architecture

```
Browser Automation (Playwright)
    ↓
Navigate to Resort Website
    ↓
Extract HTML Content
    ↓
LLM (Claude API) — Parse HTML → Structured JSON
    ↓
Store in Supabase
```

**Key Components:**

1. **Target Selector** — Identify what to scrape (trail report page, snow report page)
2. **Browser Automation** — Playwright navigates, waits for content, extracts HTML
3. **LLM Parser** — Claude converts messy HTML into clean JSON
4. **Validator** — Ensure extracted data is reasonable (e.g., snow depth < 1000cm)
5. **Storage** — Save to Supabase with metadata (source URL, scraped_at timestamp)

---

### 2.4 Playwright Scraper Template

**Install:**
```bash
npm install playwright
```

**Example Script:**
```typescript
import { chromium } from 'playwright';

async function scrapeResortSnowReport(resortUrl: string) {
  // Launch browser in headless mode
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: 'OnlySnow-Bot/1.0 (contact@onlysnow.com)', // Identify ourselves
    viewport: { width: 1920, height: 1080 }
  });

  const page = await context.newPage();

  try {
    // Navigate to snow report page
    await page.goto(resortUrl, { waitUntil: 'networkidle' });

    // Wait for key elements to load (adjust selector based on resort)
    await page.waitForSelector('.snow-report', { timeout: 10000 });

    // Extract HTML content
    const htmlContent = await page.content();

    // Close browser
    await browser.close();

    return htmlContent;
  } catch (error) {
    console.error(`Failed to scrape ${resortUrl}:`, error);
    await browser.close();
    return null;
  }
}

// Example usage
const vailSnowReportUrl = 'https://www.vail.com/the-mountain/mountain-conditions/trail-and-lift-status.aspx';
const html = await scrapeResortSnowReport(vailSnowReportUrl);
console.log(html.substring(0, 500)); // Preview first 500 chars
```

---

### 2.5 Anti-Detection Best Practices

**Challenge:** Many resort websites use Cloudflare, bot detection, or CAPTCHAs

**Solutions:**

1. **Stealth Plugins**
   ```typescript
   import { chromium } from 'playwright-extra';
   import stealth from 'puppeteer-extra-plugin-stealth';

   chromium.use(stealth());
   ```

2. **Rotate User-Agents**
   ```typescript
   const userAgents = [
     'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) ...',
     'Mozilla/5.0 (Windows NT 10.0; Win64; x64) ...',
     'Mozilla/5.0 (X11; Linux x86_64) ...'
   ];
   const randomUA = userAgents[Math.floor(Math.random() * userAgents.length)];
   ```

3. **Randomize Request Timing**
   ```typescript
   async function randomDelay(min: number, max: number) {
     const delay = Math.random() * (max - min) + min;
     await new Promise(resolve => setTimeout(resolve, delay * 1000));
   }

   await randomDelay(2, 5); // Wait 2-5 seconds between requests
   ```

4. **Use Residential Proxies (if needed)**
   - Services like BrightData, Oxylabs (paid, but cheap: $0.001 per request)
   - Only use if resort blocks datacenter IPs

5. **Respect robots.txt**
   ```typescript
   import robotsParser from 'robots-parser';

   async function checkRobotsTxt(baseUrl: string, path: string): Promise<boolean> {
     const robotsTxtUrl = `${baseUrl}/robots.txt`;
     const response = await fetch(robotsTxtUrl);
     const robotsTxt = await response.text();
     const robots = robotsParser(robotsTxtUrl, robotsTxt);
     return robots.isAllowed(path, 'OnlySnow-Bot');
   }

   // Example
   const allowed = await checkRobotsTxt('https://www.vail.com', '/the-mountain/mountain-conditions/');
   if (!allowed) {
     console.log('Blocked by robots.txt');
     return;
   }
   ```

---

### 2.6 Target Resort Websites (Top 100)

**Examples of Scrapeable Pages:**

| Resort | Snow Report URL | Data Available |
|---|---|---|
| Vail | `vail.com/the-mountain/mountain-conditions/` | Snow depth, lifts, trails, surface |
| Breckenridge | `breckenridge.com/the-mountain/mountain-conditions/` | Snow depth, lifts, trails |
| Aspen | `aspensnowmass.com/ski-snowboard/snow-report` | Snow depth, lifts, trails |
| Jackson Hole | `jacksonhole.com/mountain-report.html` | Snow depth, lifts, trails |
| Alta | `alta.com/conditions/snow-and-weather-report` | Snow depth, snowfall |
| Whistler | `whistlerblackcomb.com/the-mountain/mountain-conditions/` | Snow depth, lifts, trails |

**Scraping Strategy:**
- Phase 1: Manually inspect 20 resort websites, identify common patterns
- Phase 2: Build scrapers for each pattern (Epic resorts, Ikon resorts, independents)
- Phase 3: Use LLM to generalize scraper (handles different HTML structures)

---

## 3. LLM-Powered Data Extraction

### 3.1 Why Use LLMs for Scraping?

**Problem:** Every resort website has different HTML structure
- Vail uses `<div class="snow-depth">150cm</div>`
- Aspen uses `<span id="base-depth">60 inches</span>`
- Jackson Hole uses `<p>Base: 5 feet</p>`

**Traditional Approach:** Write custom CSS selectors for each resort (time-consuming, brittle)

**LLM Approach:** Feed HTML to Claude, ask it to extract structured data (universal, adaptive)

### 3.2 Claude API for Structured Data Extraction

**Claude Features:**
- **Structured Outputs** — Guarantees valid JSON matching your schema
- **Large Context Window** — 200K tokens (can process entire HTML pages)
- **Intelligent Parsing** — Understands context ("5 feet" → convert to cm)
- **Cost-Effective** — $3 per million input tokens, $15 per million output tokens

**Cost Example:**
- Average HTML page: 50KB = ~12,500 tokens
- Claude API cost: $3 / 1M tokens × 12,500 = **$0.0375 per page**
- Scraping 500 resorts daily: 500 × $0.0375 = **$18.75/day** = **$562.50/month**

**Optimization:** Cache extracted data, only re-scrape when data changes (reduce to $100-200/month)

**Sources:**
- [Claude Structured Outputs](https://platform.claude.com/docs/en/build-with-claude/structured-outputs)
- [Anthropic Structured Output Guide](https://towardsdatascience.com/hands-on-with-anthropics-new-structured-output-capabilities/)

---

### 3.3 LLM Extraction Prompt Template

**TypeScript Schema:**
```typescript
interface ResortSnowReport {
  resort_name: string;
  report_date: string; // ISO 8601
  snow_depth_base_cm: number | null;
  snow_depth_summit_cm: number | null;
  snowfall_24h_cm: number | null;
  snowfall_48h_cm: number | null;
  lifts_total: number | null;
  lifts_open: number | null;
  trails_total: number | null;
  trails_open: number | null;
  surface_conditions: string; // e.g., "Powder", "Packed Powder", "Ice"
  updated_at: string; // ISO 8601
}
```

**Claude API Call:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function extractSnowReportFromHTML(
  resortName: string,
  htmlContent: string
): Promise<ResortSnowReport> {
  const prompt = `
Extract ski resort snow report data from the following HTML page for ${resortName}.

HTML Content:
${htmlContent}

Please extract the following data and return it as JSON:
- snow_depth_base_cm: Snow depth at base elevation (convert to centimeters if needed)
- snow_depth_summit_cm: Snow depth at summit (convert to cm)
- snowfall_24h_cm: Snowfall in last 24 hours (convert to cm)
- snowfall_48h_cm: Snowfall in last 48 hours (convert to cm)
- lifts_total: Total number of lifts
- lifts_open: Number of lifts currently open
- trails_total: Total number of trails
- trails_open: Number of trails currently open
- surface_conditions: Description of snow surface (e.g., "Powder", "Packed Powder", "Ice")
- updated_at: When the report was last updated (ISO 8601 format)

If a field cannot be found, set it to null.
Convert all measurements to metric (cm).
`;

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 1024,
    messages: [{
      role: 'user',
      content: prompt
    }],
    // Use structured outputs (beta feature)
    response_format: {
      type: 'json_schema',
      json_schema: {
        name: 'resort_snow_report',
        strict: true,
        schema: {
          type: 'object',
          properties: {
            resort_name: { type: 'string' },
            report_date: { type: 'string', format: 'date' },
            snow_depth_base_cm: { type: ['number', 'null'] },
            snow_depth_summit_cm: { type: ['number', 'null'] },
            snowfall_24h_cm: { type: ['number', 'null'] },
            snowfall_48h_cm: { type: ['number', 'null'] },
            lifts_total: { type: ['number', 'null'] },
            lifts_open: { type: ['number', 'null'] },
            trails_total: { type: ['number', 'null'] },
            trails_open: { type: ['number', 'null'] },
            surface_conditions: { type: 'string' },
            updated_at: { type: 'string', format: 'date-time' }
          },
          required: ['resort_name', 'report_date']
        }
      }
    }
  });

  const jsonText = response.content[0].text;
  return JSON.parse(jsonText) as ResortSnowReport;
}

// Example usage
const vailHtml = await scrapeResortSnowReport('https://www.vail.com/...');
const snowReport = await extractSnowReportFromHTML('Vail', vailHtml);
console.log(snowReport);
/*
{
  resort_name: "Vail",
  report_date: "2026-02-06",
  snow_depth_base_cm: 150,
  snow_depth_summit_cm: 220,
  snowfall_24h_cm: 25,
  snowfall_48h_cm: 40,
  lifts_total: 34,
  lifts_open: 32,
  trails_total: 195,
  trails_open: 185,
  surface_conditions: "Packed Powder",
  updated_at: "2026-02-06T08:30:00Z"
}
*/
```

---

### 3.4 LLM Cost Optimization

**Challenge:** Claude API costs add up at scale (500 resorts × daily scraping)

**Optimization Strategies:**

1. **Cache HTML Pages (7-Day TTL)**
   - Only fetch new HTML if >24 hours since last scrape
   - Reduces scraping volume by 80%+

2. **Incremental Updates**
   - Only re-scrape if resort's "last updated" timestamp changed
   - Check timestamp via lightweight HEAD request first

3. **Batch Processing**
   - Process multiple resorts in parallel (10-20 concurrent requests)
   - Use async/await to maximize throughput

4. **Use Cheaper Models for Simple Extraction**
   - Claude Haiku (cheaper) for simple pages
   - Claude Sonnet for complex pages
   - Example: Haiku is 10x cheaper ($0.80 per 1M input tokens)

5. **Prompt Optimization**
   - Shorter prompts = fewer tokens
   - Strip unnecessary HTML (remove `<script>`, `<style>`, navigation)

**Optimized Cost:**
- Original: 500 resorts × $0.0375/day = $18.75/day = $562.50/month
- With optimizations (cache 80%, Haiku 50%): **$100-150/month**

---

### 3.5 LLM Use Cases Beyond Scraping

**1. Data Validation & Cleaning**
```typescript
const prompt = `
This snow report has suspicious data:
- Snow depth: 9999cm (unrealistic)
- Lifts open: 100 (resort only has 34 lifts)

Please identify and flag errors, suggest corrections.
`;
```

**2. Data Enrichment**
```typescript
const prompt = `
Enhance this snow report with context:
- Snowfall: 25cm in 24h
- Resort: Crested Butte

Add:
- Is this above/below average for this resort?
- What's the historical 24h record?
- How does this compare to nearby resorts?
`;
```

**3. Natural Language Generation**
```typescript
const prompt = `
Generate a user-friendly summary:
- Resort: Vail
- Snowfall 24h: 25cm
- Lifts open: 32/34
- Surface: Packed Powder

Write 2-sentence summary for app notification.
`;

// Output: "Vail got 10 inches overnight with 94% of lifts open. Expect packed powder conditions on groomed runs."
```

**4. Multi-Source Data Reconciliation**
```typescript
const prompt = `
I have 3 sources of snowfall data for Vail on 2026-02-06:
- Vail.com website: 10 inches
- Open-Meteo API: 25cm
- SNOTEL nearby station: 11 inches

What's the most likely accurate snowfall amount? Explain your reasoning.
`;
```

---

## 4. Legal Compliance Framework

### 4.1 What's Legal to Scrape?

**✅ Legal (Safe to Scrape):**
- **Publicly accessible data** — No login required
- **Factual information** — Snow depth, lift counts, trail counts, temperatures
- **Operating hours** — Open/closed status, opening/closing dates
- **Contact information** — Phone numbers, addresses (public records)
- **Publicly listed prices** — Lift ticket prices (if displayed publicly)

**❌ Illegal/Risky (Do NOT Scrape):**
- **Copyrighted content** — Photos, videos, logos, trail maps, blog posts
- **Behind login walls** — Any data requiring account creation
- **Personal data** — User reviews, forum posts (GDPR/CCPA issues)
- **Rate-limited endpoints** — Aggressive scraping that harms servers
- **Data explicitly prohibited by ToS** — Check Terms of Service

### 4.2 Robots.txt Compliance

**Always check `robots.txt` before scraping:**

**Example: Vail.com robots.txt**
```
User-agent: *
Disallow: /admin/
Disallow: /api/
Allow: /the-mountain/mountain-conditions/
```

**Interpretation:**
- ✅ Can scrape `/the-mountain/mountain-conditions/`
- ❌ Cannot scrape `/admin/` or `/api/`

**Implementation:**
```typescript
import robotsParser from 'robots-parser';

async function isAllowedByRobotsTxt(url: string): Promise<boolean> {
  const parsedUrl = new URL(url);
  const robotsTxtUrl = `${parsedUrl.origin}/robots.txt`;

  try {
    const response = await fetch(robotsTxtUrl);
    const robotsTxt = await response.text();
    const robots = robotsParser(robotsTxtUrl, robotsTxt);

    return robots.isAllowed(url, 'OnlySnow-Bot');
  } catch (error) {
    // If robots.txt doesn't exist, assume allowed
    return true;
  }
}

// Example
const allowed = await isAllowedByRobotsTxt('https://www.vail.com/the-mountain/mountain-conditions/');
console.log(allowed); // true or false
```

### 4.3 Rate Limiting (Be a Good Citizen)

**Best Practices:**
- **Max 1-2 requests per second** per domain
- **Random delays** between requests (2-5 seconds)
- **Respect Retry-After headers** if server returns 429 (Too Many Requests)
- **Identify yourself** in User-Agent: `OnlySnow-Bot/1.0 (contact@onlysnow.com)`

**Implementation:**
```typescript
class RateLimiter {
  private queue: Array<() => Promise<any>> = [];
  private processing = false;
  private lastRequestTime = 0;
  private minDelayMs = 2000; // 2 seconds between requests

  async add<T>(fn: () => Promise<T>): Promise<T> {
    return new Promise((resolve, reject) => {
      this.queue.push(async () => {
        try {
          const result = await fn();
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });

      if (!this.processing) {
        this.processQueue();
      }
    });
  }

  private async processQueue() {
    this.processing = true;

    while (this.queue.length > 0) {
      const now = Date.now();
      const timeSinceLastRequest = now - this.lastRequestTime;

      if (timeSinceLastRequest < this.minDelayMs) {
        await new Promise(resolve => setTimeout(resolve, this.minDelayMs - timeSinceLastRequest));
      }

      const fn = this.queue.shift();
      if (fn) {
        await fn();
        this.lastRequestTime = Date.now();
      }
    }

    this.processing = false;
  }
}

// Usage
const limiter = new RateLimiter();

for (const resort of resorts) {
  limiter.add(async () => {
    const html = await scrapeResortSnowReport(resort.url);
    return html;
  });
}
```

### 4.4 Terms of Service Review

**Before scraping any resort:**
1. Read the Terms of Service (ToS) — Usually at `/terms`, `/legal`, or `/tos`
2. Look for clauses about "automated access", "bots", "scraping"
3. If ToS explicitly prohibits scraping → **Do NOT scrape**

**Example ToS Clauses:**
- ❌ "You may not use automated means (bots, scrapers) to access this site"
- ✅ "You may access public pages for personal, non-commercial use"

**If Unclear:**
- Reach out to resort: "Can OnlySnow scrape your public snow report page for our app?"
- Many resorts are happy to grant permission (free publicity for them)

### 4.5 DMCA Safe Harbor (Takedown Policy)

**If a resort requests removal of their data:**
- Comply immediately (within 24 hours)
- Remove scraped data from database
- Add resort to blacklist (never scrape again)
- Respond politely: "We've removed your data. Would you like to partner instead?"

**Implementation:**
```typescript
// Blacklist table in Supabase
CREATE TABLE scraping_blacklist (
  domain TEXT PRIMARY KEY,
  reason TEXT,
  blacklisted_at TIMESTAMPTZ DEFAULT NOW()
);

// Check before scraping
async function isBlacklisted(url: string): Promise<boolean> {
  const domain = new URL(url).hostname;
  const result = await supabase
    .from('scraping_blacklist')
    .select('domain')
    .eq('domain', domain)
    .single();

  return result.data !== null;
}
```

---

## 5. Data Architecture

### 5.1 Data Sources by Type

| Data Type | Source 1 | Source 2 | Source 3 | Priority |
|---|---|---|---|---|
| **Resort Profiles** | OSM (location) | Resort website (amenities) | Manual entry | OSM → Website → Manual |
| **Snow Depth** | Resort website (scrape) | SNOTEL (nearby) | Open-Meteo (model) | Website → SNOTEL → Open-Meteo |
| **Snowfall Forecast** | Open-Meteo | NOAA (U.S. only) | — | Open-Meteo (primary) |
| **Lift/Trail Status** | Resort website (scrape) | — | — | Website only |
| **Surface Conditions** | Resort website (scrape) | LLM inference | — | Website → LLM guess |
| **Trail Maps** | OpenStreetMap | — | — | OSM only |
| **Drive Times** | OSM routing | — | — | OSM (OSRM) |

### 5.2 Database Schema Updates

**Add `scraped_data` table:**
```sql
CREATE TABLE scraped_data (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,
  source_url TEXT NOT NULL,
  html_content TEXT, -- Raw HTML (for debugging)
  extracted_data JSONB NOT NULL, -- Parsed JSON from LLM
  scraped_at TIMESTAMPTZ DEFAULT NOW(),
  scraper_version TEXT, -- Track scraper code version
  llm_model TEXT, -- e.g., 'claude-sonnet-4-5'
  llm_cost_usd DECIMAL(10, 6), -- Cost of LLM call
  extraction_errors JSONB, -- Any errors during extraction

  UNIQUE(resort_id, scraped_at)
);

CREATE INDEX scraped_data_resort_id_idx ON scraped_data(resort_id);
CREATE INDEX scraped_data_scraped_at_idx ON scraped_data(scraped_at DESC);
```

**Add `data_quality_flags` table:**
```sql
CREATE TABLE data_quality_flags (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT REFERENCES resorts(id),
  data_type TEXT, -- 'snow_depth', 'lift_count', etc.
  flagged_value JSONB, -- The suspicious data
  reason TEXT, -- Why it was flagged
  severity TEXT, -- 'error', 'warning', 'info'
  flagged_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);
```

---

### 5.3 Data Pipeline (Free APIs + Scraping + LLM)

```
┌─────────────────────────────────────────────────────────┐
│                    INGESTION LAYER                       │
└─────────────────────────────────────────────────────────┘
              │                    │                    │
    ┌─────────┴────────┐  ┌────────┴─────────┐  ┌─────┴──────┐
    │  Free APIs       │  │  Browser Scraping │  │  OSM Data  │
    │                  │  │                   │  │            │
    │  - Open-Meteo    │  │  - Playwright     │  │  - Overpass│
    │  - NOAA          │  │  - Rate limiter   │  │  - Trail   │
    │  - SNOTEL        │  │  - Robots.txt     │  │    maps    │
    └─────────┬────────┘  └────────┬──────────┘  └─────┬──────┘
              │                    │                    │
              ├────────────────────┴────────────────────┤
              │                                         │
    ┌─────────┴─────────────────────────────────────────┴──────┐
    │              LLM PROCESSING LAYER (Claude API)            │
    │                                                            │
    │  - Parse HTML → Structured JSON                           │
    │  - Validate data (flag anomalies)                         │
    │  - Enrich data (add context)                              │
    │  - Generate summaries                                     │
    └─────────┬──────────────────────────────────────────────────┘
              │
    ┌─────────┴──────────┐
    │   DATA VALIDATION  │
    │                    │
    │  - Range checks    │
    │  - Multi-source    │
    │    reconciliation  │
    │  - Quality scoring │
    └─────────┬──────────┘
              │
    ┌─────────┴──────────┐
    │   SUPABASE DB      │
    │                    │
    │  - resorts         │
    │  - snow_reports    │
    │  - scraped_data    │
    │  - weather_fcst    │
    └────────────────────┘
```

---

## 6. Implementation Guide

### 6.1 Phase 1: Free API Integration (Week 1-2)

**Goal:** Get weather forecasts for 500 resorts using Open-Meteo

**Steps:**
1. Set up cron job to run daily (8am UTC)
2. For each resort in database:
   - Fetch 16-day forecast from Open-Meteo
   - Store in `weather_forecasts` table
   - Mark source as `'open-meteo'`

**Code:**
```typescript
async function fetchOpenMeteoForecast(lat: number, lng: number) {
  const url = `https://api.open-meteo.com/v1/forecast?` +
    `latitude=${lat}&longitude=${lng}&` +
    `daily=snowfall_sum,temperature_2m_max,temperature_2m_min,windspeed_10m_max&` +
    `timezone=auto`;

  const response = await fetch(url);
  const data = await response.json();

  return data.daily;
}

async function ingestOpenMeteoForAllResorts() {
  const resorts = await supabase.from('resorts').select('id, latitude, longitude');

  for (const resort of resorts.data) {
    const forecast = await fetchOpenMeteoForecast(resort.latitude, resort.longitude);

    for (let i = 0; i < forecast.time.length; i++) {
      await supabase.from('weather_forecasts').upsert({
        resort_id: resort.id,
        forecast_date: forecast.time[i],
        forecast_generated_at: new Date().toISOString(),
        elevation: 'base', // Open-Meteo doesn't differentiate elevation
        snow_cm: forecast.snowfall_sum[i],
        temp_high: forecast.temperature_2m_max[i],
        temp_low: forecast.temperature_2m_min[i],
        wind_speed: forecast.windspeed_10m_max[i],
        source: 'open-meteo'
      });
    }

    // Rate limit: Wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}
```

**Cost:** $0
**Coverage:** 500 resorts, 16-day forecasts

---

### 6.2 Phase 2: Web Scraping Setup (Week 3-4)

**Goal:** Scrape snow reports from 100 resorts daily

**Steps:**
1. Create list of 100 target resorts with snow report URLs
2. Build Playwright scraper with rate limiting
3. Test scraper on 10 resorts, verify robots.txt compliance
4. Set up cron job to run daily (6am local time for each resort)

**Code (Example Scraper):**
```typescript
import { chromium } from 'playwright';
import robotsParser from 'robots-parser';

interface ScraperConfig {
  resort_id: number;
  resort_name: string;
  snow_report_url: string;
}

async function scrapeResort(config: ScraperConfig) {
  // 1. Check robots.txt
  const allowed = await isAllowedByRobotsTxt(config.snow_report_url);
  if (!allowed) {
    console.log(`Blocked by robots.txt: ${config.resort_name}`);
    return null;
  }

  // 2. Check blacklist
  const blacklisted = await isBlacklisted(config.snow_report_url);
  if (blacklisted) {
    console.log(`Blacklisted: ${config.resort_name}`);
    return null;
  }

  // 3. Launch browser
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    // 4. Navigate to snow report
    await page.goto(config.snow_report_url, { waitUntil: 'networkidle', timeout: 30000 });

    // 5. Extract HTML
    const html = await page.content();

    // 6. Close browser
    await browser.close();

    // 7. Store raw HTML
    await supabase.from('scraped_data').insert({
      resort_id: config.resort_id,
      source_url: config.snow_report_url,
      html_content: html,
      extracted_data: {}, // Will be filled by LLM later
      scraped_at: new Date().toISOString()
    });

    return html;
  } catch (error) {
    console.error(`Failed to scrape ${config.resort_name}:`, error);
    await browser.close();
    return null;
  }
}

// Run scraper for all resorts
async function scrapeAllResorts() {
  const configs: ScraperConfig[] = [
    { resort_id: 1, resort_name: 'Vail', snow_report_url: 'https://www.vail.com/...' },
    { resort_id: 2, resort_name: 'Breckenridge', snow_report_url: 'https://www.breckenridge.com/...' },
    // ... 98 more resorts
  ];

  const limiter = new RateLimiter(); // 2 seconds between requests

  for (const config of configs) {
    await limiter.add(async () => {
      const html = await scrapeResort(config);
      return html;
    });
  }
}
```

**Cost:** $0 (browser automation is free)
**Coverage:** 100 resorts, daily updates

---

### 6.3 Phase 3: LLM Extraction (Week 5-6)

**Goal:** Use Claude API to parse scraped HTML into structured JSON

**Steps:**
1. Sign up for Anthropic Claude API
2. Set up API key in environment variables
3. Build extraction function with structured outputs
4. Process all scraped HTML (batch processing)
5. Store extracted data in `snow_reports` table

**Code:**
```typescript
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function extractAllScrapedData() {
  // Get all scraped HTML from last 24 hours that hasn't been processed
  const scraped = await supabase
    .from('scraped_data')
    .select('id, resort_id, html_content')
    .is('extracted_data', null)
    .gte('scraped_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

  for (const record of scraped.data) {
    try {
      const extracted = await extractSnowReportFromHTML('Resort', record.html_content);

      // Update scraped_data table with extracted JSON
      await supabase
        .from('scraped_data')
        .update({
          extracted_data: extracted,
          llm_model: 'claude-sonnet-4-5',
          llm_cost_usd: 0.0375 // Estimate
        })
        .eq('id', record.id);

      // Insert into snow_reports table
      await supabase.from('snow_reports').upsert({
        resort_id: record.resort_id,
        report_date: extracted.report_date,
        depth_base: extracted.snow_depth_base_cm,
        depth_summit: extracted.snow_depth_summit_cm,
        snowfall_24h: extracted.snowfall_24h_cm,
        snowfall_48h: extracted.snowfall_48h_cm,
        lifts_total: extracted.lifts_total,
        lifts_open: extracted.lifts_open,
        runs_total: extracted.trails_total,
        runs_open: extracted.trails_open,
        surface_type_summit: extracted.surface_conditions,
        source: 'scraped',
        updated_at: new Date().toISOString()
      });

      console.log(`Processed resort_id ${record.resort_id}`);
    } catch (error) {
      console.error(`LLM extraction failed for resort_id ${record.resort_id}:`, error);
    }

    // Rate limit: 10 requests per minute (Claude API limit)
    await new Promise(resolve => setTimeout(resolve, 6000));
  }
}
```

**Cost:** $100-200/month (with optimization)
**Coverage:** 100 resorts, daily updates

---

### 6.4 Phase 4: OSM Trail Maps (Week 7-8)

**Goal:** Get interactive trail maps for 200 resorts from OpenStreetMap

**Steps:**
1. Use Overpass API to query pistes (ski trails) by bounding box
2. Store GeoJSON in `trail_maps` table
3. Set up weekly refresh (OSM data doesn't change often)

**Code:**
```typescript
async function fetchOSMTrailMap(
  resort_id: number,
  bbox: [number, number, number, number] // [minLat, minLng, maxLat, maxLng]
) {
  const [minLat, minLng, maxLat, maxLng] = bbox;

  // Overpass API query for ski pistes
  const query = `
    [out:json];
    (
      way["piste:type"="downhill"](${minLat},${minLng},${maxLat},${maxLng});
      relation["piste:type"="downhill"](${minLat},${minLng},${maxLat},${maxLng});
    );
    out geom;
  `;

  const response = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query
  });

  const data = await response.json();

  // Convert to GeoJSON
  const geojson = {
    type: 'FeatureCollection',
    features: data.elements.map((element: any) => ({
      type: 'Feature',
      geometry: {
        type: 'LineString',
        coordinates: element.geometry.map((node: any) => [node.lon, node.lat])
      },
      properties: {
        name: element.tags?.name || 'Unnamed Trail',
        difficulty: element.tags?.['piste:difficulty'] || 'unknown',
        grooming: element.tags?.['piste:grooming'] || 'unknown'
      }
    }))
  };

  // Store in database
  await supabase.from('trail_maps').upsert({
    resort_id,
    geojson,
    piste_count_total: geojson.features.length,
    data_source: 'openstreetmap',
    last_updated: new Date().toISOString()
  });

  return geojson;
}

// Example: Fetch trail map for Vail
const vailBbox: [number, number, number, number] = [39.6, -106.42, 39.68, -106.32];
await fetchOSMTrailMap(1, vailBbox);
```

**Cost:** $0
**Coverage:** 200 resorts (limited by OSM data availability)

---

## 7. Cost Analysis

### 7.1 Monthly Cost Breakdown

| Component | Cost | Notes |
|---|---|---|
| **Free APIs** | | |
| - Open-Meteo | $0 | 16-day forecasts, unlimited |
| - NOAA Weather | $0 | U.S. weather data, public domain |
| - SNOTEL | $0 | Snowpack data, USDA public data |
| - Nominatim Geocoding | $0 | OSM geocoding, 1 req/sec limit |
| - Overpass API (OSM) | $0 | Trail maps, no rate limit |
| **Browser Automation** | | |
| - Playwright | $0 | Open-source, free |
| - Server costs (for scraping) | $20-50 | DigitalOcean Droplet or Vercel serverless |
| **LLM (Claude API)** | | |
| - Input tokens | $30-50 | ~10M tokens/month @ $3 per 1M |
| - Output tokens | $50-100 | ~5M tokens/month @ $15 per 1M |
| **Database** | | |
| - Supabase Pro | $25 | 8GB database, 250GB bandwidth |
| **Cache** | | |
| - Upstash Redis | $10 | 10,000 requests/day |
| **CDN (for trail maps)** | | |
| - Cloudflare | $0 | Free tier (100GB/month) |
| **Total** | **$135-235/month** | |

### 7.2 Cost Comparison

| Approach | Monthly Cost | Annual Cost |
|---|---|---|
| **OnTheSnow API** | $500-5,000 | $6,000-60,000 |
| **Free Data Strategy** | $135-235 | $1,620-2,820 |
| **Savings** | **$265-4,765/month** | **$3,180-57,180/year** |
| **Cost Reduction** | **47-95%** | **47-95%** |

### 7.3 Scaling Costs (Year 2-3)

**As OnlySnow grows:**

| Users | Resorts | LLM Cost | Server Cost | Total Monthly Cost |
|---|---|---|---|---|
| 10,000 | 200 | $100 | $50 | $185 |
| 50,000 | 500 | $200 | $100 | $335 |
| 100,000 | 1,000 | $400 | $200 | $635 |
| 500,000 | 2,000 | $800 | $500 | $1,335 |

**Key Insight:** Costs scale sub-linearly (doubling users doesn't double costs)

---

## 8. Quality Assurance

### 8.1 Data Validation Rules

**Automated Checks:**

```typescript
interface ValidationRule {
  field: string;
  rule: (value: any) => boolean;
  severity: 'error' | 'warning';
  action: 'reject' | 'flag' | 'auto-fix';
}

const validationRules: ValidationRule[] = [
  {
    field: 'snow_depth_base_cm',
    rule: (v) => v >= 0 && v <= 1000,
    severity: 'error',
    action: 'reject'
  },
  {
    field: 'snowfall_24h_cm',
    rule: (v) => v >= 0 && v <= 200,
    severity: 'error',
    action: 'reject'
  },
  {
    field: 'lifts_open',
    rule: (v, context) => v <= context.lifts_total,
    severity: 'error',
    action: 'reject'
  },
  {
    field: 'trails_open',
    rule: (v, context) => v <= context.trails_total,
    severity: 'error',
    action: 'reject'
  },
  {
    field: 'updated_at',
    rule: (v) => new Date(v) > new Date(Date.now() - 48 * 60 * 60 * 1000),
    severity: 'warning',
    action: 'flag'
  }
];

async function validateSnowReport(report: any): Promise<boolean> {
  for (const rule of validationRules) {
    const isValid = rule.rule(report[rule.field], report);

    if (!isValid) {
      if (rule.action === 'reject') {
        console.error(`Validation failed: ${rule.field}`);
        return false;
      } else if (rule.action === 'flag') {
        await flagDataQualityIssue(report, rule.field);
      }
    }
  }

  return true;
}
```

### 8.2 Multi-Source Reconciliation

**When multiple sources disagree:**

```typescript
async function reconcileSnowfall(
  resortId: number,
  date: string
): Promise<number | null> {
  const sources = await Promise.all([
    getSnowfallFromScrapedData(resortId, date),
    getSnowfallFromOpenMeteo(resortId, date),
    getSnowfallFromSNOTEL(resortId, date)
  ]);

  // Filter out nulls
  const validSources = sources.filter(s => s !== null && s !== undefined);

  if (validSources.length === 0) return null;
  if (validSources.length === 1) return validSources[0];

  // If sources agree within 20%, use average
  const max = Math.max(...validSources);
  const min = Math.min(...validSources);

  if ((max - min) / max < 0.2) {
    return validSources.reduce((a, b) => a + b, 0) / validSources.length;
  }

  // If sources disagree, use weighted average (prefer scraped data)
  const weights = [0.5, 0.3, 0.2]; // scraped, open-meteo, snotel
  const weighted = sources.map((v, i) => (v || 0) * weights[i]);
  return weighted.reduce((a, b) => a + b, 0);
}
```

### 8.3 Manual Review Dashboard

**Build admin dashboard to review flagged data:**

```typescript
// API endpoint: GET /admin/data-quality
async function getDataQualityFlags() {
  const flags = await supabase
    .from('data_quality_flags')
    .select('*, resorts(name)')
    .is('resolved_at', null)
    .order('flagged_at', { ascending: false });

  return flags.data;
}

// Frontend displays:
// - Resort name
// - Data type (snow_depth, lift_count)
// - Flagged value
// - Reason
// - Actions: "Approve", "Reject", "Edit"
```

---

## Appendix A: Free API Quick Reference

### Open-Meteo API

**Base URL:** `https://api.open-meteo.com/v1/forecast`

**Parameters:**
- `latitude`, `longitude` — Required
- `hourly` — Comma-separated list: `temperature_2m,precipitation,snowfall`
- `daily` — Comma-separated list: `snowfall_sum,temperature_2m_max`
- `timezone` — IANA timezone or `auto`

**Example:**
```bash
curl "https://api.open-meteo.com/v1/forecast?latitude=39.64&longitude=-106.37&daily=snowfall_sum&timezone=auto"
```

**Docs:** [open-meteo.com/en/docs](https://open-meteo.com/en/docs)

---

### NOAA Weather API

**Base URL:** `https://api.weather.gov/`

**Example:**
```bash
# Get grid point
curl "https://api.weather.gov/points/39.64,-106.37"

# Response includes forecast URL
# GET /gridpoints/{office}/{x},{y}/forecast
```

**Docs:** [weather.gov/documentation/services-web-api](https://www.weather.gov/documentation/services-web-api)

---

### Nominatim (OSM Geocoding)

**Base URL:** `https://nominatim.openstreetmap.org/`

**Example:**
```bash
curl "https://nominatim.openstreetmap.org/search?q=Vail+Colorado&format=json"
```

**Docs:** [nominatim.org/release-docs/latest/api/Overview](https://nominatim.org/release-docs/latest/api/Overview/)

---

### Overpass API (OSM Data)

**Base URL:** `https://overpass-api.de/api/interpreter`

**Example:**
```bash
curl -X POST "https://overpass-api.de/api/interpreter" \
  -d '[out:json];way["piste:type"="downhill"](39.6,-106.4,39.7,-106.3);out geom;'
```

**Docs:** [wiki.openstreetmap.org/wiki/Overpass_API](https://wiki.openstreetmap.org/wiki/Overpass_API)

---

## Appendix B: LLM Prompt Library

### Extract Snow Report

```
Extract ski resort snow report data from this HTML page.

HTML: {html_content}

Return JSON with fields:
- snow_depth_base_cm (number or null)
- snowfall_24h_cm (number or null)
- lifts_total (number or null)
- lifts_open (number or null)

Convert all units to metric (cm). If data not found, set to null.
```

### Validate Extracted Data

```
Check if this snow report data is realistic:

{extracted_json}

Flag any suspicious values (e.g., snow depth >1000cm, lifts_open > lifts_total).
Return: {"valid": true/false, "issues": ["issue1", "issue2"]}
```

### Generate Summary

```
Write a 2-sentence summary for this snow report:

Resort: {resort_name}
Snowfall 24h: {snowfall_24h_cm}cm
Lifts open: {lifts_open}/{lifts_total}
Surface: {surface_conditions}

Target audience: Skiers deciding where to ski today.
```

---

**Last Updated:** February 6, 2026
**Next Review:** March 2026 (after Phase 1-2 implementation)

**Questions or Feedback?**
Contact: chris@onlysnow.com
