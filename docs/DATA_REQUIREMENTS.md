# Data Requirements: OnlySnow Ski Decision Engine

**Date**: 2026-02-05
**Status**: Research Complete

---

## Executive Summary

OnlySnow is a **region-first, snow-forecast-driven decision platform** that aggregates data from multiple sources to answer three core questions:

1. **When should I ski?** (snow forecast ranking)
2. **Where should I ski?** (regional comparison across pass constraints)
3. **How much will it cost?** (flights, lodging, lift tickets for chase mode)

The application requires integration with **8+ data sources** across **3 entity types** (Resorts, Forecasts, Trips), with a mix of static, near-real-time, and real-time data.

---

## 1. Entity Types & Data Model

### 1.1 Resort (Static/Seasonal)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| id | string | Unique identifier (e.g., "vail") | Manual |
| name | string | Display name | Manual |
| passType | enum | epic / ikon / indy / independent | Manual |
| driveTime | string | Human-readable (e.g., "1h 40m") | Google Maps |
| driveMinutes | number | Sortable numeric | Google Maps |
| elevation | number | Summit elevation (feet) | Manual |
| baseElevation | number | Base elevation (feet) | Manual |
| region | string | Grouping (e.g., "Summit County") | Manual |
| lat | number | Latitude | Manual |
| lng | number | Longitude | Manual |
| aspect | string | N/S/E/W orientation (storm patterns) | Manual |
| terrainProfile | object | { expert: %, intermediate: %, beginner: % } | Resort website |
| liftsTotal | number | Total lift count | Resort website |
| trailsTotal | number | Total trail count | Resort website |
| nightSkiing | boolean | Night skiing available | Resort website |
| skiSchool | boolean | Ski school available | Resort website |

**Current coverage**: 17 resorts (Colorado + PA)
**Target coverage**: 200+ North American resorts

---

### 1.2 Forecast Data (Near-Real-Time)

#### Daily Forecast

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| day | string | Day of week (e.g., "Thu") | Computed |
| date | string | Date (e.g., "Feb 6") | Computed |
| snowfall | number | Expected inches | Open-Meteo / NOAA |
| tempHigh | number | High temp (°F) | Open-Meteo |
| tempLow | number | Low temp (°F) | Open-Meteo |
| wind | number | Wind speed (mph) | Open-Meteo |
| icon | enum | snow / partly-cloudy / sunny / cloudy / heavy-snow | Computed |
| conditions | string | "Groomed", "Powder", etc. | Computed |

#### Resort Conditions

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| snowfall24hr | number | Last 24hr snowfall (inches) | OpenSnow / Resort |
| baseDepth | number | Current base depth (inches) | OpenSnow / Resort |
| openPercent | number | % terrain open | Resort API |
| trailsOpen | number | Trails currently open | Resort API |
| liftsOpen | number | Lifts currently open | Resort API |
| conditions | string | Current snow conditions | Resort API |
| forecast5day | object | { display, sort, daily[] } | Open-Meteo |
| forecast10day | object | { display, sort, daily[] } | Open-Meteo |

#### Additional Forecast Fields (Future)

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| snowRatio | number | Snow density ratio (e.g., 10:1) | NOAA |
| snowLevel | number | Elevation where snow starts | NOAA |
| avalancheRating | enum | High / Considerable / Moderate / Low | CAIC |
| windHold | boolean | Upper mountain closed? | Resort API |
| seasonTotal | number | Season-to-date snowfall | OpenSnow |
| snowpackPercent | number | % of normal snowpack | SNOTEL |

---

### 1.3 Trip Planning Data (Real-Time)

#### Flights

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| route | string | Origin → Destination (e.g., "EWR → MTJ") | Google Flights |
| price | number | Round-trip price | Google Flights |
| airline | string | Carrier name | Google Flights |
| departure | string | Departure time | Google Flights |
| arrival | string | Arrival time | Google Flights |

#### Lodging

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| name | string | Hotel/property name | Booking.com |
| price | number | Per-night rate | Booking.com |
| availability | boolean | Rooms available | Booking.com |
| walkability | string | Distance to lifts | Booking.com |

#### Rental Car

| Field | Type | Description | Source |
|-------|------|-------------|--------|
| price | number | Daily rate | Kayak |
| vehicleClass | string | Economy / AWD / SUV | Kayak |
| company | string | Rental company | Kayak |

#### Trip Plan (Computed)

| Field | Type | Description |
|-------|------|-------------|
| destination | string | Resort name |
| dates | string | Trip dates |
| nights | number | Number of nights |
| totalEstimate | number | Total trip cost |
| totalWithPass | number | Cost if on pass |
| costPerPowderDay | number | Amortized cost |

