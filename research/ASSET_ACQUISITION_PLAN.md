# Ski Resort Logo & Trail Map Acquisition Plan

**Last Updated:** February 2026
**Version:** 1.0
**Status:** Research & Planning Phase

---

## Executive Summary

This document outlines OnlySnow's strategy for acquiring ski resort logos and trail maps to populate the application with high-quality visual assets. We've identified four primary acquisition methods: **direct partnerships**, **commercial APIs**, **open data sources**, and **user-generated content**. Our approach prioritizes legal compliance, scalability, and cost-effectiveness while respecting intellectual property rights.

**Target:** Acquire logos and trail maps for **500+ North American ski resorts** by end of Year 1.

---

## Table of Contents

1. [Asset Requirements](#1-asset-requirements)
2. [Legal & Compliance Framework](#2-legal--compliance-framework)
3. [Acquisition Strategy](#3-acquisition-strategy)
4. [Method 1: Direct Resort Partnerships](#4-method-1-direct-resort-partnerships)
5. [Method 2: Commercial APIs & Data Providers](#5-method-2-commercial-apis--data-providers)
6. [Method 3: Open Data & Mapping Projects](#6-method-3-open-data--mapping-projects)
7. [Method 4: Web Scraping (Last Resort)](#7-method-4-web-scraping-last-resort)
8. [Method 5: User-Generated Content](#8-method-5-user-generated-content)
9. [Implementation Roadmap](#9-implementation-roadmap)
10. [Budget & Resources](#10-budget--resources)
11. [Risk Mitigation](#11-risk-mitigation)

---

## 1. Asset Requirements

### 1.1 Ski Resort Logos

**File Specifications:**
- **Format:** SVG (vector, preferred) or PNG with transparent background
- **Resolution:** Minimum 512x512px for PNG, scalable for SVG
- **Color Variants:** Full-color, monochrome (white), monochrome (black)
- **Usage Context:** App listings, resort detail pages, "Worth Knowing" cards, notifications

**Quality Tiers:**
- **Tier 1 (Official):** High-res vector logos from resort media kits (preferred)
- **Tier 2 (Stock):** Commercial stock images with proper licensing
- **Tier 3 (Fallback):** Text-based logo using resort name (when official logo unavailable)

**Target Coverage:**
- **Priority 1:** 100 top resorts (Epic, Ikon, Indy Pass) — 100% logo coverage by Month 3
- **Priority 2:** 200 regional resorts — 80% logo coverage by Month 6
- **Priority 3:** 200+ smaller resorts — 50% logo coverage by Month 12

### 1.2 Trail Maps

**File Specifications:**
- **Format:** GeoJSON (interactive), PNG/JPEG (static image fallback)
- **Resolution:** Minimum 2048x2048px for static images
- **Data Requirements:** Piste/trail lines, lift locations, base areas, terrain park locations
- **Usage Context:** Resort detail page, interactive map view, trip planning

**Quality Tiers:**
- **Tier 1 (Interactive):** GeoJSON trail data with elevation profiles from OpenStreetMap
- **Tier 2 (Static High-Res):** Official resort trail maps (PDF/PNG from partnerships)
- **Tier 3 (Fallback):** Link to resort's official trail map page (iframe or external link)

**Target Coverage:**
- **Priority 1:** 100 top resorts — 60% interactive maps, 100% static or links by Month 6
- **Priority 2:** 200 regional resorts — 40% interactive, 80% static/links by Month 9
- **Priority 3:** 200+ smaller resorts — 20% interactive, 50% static/links by Month 12

---

## 2. Legal & Compliance Framework

### 2.1 Copyright & Trademark Law

**Key Legal Principles:**

1. **Resort Logos:**
   - Ski resort logos are **trademarks** owned by the resort or parent company (e.g., Vail Resorts)
   - Using logos without permission may constitute trademark infringement
   - **Fair Use Exception:** Nominative fair use allows using trademarks to identify the resort (e.g., "Vail Resort" listing in OnlySnow), but best practice is to obtain written permission

2. **Trail Maps:**
   - Trail maps are **copyrighted works** owned by the resort or the map artist
   - Reproducing trail maps without permission violates copyright law
   - **Fair Use Exception:** Limited use for commentary, education, or news reporting may qualify, but commercial app usage likely does NOT qualify as fair use

**Legal Recommendation:**
- ✅ **DO:** Request permission from resorts via partnership agreements
- ✅ **DO:** Use public domain or openly licensed data (OpenStreetMap)
- ✅ **DO:** License commercial assets (stock images, APIs)
- ❌ **DON'T:** Scrape and reproduce copyrighted trail maps without permission
- ❌ **DON'T:** Assume "it's on the internet" means it's free to use

**Sources:**
- [Quora: Who owns the rights to a ski resort's trail maps?](https://www.quora.com/Who-owns-the-rights-to-a-ski-resort-s-trail-maps)
- [Ski Utah Copyright Terms](https://www.skiutah.com/about/copyright/)
- [AllTrails Terms of Service](https://www.alltrails.com/terms)

### 2.2 Terms of Service & Web Scraping

**Web Scraping Legality (2026):**

Web scraping can be legal when:
- Scraping **publicly accessible, non-personal data** (e.g., resort name, address, phone number)
- Not violating **terms of service** that explicitly prohibit scraping
- Not bypassing **technical access controls** (e.g., login walls, CAPTCHAs, rate limits)
- Respecting **robots.txt** file (indicates where bots are welcome)

Web scraping is risky/illegal when:
- Scraping **copyrighted content** (logos, trail maps, photos) without permission
- Violating **Terms of Service** you agreed to (e.g., by creating an account)
- Causing **server harm** (hammering site with excessive requests)
- Scraping **personal data** (violates GDPR, CCPA, other privacy laws)

**Best Practices:**
1. Read the website's Terms of Service — most sites state whether scraping is allowed
2. Check `robots.txt` before scraping (e.g., `vail.com/robots.txt`)
3. Rate-limit requests (1-2 requests per second max)
4. Use a clear User-Agent identifying OnlySnow (transparency)
5. Don't scrape copyrighted assets (logos, photos, maps) — only public data (addresses, phone numbers, hours)

**Sources:**
- [ScraperAPI: Is Web Scraping Legal?](https://www.scraperapi.com/web-scraping/is-web-scraping-legal/)
- [Datashake: Web Scraping Legal Guide 2026](https://www.datashake.com/blog/is-web-scraping-legal-what-you-need-to-know-in-2026)
- [Ethical Web Data: Navigating Terms of Service](https://ethicalwebdata.com/is-web-scraping-legal-navigating-terms-of-service-and-best-practices/)

### 2.3 Licensing & Attribution

**When Using Third-Party Assets:**

1. **Stock Images (Adobe Stock, Vecteezy, Freepik):**
   - Purchase royalty-free licenses ($10-50 per image)
   - Read license terms (commercial use, attribution requirements)
   - Some require attribution ("Logo by [Artist] on Freepik")

2. **OpenStreetMap Data:**
   - Licensed under **Open Database License (ODbL)**
   - Requires attribution: "Map data © OpenStreetMap contributors"
   - Commercial use allowed, modifications allowed, must share-alike

3. **APIs (Ski API, OnTheSnow API):**
   - Review API terms of service (usage limits, attribution requirements)
   - Some APIs prohibit caching data (must fetch real-time)
   - Some require "Powered by [API Provider]" attribution

---

## 3. Acquisition Strategy

### 3.1 Multi-Method Approach

OnlySnow will use a **tiered acquisition strategy** with multiple methods to maximize coverage while minimizing cost and legal risk:

| Method | Priority | Cost | Coverage | Legal Risk | Time to Implement |
|---|---|---|---|---|---|
| **Direct Partnerships** | 🟢 High | Free (but requires BD effort) | 10-50 resorts (Year 1) | None (written permission) | 3-6 months |
| **Commercial APIs** | 🟢 High | $500-5,000/month | 500-2,000 resorts | None (licensed data) | 1-2 weeks |
| **Open Data (OSM)** | 🟢 High | Free | Variable (100-500 resorts) | None (open license) | 2-4 weeks |
| **Web Scraping** | 🔴 Low | Free (dev time) | 500+ resorts | High (copyright risk) | 4-8 weeks |
| **User-Generated** | 🟡 Medium | Free (incentivize users) | Variable (grows over time) | None (user uploads) | Ongoing |

**Decision Tree:**

```
For each resort:
  1. Check if we have a partnership → Use official media kit assets
  2. Check if resort is in commercial API → Use API data
  3. Check if resort has OSM trail data → Use OpenStreetMap
  4. Check if resort has public media kit → Request permission
  5. Fallback: Text-based logo + link to resort's official trail map
```

### 3.2 Geographic Prioritization

**Phase 1 (Months 1-3): Colorado Front Range**
- Resorts: Vail, Breckenridge, Keystone, Copper, Loveland, Arapahoe Basin, Winter Park, Eldora
- Why: Highest user density (Denver metro), OnlySnow founder's home base
- Method: Direct outreach to resort marketing teams

**Phase 2 (Months 4-6): Western U.S. Expansion**
- Regions: Utah (Salt Lake City corridor), California (Tahoe), Wyoming (Jackson Hole)
- Resorts: 50-100 major resorts (Epic, Ikon, Indy Pass)
- Method: Commercial API + direct partnerships with independent resorts

**Phase 3 (Months 7-12): National Coverage**
- Regions: Pacific Northwest, Southwest, Northeast, Canada
- Resorts: 200-500 total resorts
- Method: Commercial API + OpenStreetMap + user-generated content

---

## 4. Method 1: Direct Resort Partnerships

### 4.1 Partnership Approach

**Value Proposition to Resorts:**

"Hi [Resort Marketing Director],

OnlySnow is building the first ski decision engine that tells skiers where to ski based on real-time snow forecasts. We're reaching out to request permission to use [Resort Name]'s logo and trail map in our app.

**What we're asking for:**
- High-resolution logo (SVG or PNG with transparent background)
- Trail map (GeoJSON data or static image)
- Permission to display these assets in OnlySnow

**What you get in return:**
- Free visibility to 50,000+ skiers actively deciding where to ski
- Direct traffic to your website and booking pages
- No cost (we're not asking for a partnership fee)
- Full attribution and proper brand representation

Would you be open to sharing these assets? I'm happy to sign a simple licensing agreement."

### 4.2 Resort Media Kit Hunting

Many resorts provide **public media kits** with logos and brand guidelines:

**Examples:**
- [Snow King Mountain Media Kit](https://snowkingmountain.com/media-kit/) — High-resolution logos, photos, brand guidelines
- [SkiBig3 Logos](https://www.skibig3.com/logos/) — Vector and raster formats available for download
- [U.S. Ski & Snowboard Logos](https://www.usskiandsnowboard.org/media-center/logos) — Requires authorization

**Where to Find Media Kits:**
- Google search: `[Resort Name] media kit`
- Common URL patterns: `/media-kit`, `/press`, `/media-center`, `/brand-guidelines`
- If not public, email `marketing@[resort].com` or `media@[resort].com`

### 4.3 Outreach Process

**Step 1: Identify Contact**
- Resort website → "About" → "Team" → Marketing Director or PR Manager
- LinkedIn search: "[Resort Name] Marketing Director"
- Press release footer often lists media contact email

**Step 2: Email Outreach (Template)**

```
Subject: Request to Use [Resort Name] Logo & Trail Map in OnlySnow App

Hi [Name],

My name is [Your Name], and I'm the founder of OnlySnow — a ski decision engine that helps skiers figure out where to ski based on real-time snow forecasts.

We're building a comprehensive database of 500+ ski resorts across North America, and we'd love to include [Resort Name] with proper brand representation.

Would you be willing to share:
1. High-resolution logo (SVG or PNG with transparent background)
2. Trail map (GeoJSON data, PDF, or link to downloadable map)

In return, OnlySnow will:
- Display [Resort Name] prominently when conditions are favorable
- Drive traffic to your website and booking pages
- Provide proper attribution and respect brand guidelines
- (Optional) Offer a partnership tier if you're interested in enhanced visibility

We're launching in Q1 2026 with an expected 50,000+ users in Year 1. I'd be happy to show you a demo or answer any questions.

Can I send over a simple asset licensing agreement for your review?

Best,
[Your Name]
Founder, OnlySnow
[Email] | [Phone] | onlysnow.com
```

**Step 3: Follow-Up**
- If no response in 7 days, send follow-up email
- If no response in 14 days, try LinkedIn message or phone call
- If still no response, move to fallback method (API or OSM)

**Step 4: Asset Licensing Agreement**

Simple 1-page agreement:
- Grant OnlySnow non-exclusive, royalty-free license to use logo and trail map
- Usage limited to: Display in OnlySnow mobile app and website
- Attribution: "Trail map courtesy of [Resort Name]"
- Termination: Either party can terminate with 30 days notice
- No fee (free exchange for visibility)

### 4.4 Expected Success Rate

**Realistic Targets:**
- **Cold email response rate:** 20-30%
- **Willingness to share assets:** 50-70% of responders
- **Net success rate:** 10-20% of total resorts contacted

**Year 1 Goal:** Secure partnerships with **30-50 resorts** via direct outreach

---

## 5. Method 2: Commercial APIs & Data Providers

### 5.1 OnTheSnow / Mountain News Partner API

**Provider:** Mountain News (owner of OnTheSnow.com, SkiInfo.com)
**Coverage:** 2,000+ ski resorts worldwide
**Data Provided:**
- Resort metadata (name, location, elevation, trail count, lift count)
- Real-time snow reports (24/48/72-hour snowfall, base depth)
- Trail status, lift status, grooming reports
- 7-day mountain weather forecasts
- **Webcams** (live streams)
- **Resort photos** (likely includes logos)

**Pricing:** Fee-based, custom quote (typically $500-5,000/month for full API access)

**Assets Available:**
- ❓ Logos: Likely NOT included (proprietary to resorts)
- ❓ Trail Maps: Likely NOT included (copyright issues)
- ✅ Snow data, webcams, photos: YES

**Use Case for OnlySnow:**
- Primary use: Real-time snow conditions, trail/lift status
- Secondary use: May include resort photos (but likely not logos or trail maps)

**Sources:**
- [Mountain News Partner API](https://partner.docs.onthesnow.com/)
- [OnTheSnow API Reference](https://partner.docs.onthesnow.com/api-reference/ski-resort-snowreport-api)

### 5.2 Ski API (RapidAPI)

**Provider:** RapidAPI (various contributors)
**Coverage:** Variable (100-500+ resorts depending on API)
**Pricing:** Free tier with rate limits, paid tiers $10-100/month

**Available APIs:**
1. **Ski Resort API** ([robwilhelmsson](https://rapidapi.com/robwilhelmsson/api/ski-resort-api/pricing))
   - List of all ski resorts with basic information
   - Free tier: 100 requests/month
   - Paid tier: $9.99/month (unlimited requests)

2. **Ski Resort Forecast** ([joeykyber](https://rapidapi.com/joeykyber/api/ski-resort-forecast/pricing))
   - Forecast and current snow conditions
   - Pricing not specified in search results

3. **Ski Resorts and Conditions API** ([random-shapes](https://rapidapi.com/random-shapes-random-shapes-default/api/ski-resorts-and-conditions))
   - Lift status, weather, snow conditions
   - Pricing not specified in search results

**Assets Available:**
- ❌ Logos: NOT included
- ❌ Trail Maps: NOT included
- ✅ Snow data, conditions: YES

**Use Case for OnlySnow:**
- Supplement to OnTheSnow API (more affordable for testing)
- Good for MVP / prototype phase

**Sources:**
- [Ski API (RapidAPI)](https://skiapi.com/)
- [Ski Resort API Pricing](https://rapidapi.com/robwilhelmsson/api/ski-resort-api/pricing)

### 5.3 INTERMAPS® SKIMAPS

**Provider:** INTERMAPS® (Swiss company)
**Coverage:** 500+ ski resorts (Europe, North America)
**Data Provided:**
- **Interactive digital trail maps** with real-time data overlays
- Piste/trail status, lift status, weather conditions
- Points of interest, emergency info, live video feeds
- Mobile-optimized, embeddable maps

**Pricing:** Enterprise pricing (likely $5,000-50,000/year depending on usage)

**Assets Available:**
- ✅ Trail Maps: YES (interactive digital maps)
- ✅ Logos: Possibly (embedded in maps)
- ✅ Real-time data: YES

**Use Case for OnlySnow:**
- Best option for **interactive trail maps** if budget allows
- White-label integration (embed INTERMAPS maps in OnlySnow app)

**Sources:**
- [INTERMAPS® SKIMAPS](https://www.intermaps.com/en/Skimaps.html)

### 5.4 Comparison Matrix

| API Provider | Coverage | Trail Maps | Logos | Pricing | Best For |
|---|---|---|---|---|---|
| **OnTheSnow API** | 2,000+ resorts | ❌ | ❌ | $500-5K/mo | Snow data, conditions |
| **Ski API (RapidAPI)** | 500+ resorts | ❌ | ❌ | Free-$100/mo | Budget-friendly snow data |
| **INTERMAPS SKIMAPS** | 500+ resorts | ✅ | ❓ | $5K-50K/yr | Interactive trail maps |
| **Weather Unlocked** | 2,000+ resorts | ❌ | ❌ | Custom quote | Mountain weather forecasts |

**Recommendation:**
- **Year 1:** OnTheSnow API for snow data ($500-1K/month) + OpenStreetMap for trail maps (free)
- **Year 2:** Add INTERMAPS if budget allows ($5K-10K/year) for premium interactive maps
- **Year 3:** Negotiate custom data partnership with OnTheSnow or Epic/Ikon for exclusive access

---

## 6. Method 3: Open Data & Mapping Projects

### 6.1 OpenStreetMap (OSM) Trail Data

**What is OpenStreetMap?**
- User-generated, open-source mapping project (like Wikipedia for maps)
- Licensed under **Open Database License (ODbL)** — free for commercial use with attribution
- Contains **100,000+ km of ski pistes and lifts** worldwide

**Ski-Specific Data in OSM:**
- **Pistes (trails):** Lines with attributes (difficulty, name, grooming status)
- **Lifts:** Points/lines with attributes (type, capacity, status)
- **Ski areas:** Polygons defining resort boundaries
- **Base areas:** Points marking lodges, parking, ticket offices

**OSM Tags for Ski Data:**
- `piste:type=downhill` (alpine skiing trail)
- `piste:difficulty=advanced` (black diamond, red, blue, green)
- `piste:grooming=classic` (groomed, mogul, backcountry)
- `aerialway=chair_lift` (chairlift, gondola, surface lift)

**How to Extract OSM Data:**

1. **Overpass Turbo** (web-based query tool)
   - URL: https://overpass-turbo.eu/
   - Query example (get all ski trails in a bounding box):
     ```
     [out:json];
     (
       way["piste:type"="downhill"](40.0,-106.5,40.5,-106.0);
       relation["piste:type"="downhill"](40.0,-106.5,40.5,-106.0);
     );
     out geom;
     ```
   - Export as GeoJSON

2. **Mapbox Tiling Service (MTS)**
   - Upload GeoJSON to Mapbox
   - Generate vector tiles for fast, zoomable maps
   - Embed in OnlySnow app using `react-leaflet` or Mapbox GL JS

3. **Programmatic Access (Overpass API)**
   - Python library: `overpy` or `requests`
   - Automate fetching trail data for 500+ resorts
   - Cache data in OnlySnow database (Supabase)

**Data Quality Considerations:**
- ✅ **Good coverage:** Major resorts (Vail, Whistler, Chamonix) have detailed trail maps
- ⚠️ **Inconsistent:** Smaller resorts may have incomplete or outdated data
- ⚠️ **Crowdsourced:** Data accuracy depends on user contributions
- ⚠️ **No logos:** OSM contains geographic data, not brand assets

**Sources:**
- [Mapbox: Build a Ski Trail Map Using OSM](https://www.mapbox.com/blog/build-a-ski-trail-map-using-openstreetmap-and-mts)
- [OSM Wiki: Pistes](https://wiki.openstreetmap.org/wiki/Pistes)
- [OpenSnowMap.org](https://www.opensnowmap.org/)
- [OpenSkiMap.org](https://openskimap.org/)

### 6.2 OpenSnowMap & OpenSkiMap

**OpenSnowMap.org:**
- Displays 100,000+ km of ski pistes and lifts
- Built on OpenStreetMap data
- **Useful for:** Visual reference, understanding data structure
- **Not useful for:** Direct integration (no API, just a visualization)

**OpenSkiMap.org:**
- Visualizes ski areas, runs, and lifts worldwide
- Includes backcountry ski routes, winter hiking, sled trails
- **Useful for:** Finding which resorts have good OSM data coverage
- **Not useful for:** Direct integration (no API)

**Use Case for OnlySnow:**
- Use these sites to **identify which resorts have complete OSM data**
- If resort has good OSM coverage → fetch data via Overpass API
- If resort has poor OSM coverage → fallback to API or direct partnership

### 6.3 Implementation: OSM Data Pipeline

**Step 1: Identify Resorts with OSM Coverage**
- Use OpenSkiMap.org to visually inspect coverage
- Query Overpass API for each resort (by bounding box or name)
- Store results: `resort_id`, `has_osm_data`, `data_quality_score`

**Step 2: Fetch & Process Trail Data**
```python
import overpy

api = overpy.Overpass()

# Query for trails at Vail Resort (example bounding box)
result = api.query("""
[out:json];
(
  way["piste:type"="downhill"](39.58,-106.42,39.68,-106.32);
  relation["piste:type"="downhill"](39.58,-106.42,39.68,-106.32);
);
out geom;
""")

# Convert to GeoJSON
trails = []
for way in result.ways:
    trails.append({
        "type": "Feature",
        "geometry": {
            "type": "LineString",
            "coordinates": [[node.lon, node.lat] for node in way.nodes]
        },
        "properties": {
            "name": way.tags.get("name", "Unnamed Trail"),
            "difficulty": way.tags.get("piste:difficulty", "unknown"),
            "grooming": way.tags.get("piste:grooming", "unknown")
        }
    })
```

**Step 3: Cache in Supabase**
- Store GeoJSON in PostgreSQL (PostGIS extension for geospatial data)
- Table: `resort_trail_maps`
- Columns: `resort_id`, `trail_data (JSONB)`, `updated_at`

**Step 4: Serve to Frontend**
- API endpoint: `GET /api/resorts/:id/trail-map`
- Returns GeoJSON
- Frontend renders with `react-leaflet` + OpenTopoMap or CartoDB tiles

**Budget:** $0 (free, open-source data)

**Timeline:** 2-4 weeks to build pipeline, 1-2 weeks to process 500 resorts

---

## 7. Method 4: Web Scraping (Last Resort)

### 7.1 When to Use Web Scraping

**✅ Acceptable Use Cases:**
- Scraping **public, non-copyrighted data** (resort name, address, phone, hours)
- Scraping **structured data** (trail counts, lift counts, elevation) for database population
- Scraping **metadata** (when resort last updated their website, what trails are open today)

**❌ Unacceptable Use Cases:**
- Scraping **copyrighted assets** (logos, photos, trail maps)
- Scraping data from sites with **ToS explicitly prohibiting scraping**
- Scraping **behind login walls** (violates ToS you agreed to)
- Scraping **personal data** (violates GDPR, CCPA)

### 7.2 Legal Compliance Checklist

Before scraping any resort website:

1. ✅ Read the Terms of Service (`/terms`, `/legal`)
   - Does it prohibit web scraping? If yes, DON'T scrape.

2. ✅ Check `robots.txt` (`https://[resort].com/robots.txt`)
   - Does it disallow your target pages? If yes, DON'T scrape.

3. ✅ Verify data is non-copyrighted
   - Factual data (address, phone, trail count) → OK
   - Creative works (photos, logos, maps) → NOT OK

4. ✅ Rate-limit your requests
   - Max 1-2 requests per second
   - Use delays: `time.sleep(1)` between requests

5. ✅ Use a clear User-Agent
   - Identify yourself: `OnlySnow-Bot/1.0 (contact@onlysnow.com)`

6. ✅ Don't bypass technical protections
   - Don't use headless browsers to bypass CAPTCHAs
   - Don't rotate IPs to evade bans

### 7.3 Scraping Trail Count/Lift Count (Metadata Only)

**Example: Scrape Resort Statistics (NOT Logo or Map)**

```python
import requests
from bs4 import BeautifulSoup
import time

# Headers with clear User-Agent
headers = {
    'User-Agent': 'OnlySnow-Bot/1.0 (contact@onlysnow.com)',
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
}

# Check robots.txt first (manual step)
# Example: https://www.vail.com/robots.txt

# Scrape resort stats
url = 'https://www.vail.com/the-mountain/mountain-conditions/trail-and-lift-status.aspx'
response = requests.get(url, headers=headers)

if response.status_code == 200:
    soup = BeautifulSoup(response.content, 'html.parser')

    # Parse trail count (example selector, varies by site)
    trails_open = soup.find('div', class_='trails-open').text
    print(f"Trails Open: {trails_open}")

    # DO NOT scrape/download images, logos, or maps
    # Only scrape text-based metadata

# Rate limit: wait 2 seconds before next request
time.sleep(2)
```

**What to Scrape:**
- ✅ Number of trails open today
- ✅ Number of lifts open today
- ✅ Base depth, summit depth (if not in API)
- ✅ Operating hours, ticket prices (if public)

**What NOT to Scrape:**
- ❌ Logos (download `<img>` tags)
- ❌ Trail maps (download PDF or image files)
- ❌ Photos (download image files)
- ❌ Copyrighted text (resort descriptions, marketing copy)

### 7.4 Scraping as Fallback Only

**Decision Tree:**

```
For each resort:
  1. Partnership? → Use official assets
  2. In commercial API? → Use API data
  3. OSM coverage? → Use OSM data
  4. Public media kit? → Request permission
  5. No other options? → Scrape ONLY metadata (trail/lift counts)
  6. Still no logo/map? → Fallback to text-based logo + link to resort's site
```

**Year 1 Goal:** Scrape metadata for <50 resorts (only when absolutely necessary)

---

## 8. Method 5: User-Generated Content

### 8.1 Crowdsourced Trail Maps

**Concept:**
- Allow OnlySnow users to upload trail maps (photos, screenshots, PDFs)
- Incentivize uploads with in-app rewards (Premium subscription discount, badges)
- Moderate submissions for quality and copyright compliance

**Use Cases:**
- Small, independent resorts without official trail maps online
- International resorts (Japan, Europe) where data is sparse
- Backcountry areas with community-created maps

**Implementation:**

1. **Upload Flow:**
   - Resort detail page → "Add Trail Map" button
   - User uploads image (PNG, JPEG, PDF)
   - User confirms: "I have permission to share this map" or "This is my own photo of the resort's map"

2. **Moderation:**
   - Flag uploads for review (check for copyright notices, watermarks)
   - Approve/reject within 24 hours
   - If rejected, notify user with reason

3. **Incentives:**
   - 1 map upload → $5 off Premium subscription
   - 5 map uploads → 1 month free Premium
   - 10 map uploads → "Trail Mapper" badge + lifetime 20% discount

4. **Attribution:**
   - "Trail map uploaded by @username on [date]"
   - "Not an official map. Use at your own risk."

**Legal Protection:**
- User agreement: "By uploading, you confirm you own the rights or have permission to share this map"
- DMCA takedown policy: If resort requests removal, comply immediately

**Year 1 Goal:** Collect 20-50 user-generated trail maps for resorts not covered by other methods

---

## 9. Implementation Roadmap

### Phase 1: Foundation (Months 1-3)

**Month 1: Research & Planning**
- ✅ Complete legal research (copyright, trademark, ToS)
- ✅ Identify 100 priority resorts (Epic, Ikon, Indy Pass)
- ✅ Set up asset management system (Supabase storage, CDN)
- ✅ Build resort database schema (`resorts`, `resort_assets`, `trail_maps`)

**Month 2: Partnerships & APIs**
- 🎯 Send outreach emails to 50 resorts (logos + trail maps)
- 🎯 Sign up for OnTheSnow API (trial or paid tier)
- 🎯 Sign up for RapidAPI Ski Resort API (free tier)
- 🎯 Build API integration for resort data ingestion

**Month 3: OpenStreetMap Pipeline**
- 🎯 Build OSM data fetching pipeline (Overpass API)
- 🎯 Process 100 priority resorts (check OSM coverage)
- 🎯 Cache trail data in Supabase (GeoJSON)
- 🎯 Build frontend trail map viewer (`react-leaflet`)

**Deliverables:**
- 30-50 resort partnerships secured (logos + permissions)
- 100 resorts with snow data (via API)
- 50-80 resorts with OSM trail maps
- Database populated with 150+ resorts

### Phase 2: Scaling (Months 4-6)

**Month 4: Geographic Expansion**
- 🎯 Expand to 200 resorts (Utah, California, Wyoming)
- 🎯 Send outreach emails to 100 additional resorts
- 🎯 Scrape metadata (trail/lift counts) for resorts not in API

**Month 5: User-Generated Content**
- 🎯 Launch "Add Trail Map" feature in app
- 🎯 Announce incentive program (Premium discounts for uploads)
- 🎯 Moderate first 20-50 user uploads

**Month 6: Quality Assurance**
- 🎯 Audit all 200 resorts (logo quality, trail map availability)
- 🎯 Replace text-based logos with official logos (where available)
- 🎯 Upgrade static trail maps to interactive (where OSM data exists)

**Deliverables:**
- 200+ resorts with logos (80% official, 20% text-based)
- 200+ resorts with trail maps (60% OSM, 30% static, 10% user-generated)

### Phase 3: National Coverage (Months 7-12)

**Month 7-9: Bulk Data Acquisition**
- 🎯 Expand to 500+ resorts (Northeast, Canada, Pacific Northwest)
- 🎯 Negotiate bulk data deal with OnTheSnow (if cost-effective)
- 🎯 Automate OSM data pipeline (weekly refresh)

**Month 10-12: Premium Assets**
- 🎯 Evaluate INTERMAPS SKIMAPS for interactive trail maps (if budget allows)
- 🎯 Partner with 10 destination resorts for exclusive assets
- 🎯 Launch "Verified Resort" badge (resorts with official partnerships)

**Deliverables:**
- 500+ resorts with logos
- 500+ resorts with trail maps (70% interactive, 30% static/links)
- 50+ verified resort partnerships

---

## 10. Budget & Resources

### 10.1 Year 1 Budget

| Category | Item | Cost | Notes |
|---|---|---|---|
| **Commercial APIs** | | | |
| - OnTheSnow API | $500-1,000/month | $6,000-12,000/year | Snow data, conditions, webcams |
| - RapidAPI Ski Resort API | $10-100/month | $120-1,200/year | Backup/supplement data source |
| **Stock Images** | | | |
| - Logo licenses (Adobe Stock) | $10-50 each | $500-1,000 | 20-50 logos (fallback) |
| **Mapping Services** | | | |
| - Mapbox (trail map rendering) | $0-100/month | $0-1,200/year | Free tier may suffice Year 1 |
| - INTERMAPS SKIMAPS (optional) | $5,000-10,000/year | $5,000-10,000 | Only if budget allows |
| **Legal** | | | |
| - Asset licensing agreements | $500-2,000 | $1,000 | Template + legal review |
| **Labor** | | | |
| - Developer time (pipeline build) | 40 hours @ $100/hr | $4,000 | One-time setup |
| - Outreach coordinator (pt) | 10 hrs/week @ $30/hr | $15,600 | Partnership outreach Year 1 |
| **Total Year 1 Budget** | | **$32,420-45,000** | |

**Cost Optimization:**
- Start with **free tier APIs** (RapidAPI, OpenStreetMap)
- Prioritize **direct partnerships** (free assets in exchange for visibility)
- Delay **INTERMAPS** until Year 2 (when revenue justifies cost)

### 10.2 Resource Allocation

| Role | Time Commitment | Responsibilities |
|---|---|---|
| **Founder (Technical)** | 20 hrs/week (Months 1-3) | Build OSM pipeline, API integrations, frontend rendering |
| **Founder (BD)** | 10 hrs/week (Months 1-12) | Resort outreach, partnership agreements, follow-ups |
| **Part-Time Coordinator** | 10 hrs/week (Months 4-12) | Email outreach, asset collection, database population |
| **Contract Developer** | 40 hrs (one-time) | Build asset management system, CDN integration |

**Hiring Plan:**
- Month 1-3: Founder handles everything
- Month 4-12: Hire part-time coordinator ($15,600/year)
- Year 2: Hire full-time BD lead to scale partnerships

---

## 11. Risk Mitigation

### 11.1 Legal Risks

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **Copyright Infringement** (using trail maps without permission) | High (lawsuit, takedown, bad PR) | Medium | Only use licensed data (API, OSM, partnerships) |
| **Trademark Infringement** (using logos without permission) | Medium (C&D letter, lawsuit) | Medium | Request permission, use nominative fair use defense |
| **ToS Violation** (web scraping prohibited sites) | Low (account ban, IP block) | Low | Check ToS before scraping, rate-limit requests |
| **DMCA Takedown** (user uploads copyrighted map) | Low (remove content, no legal liability) | Medium | DMCA compliance, user agreement, moderation |

**Mitigation Strategy:**
- **Conservative approach:** Assume all assets are copyrighted unless proven otherwise
- **Documentation:** Keep records of all permissions (partnership agreements, API licenses, OSM attribution)
- **Takedown policy:** Respond to DMCA requests within 24 hours
- **Legal review:** Have lawyer review asset usage (one-time $1,000-2,000)

### 11.2 Data Quality Risks

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **OSM data incomplete** (missing trails, outdated info) | Medium (poor UX, user complaints) | High | Supplement with API data, encourage user corrections |
| **API data inaccurate** (wrong trail counts, snow depth) | Medium (misleading info, user trust) | Low | Cross-reference multiple sources, flag discrepancies |
| **User-generated maps low quality** (blurry photos, outdated) | Low (minor UX issue) | Medium | Moderation, quality guidelines, user ratings |

**Mitigation Strategy:**
- **Multi-source validation:** Cross-check data from API, OSM, and resort websites
- **User feedback:** Allow users to flag incorrect data ("Report an issue")
- **Regular updates:** Refresh OSM data monthly, API data daily

### 11.3 Scalability Risks

| Risk | Impact | Probability | Mitigation |
|---|---|---|---|
| **Manual outreach doesn't scale** (can't reach 500 resorts 1-by-1) | Medium (slower growth) | High | Hire BD lead, automate email outreach, bulk partnerships |
| **API costs too high** (OnTheSnow API $5K/month unsustainable) | High (burn cash, need fundraising) | Medium | Negotiate volume discounts, use free OSM data, delay premium features |
| **OSM data gaps** (50% of resorts missing trail data) | Medium (fallback to static maps) | Medium | Accept lower coverage, focus on top 200 resorts first |

**Mitigation Strategy:**
- **Tiered approach:** Prioritize top 100 resorts (manual effort), use automation for long tail
- **Budget flexibility:** Start with free/cheap APIs, upgrade as revenue grows
- **Accept imperfection:** 80% coverage with high-quality data > 100% coverage with low-quality data

---

## 12. Success Metrics

### 12.1 Coverage Metrics (Year 1)

| Metric | Q1 Target | Q2 Target | Q3 Target | Q4 Target |
|---|---|---|---|---|
| **Resorts with Logos** | 50 | 100 | 200 | 300 |
| - Official logos (partnerships) | 20 | 40 | 60 | 80 |
| - Stock/text-based logos | 30 | 60 | 140 | 220 |
| **Resorts with Trail Maps** | 40 | 80 | 150 | 250 |
| - Interactive (OSM) | 25 | 50 | 90 | 150 |
| - Static (partnerships/API) | 10 | 20 | 40 | 70 |
| - User-generated | 5 | 10 | 20 | 30 |
| **Direct Partnerships** | 10 | 20 | 30 | 50 |

### 12.2 Quality Metrics

| Metric | Target |
|---|---|
| % of logos in vector format (SVG) | 60% |
| % of trail maps with interactive zoom | 50% |
| Avg logo resolution | 512x512px minimum |
| User satisfaction with trail maps (survey) | 4.0/5.0 stars |

### 12.3 Legal Compliance Metrics

| Metric | Target |
|---|---|
| % of logos with written permission | 100% (or nominative fair use) |
| % of trail maps with license | 100% (API, OSM, partnership, or user upload) |
| DMCA takedown requests | <5 per year |
| Copyright infringement claims | 0 |

---

## 13. Appendices

### Appendix A: Resort Contact Template (Spreadsheet)

| Resort Name | Location | Marketing Contact | Email | Phone | Status | Assets Received | Date |
|---|---|---|---|---|---|---|---|
| Vail | CO | Jane Smith | jane@vail.com | 970-xxx-xxxx | Contacted | Pending | 2026-02-01 |
| Breckenridge | CO | John Doe | john@breckenridge.com | 970-xxx-xxxx | Partnership Signed | Logo, Trail Map | 2026-02-15 |
| ... | ... | ... | ... | ... | ... | ... | ... |

### Appendix B: Asset Storage Architecture

**Supabase Storage Buckets:**
- `resort-logos/` — Resort logos (SVG, PNG)
  - Naming: `resort-logos/{resort_id}_logo.svg`
- `trail-maps/` — Trail map images (PNG, JPEG, PDF)
  - Naming: `trail-maps/{resort_id}_trail_map.png`
- `trail-maps-geojson/` — Interactive trail data (GeoJSON)
  - Naming: `trail-maps-geojson/{resort_id}_trails.geojson`

**CDN:**
- Cloudflare CDN in front of Supabase storage
- Cache TTL: 7 days (logos), 1 day (trail maps)
- Purge cache on asset update

**Database Schema:**
```sql
CREATE TABLE resort_assets (
  id UUID PRIMARY KEY,
  resort_id UUID REFERENCES resorts(id),
  asset_type TEXT, -- 'logo', 'trail_map', 'trail_map_geojson'
  file_url TEXT,
  file_format TEXT, -- 'svg', 'png', 'geojson', 'pdf'
  source TEXT, -- 'partnership', 'api', 'osm', 'user_generated'
  license TEXT, -- 'official_permission', 'odbl', 'user_upload'
  uploaded_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### Appendix C: OpenStreetMap Query Examples

**Get all ski trails at Vail Resort:**
```
[out:json];
(
  way["piste:type"="downhill"](39.58,-106.42,39.68,-106.32);
  relation["piste:type"="downhill"](39.58,-106.42,39.68,-106.32);
);
out geom;
```

**Get all lifts at Vail Resort:**
```
[out:json];
(
  way["aerialway"](39.58,-106.42,39.68,-106.32);
  node["aerialway"](39.58,-106.42,39.68,-106.32);
);
out geom;
```

**Get ski area boundary:**
```
[out:json];
(
  relation["site"="piste"](39.58,-106.42,39.68,-106.32);
);
out geom;
```

### Appendix D: Sample Partnership Agreement

```
ASSET LICENSE AGREEMENT

This Agreement is entered into as of [Date] by and between:

OnlySnow, Inc. ("Licensee")
[Address]

and

[Resort Name] ("Licensor")
[Address]

1. GRANT OF LICENSE
Licensor grants Licensee a non-exclusive, royalty-free, worldwide license to use:
- Resort logo (SVG, PNG)
- Trail map (GeoJSON, PDF, or image)

2. PERMITTED USE
Licensee may use the assets solely for:
- Display in OnlySnow mobile app and website
- Marketing materials promoting OnlySnow

3. ATTRIBUTION
Licensee will provide attribution: "Trail map courtesy of [Resort Name]"

4. RESTRICTIONS
Licensee may not:
- Modify the logo (except resizing)
- Sublicense or sell the assets
- Use assets in a way that implies endorsement without written permission

5. TERM & TERMINATION
This Agreement is effective until terminated by either party with 30 days written notice.

6. NO FEES
No fees are due from Licensee to Licensor for this license.

Signed:

_______________________
[Your Name], Founder
OnlySnow, Inc.

_______________________
[Resort Contact], [Title]
[Resort Name]

Date: __________________
```

---

## Sources

### Legal & Compliance
- [ScraperAPI: Is Web Scraping Legal?](https://www.scraperapi.com/web-scraping/is-web-scraping-legal/)
- [Datashake: Web Scraping Legal Guide 2026](https://www.datashake.com/blog/is-web-scraping-legal-what-you-need-to-know-in-2026)
- [Ethical Web Data: Navigating Terms of Service](https://ethicalwebdata.com/is-web-scraping-legal-navigating-terms-of-service-and-best-practices/)
- [Quora: Who owns the rights to ski resort trail maps?](https://www.quora.com/Who-owns-the-rights-to-a-ski-resort-s-trail-maps)
- [Ski Utah Copyright Terms](https://www.skiutah.com/about/copyright/)

### Logos & Brand Assets
- [Snow King Mountain Media Kit](https://snowkingmountain.com/media-kit/)
- [SkiBig3 Logos](https://www.skibig3.com/logos/)
- [U.S. Ski & Snowboard Logos](https://www.usskiandsnowboard.org/media-center/logos)
- [Adobe Stock: Ski Resort Logos](https://stock.adobe.com/search?k=ski+resort+logo)
- [Vecteezy: Ski Resort Logo Vectors](https://www.vecteezy.com/free-vector/ski-resort-logo)

### Trail Map APIs & Data
- [Ski API (RapidAPI)](https://skiapi.com/)
- [Mountain News Partner API (OnTheSnow)](https://partner.docs.onthesnow.com/)
- [INTERMAPS® SKIMAPS](https://www.intermaps.com/en/Skimaps.html)
- [Weather Unlocked Ski Resort API](https://developer.weatherunlocked.com/skiresort)

### OpenStreetMap & Open Data
- [Mapbox: Build a Ski Trail Map Using OSM](https://www.mapbox.com/blog/build-a-ski-trail-map-using-openstreetmap-and-mts)
- [OSM Wiki: Pistes](https://wiki.openstreetmap.org/wiki/Pistes)
- [OpenSnowMap.org](https://www.opensnowmap.org/)
- [OpenSkiMap.org](https://openskimap.org/)

---

**Last Updated:** February 6, 2026
**Next Review:** March 2026 (after 30 days of implementation)

**Questions or Feedback?**
Contact: chris@onlysnow.com