---

## 2. External Data Sources

### 2.1 Weather & Snow Forecast

| Source | Data Provided | Frequency | Cost |
|--------|---------------|-----------|------|
| **Open-Meteo API** | 10-day forecast (precip, temp, wind) | Every 6-12h | Free tier |
| **OpenSnow** | 24hr resort reports, expert commentary | Daily AM | Partnership |
| **NOAA GFS/ECMWF** | Weather models (storm tracking) | Every 12h | Free |
| **SNOTEL (USDA)** | Snowpack % of normal | Daily | Free API |
| **CAIC** | Avalanche ratings (Colorado) | Daily | Free |

### 2.2 Travel & Booking

| Source | Data Provided | Frequency | Cost |
|--------|---------------|-----------|------|
| **Google Flights API** | Flight prices, routes | Real-time | Affiliate |
| **Booking.com / Expedia** | Hotel availability, prices | Every 1-2h | 5-12% commission |
| **Kayak / RentalCars.com** | Car rental pricing | Every 4-6h | Affiliate |
| **CDOT / State DOTs** | Road conditions, pass status | Real-time | Free |

### 2.3 Resort & Pass Data

| Source | Data Provided | Frequency | Cost |
|--------|---------------|-----------|------|
| **Epic Pass website** | Affiliated resorts | Once/season | Scrape |
| **Ikon Pass website** | Affiliated resorts | Once/season | Scrape |
| **Resort websites** | Terrain, operations, pricing | Once/season | Scrape |
| **Ski.com / Epic.com** | Dynamic lift ticket prices | 2-4x daily | Partner API |

---

## 3. Data Refresh Requirements

### Static Data (Seasonal)
- Resort database: Once per season (June)
- Pass affiliations: Once per season + mid-season updates
- Terrain profiles: Once per season

### Near-Real-Time Data (Every 6-12 Hours)
- 10-day forecasts: Every 6-12 hours
- 24hr snowfall reports: Daily morning
- Resort open status: Twice daily (AM/PM)
- Expert commentary: Daily morning
- Road conditions: 2-3x daily during storms

### Real-Time Data (On-Demand)
- Flight prices: Real-time when viewing chase trip
- Hotel availability: Every 1-2 hours during chase window
- Rental car prices: Every 4-6 hours
- Current conditions: Every hour during storms

---

## 4. Regional Coverage

### Chase Mode Regions (11 National Regions)

| Region | Key Resorts | Best Airport |
|--------|-------------|--------------|
| Colorado I-70 | Vail, Breckenridge, Keystone, A-Basin | DEN |
| Colorado North | Steamboat, Howelsen | HDN |
| Colorado South | Telluride, Crested Butte, Monarch | MTJ, GUC |
| Utah Cottonwoods | Alta, Snowbird, Brighton, Solitude | SLC |
| Utah Southern | Park City, Deer Valley | SLC |
| California Tahoe | Palisades, Kirkwood, Heavenly | RNO |
| California South | Mammoth | MMH, LAX |
| Wyoming | Jackson Hole, Grand Targhee | JAC |
| Montana | Big Sky, Whitefish | BZN |
| Pacific NW | Mt. Baker, Crystal, Stevens Pass | SEA |
| Northeast | Killington, Stowe, Sugarbush | BTV |

---

## 5. Persona-Specific Data Needs

### Powder Hunter
- **Priority data**: 24hr snowfall (exact), wind holds, bowl openings
- **Nice to have**: Snow ratio, backcountry gate status
- **Refresh**: Every 3-6 hours during storms

### Family Planner
- **Priority data**: Grooming report, parking status, ski school availability
- **Nice to have**: Beginner terrain status, dining hours
- **Refresh**: Daily

### Weekend Warrior
- **Priority data**: Drive time, lift ticket price, terrain open %
- **Nice to have**: Night skiing hours, crowd predictions
- **Refresh**: Daily

### Destination Traveler
- **Priority data**: National storm forecasts, flight prices, total trip cost
- **Nice to have**: Hotel availability, road conditions
- **Refresh**: Local every 12h, National every 12h

### Beginner
- **Priority data**: Beginner terrain status, rental availability, simple language
- **Nice to have**: Lesson availability, "what to wear" guidance
- **Refresh**: Daily

---

## 6. Data Model Relationships

```
User (OnboardingState)
├── location (city/zip)
├── pass (Epic/Ikon/Indy/Multi/None)
├── driveRadius (1-3 hours)
├── chaseWillingness (anywhere/driving/no)
├── persona (powder-hunter/family-planner/etc.)
└── savedResorts[] → Resort

Resort
├── Static properties (elevation, region, coordinates)
├── Pass affiliation → PassNetwork
├── ResortConditions (live)
│   ├── snowfall24hr
│   ├── forecasts → Forecast[]
│   └── operationalStatus
└── ChaseRegion (membership)

ChaseRegion
├── 11 national regions
├── resorts[] → Resort
├── bestAirport
├── stormSeverity
└── forecastTotal

TripPlan (generated on chase alert)
├── destination → Resort
├── flights[] → Flight API
├── lodging[] → Hotel API
├── rentalCar → Car API
├── skiPlan[] (computed)
└── costEstimates
```

---

## 7. Currently Mocked vs. Real API Needed

### Currently Mocked (poc/app/src/data/)

| File | Status | Production Requirement |
|------|--------|----------------------|
| `resorts.ts` | 17 resorts | Expand to 200+ |
| `scenarios.ts` | 6 scenarios | Replace with live data |
| `types.ts` | Complete | Add Tier 3 fields |
| `personas.ts` | Basic | Expand recommendations |

### APIs Needed for Production

| Priority | API | Purpose |
|----------|-----|---------|
| **P0** | Open-Meteo | 10-day weather forecasts |
| **P0** | OpenSnow (scrape/partner) | 24hr reports + expert content |
| **P1** | Google Maps | Drive times, routes |
| **P1** | CDOT | Road conditions |
| **P2** | Google Flights | Flight prices |
| **P2** | Booking.com | Hotel availability |
| **P2** | Kayak | Car rental prices |
| **P3** | SNOTEL | Snowpack data |
| **P3** | CAIC | Avalanche ratings |

---

## 8. Implementation Roadmap

### Phase 1: MVP Weather (Weeks 1-4)
- [ ] Integrate Open-Meteo API for 10-day forecasts
- [ ] Scrape/partner OpenSnow for 24hr reports
- [ ] Build forecast refresh pipeline (every 12h)
- [ ] Display real data in existing UI

### Phase 2: Resort Expansion (Weeks 4-8)
- [ ] Build complete resort database (200+ resorts)
- [ ] Add coordinates, terrain profiles, pass affiliations
- [ ] Implement regional groupings for chase mode
- [ ] Add Google Maps integration for drive times

### Phase 3: Chase Mode APIs (Weeks 8-12)
- [ ] Integrate Google Flights API
- [ ] Integrate Booking.com API
- [ ] Integrate Kayak car rental API
- [ ] Build trip cost calculator

### Phase 4: Personalization (Weeks 12-16)
- [ ] Implement persona detection/selection
- [ ] Build recommendation engine per persona
- [ ] Add behavioral learning (tap tracking)
- [ ] Implement push notifications

---

## 9. Data Quality Requirements

| Data Point | Accuracy Needed | Validation Method |
|------------|-----------------|-------------------|
| 24hr snowfall | ±1" | Resort report + OpenSnow cross-check |
| 10-day forecast | Range acceptable | NOAA model ensemble agreement |
| Base depth | ±2" | Webcam verification |
| Flight prices | Exact | Real-time API at booking |
| Hotel availability | Exact | Real-time API at booking |
| Road conditions | Exact (safety) | Real-time from DOT |

---

## 10. Key Insights

### The Comparison Problem
OpenSnow requires checking each resort individually. OnlySnow needs **complete data for all resorts in a region** to enable single-table comparison.

### The Storm Direction Problem
"NW flow favors Vail" requires:
- Real-time storm direction tracking
- Per-resort aspect data (orientation)
- Pre-computed pattern lookup tables

### The Lead Time Problem
Chase alerts need 5-7 days lead time. Requires:
- Forecast confidence scoring
- Escalating alert timing (Day 7 → Day 4 → Day 1)
- Flight price trend tracking

### The Persona Problem
Same data, different presentation:
- Powder Hunter: "Vail got 12", Back Bowls open"
- Family Planner: "Vail: groomed today, ski school open"
- Beginner: "Vail: smooth packed snow, beginner runs ready"

---

## Summary

OnlySnow requires a **multi-source data integration** spanning:

1. **Weather APIs** (Open-Meteo + NOAA for forecasts)
2. **Resort database** (200+ resorts with static characteristics)
3. **OpenSnow partnership** (24hr reporting + expert content)
4. **Booking APIs** (Google Flights, Booking.com, Kayak) for chase mode
5. **Behavioral layer** (tap tracking) for personalization

The highest-value early wins are:
1. Wire up real weather forecasts (Open-Meteo)
2. Partner/scrape OpenSnow for 24hr reports
3. Build national resort database
4. Validate scenarios against real skier decisions
