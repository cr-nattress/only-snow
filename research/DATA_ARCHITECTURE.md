# OnlySnow Data Architecture & Enhancement Strategy

**Last Updated:** February 2026
**Version:** 1.0

---

## Executive Summary

This document provides a comprehensive data map of the **OnTheSnow Partner API** and outlines OnlySnow's strategy to **store, enhance, and provide superior data** compared to the base API. By combining multiple data sources, adding intelligent interpretation layers, and tracking user behavior, OnlySnow will deliver a richer, more personalized ski decision engine.

**Key Strategy:** OnTheSnow API provides the **foundation** (real-time resort data), but OnlySnow adds **5 enhancement layers**:
1. **Multi-source data fusion** (weather models, SNOTEL, OpenStreetMap)
2. **Intelligent interpretation** (storm severity scoring, recommendation algorithms)
3. **User behavior tracking** (preferences, tap patterns, persona classification)
4. **Drive-time intelligence** (Google Maps API for personalized proximity)
5. **Predictive analytics** (forecast quality scoring, booking price predictions)

---

## Table of Contents

1. [OnTheSnow API Data Map](#1-onthesnow-api-data-map)
2. [Data Enhancement Strategy](#2-data-enhancement-strategy)
3. [Database Schema Design](#3-database-schema-design)
4. [Data Pipeline Architecture](#4-data-pipeline-architecture)
5. [Data Quality & Validation](#5-data-quality--validation)
6. [Performance & Caching Strategy](#6-performance--caching-strategy)
7. [Implementation Roadmap](#7-implementation-roadmap)

---

## 1. OnTheSnow API Data Map

### 1.1 API Overview

**Provider:** Mountain News (OnTheSnow.com, SkiInfo.com)
**Coverage:** 2,000+ ski resorts worldwide
**Authentication:** API key-based (`x-api-key` header)
**Format:** RESTful JSON API
**Pricing:** Fee-based, custom quote (estimated $500-5,000/month)

**Source:** [Mountain News Partner API](https://partner.docs.onthesnow.com/)

### 1.2 Available Endpoints

| Endpoint | Purpose | Update Frequency | Key Data |
|---|---|---|---|
| **GET /resorts** | List all resorts with filters | Static (updated seasonally) | Resort IDs, names, regions |
| **GET /resorts/snowreport** | Batch snow reports | Multiple times daily | Snow depth, trails, lifts, conditions |
| **GET /resort/:id/snowreport** | Single resort snow report | Multiple times daily | Detailed resort conditions |
| **GET /resorts/profiles** | Batch resort profiles | Static (updated seasonally) | Location, amenities, stats |
| **GET /resort/:id/profile** | Single resort profile | Static (updated seasonally) | Detailed resort metadata |
| **GET /resorts/weather** | Batch weather forecasts | 4x daily | 7-day forecast (base, mid, summit) |
| **GET /resort/:id/weather** | Single resort weather | 4x daily | Detailed 7-day forecast |
| **GET /resorts/webcams** | Batch webcam links | Real-time (live streams) | Webcam URLs, locations |
| **GET /resort/:id/webcams** | Single resort webcams | Real-time (live streams) | Multiple webcam feeds |
| **GET /regions** | List all ski regions | Static | Region IDs, names, countries |

### 1.3 Detailed Data Structures

#### 1.3.1 Resorts Endpoint (`GET /resorts`)

**Query Parameters:**
- `regionId` (string): Filter by region (e.g., "colorado", "utah")
- `resortIds` (string): Comma-separated resort IDs

**Response Schema:**
```json
{
  "resorts": [
    {
      "id": 123,
      "name": "Vail Resort",
      "slug": "vail",
      "region": {
        "id": 45,
        "name": "Colorado",
        "country": "USA"
      }
    }
  ]
}
```

**Data Fields:**
| Field | Type | Description |
|---|---|---|
| `id` | number | Unique resort identifier |
| `name` | string | Resort display name |
| `slug` | string | URL-friendly identifier |
| `region.id` | number | Region identifier |
| `region.name` | string | Region name (state/province) |
| `region.country` | string | Country code |

---

#### 1.3.2 Snowreport Endpoint (`GET /resort/:id/snowreport`)

**Response Schema:**
```json
{
  "resort": 123,
  "status": {
    "openFlag": 1,
    "openingDate": "2025-11-15T00:00:00Z",
    "closingDate": "2026-04-20T00:00:00Z"
  },
  "depth": {
    "base": 150,
    "middle": 180,
    "summit": 220
  },
  "recent": [
    {
      "date": "2026-02-06",
      "snow": 25
    },
    {
      "date": "2026-02-05",
      "snow": 15
    }
  ],
  "lifts": {
    "total": 34,
    "open": 32,
    "details": [
      {
        "name": "Gondola One",
        "type": "gondola",
        "status": "open"
      }
    ]
  },
  "terrain": {
    "runs": {
      "total": 195,
      "open": 185,
      "beginner": 18,
      "intermediate": 29,
      "advanced": 53
    },
    "acres": {
      "total": 5289,
      "open": 5200
    },
    "parks": {
      "total": 5,
      "open": 4
    }
  },
  "surfaceType": 3,
  "surfaceTypeBottom": 5,
  "updatedAt": "2026-02-06T08:30:00Z"
}
```

**Data Fields:**

**Status Object:**
| Field | Type | Description | Possible Values |
|---|---|---|---|
| `openFlag` | number | Operating status | 1=Open, 2=Closed, 3=Temp Closed, 4=Weekends Only, 5=No Report, 6=Perm Closed |
| `openingDate` | string | Season opening date | ISO 8601 timestamp |
| `closingDate` | string | Season closing date | ISO 8601 timestamp |

**Depth Object:**
| Field | Type | Description | Unit |
|---|---|---|---|
| `base` | number | Base elevation snow depth | Centimeters |
| `middle` | number | Mid-mountain snow depth | Centimeters |
| `summit` | number | Summit snow depth | Centimeters |

**Recent Array (7-day snowfall history):**
| Field | Type | Description | Unit |
|---|---|---|---|
| `date` | string | Date of snowfall | YYYY-MM-DD |
| `snow` | number | Snowfall amount | Centimeters |

**Lifts Object:**
| Field | Type | Description |
|---|---|---|
| `total` | number | Total lift count |
| `open` | number | Operational lifts |
| `details[].name` | string | Lift name |
| `details[].type` | string | Lift type (gondola, chair, surface) |
| `details[].status` | string | open / closed / hold |

**Terrain Object:**
| Field | Type | Description |
|---|---|---|
| `runs.total` | number | Total trail count |
| `runs.open` | number | Open trails |
| `runs.beginner` | number | Beginner trail count (%) |
| `runs.intermediate` | number | Intermediate trail count (%) |
| `runs.advanced` | number | Advanced trail count (%) |
| `acres.total` | number | Total skiable acres |
| `acres.open` | number | Open acres |
| `parks.total` | number | Terrain parks |
| `parks.open` | number | Open parks |

**Surface Type Codes:**
| Code | Description | Code | Description |
|---|---|---|---|
| 1 | Powder | 10 | Icy Spots |
| 2 | Packed Powder | 11 | Bare Spots |
| 3 | Machine Made | 12 | Wind Blown |
| 4 | Groomed | 13 | Granular (Frozen) |
| 5 | Hard Packed | 14 | Granular (Wet) |
| 6 | Spring Snow | 15 | Variable |
| 7 | Corn Snow | 16 | Wet |
| 8 | Granular | 17 | Sticky |
| 9 | Ice | 18 | Unknown |

---

#### 1.3.3 Profile Endpoint (`GET /resort/:id/profile`)

**Response Schema:**
```json
{
  "resort": 123,
  "name": "Vail Resort",
  "location": {
    "latitude": 39.6403,
    "longitude": -106.3742,
    "elevation": {
      "base": 2475,
      "summit": 3527
    },
    "address": "Vail, CO 81657",
    "timezone": "America/Denver"
  },
  "stats": {
    "verticalDrop": 1052,
    "totalAcres": 5289,
    "totalRuns": 195,
    "totalLifts": 34,
    "longestRun": 7.6,
    "averageAnnualSnowfall": 354
  },
  "terrain": {
    "beginner": 18,
    "intermediate": 29,
    "advanced": 53
  },
  "amenities": {
    "nightSkiing": false,
    "snowmaking": true,
    "skiSchool": true,
    "childCare": true,
    "rental": true
  },
  "contact": {
    "phone": "+1-970-476-5601",
    "website": "https://www.vail.com",
    "email": "info@vail.com"
  }
}
```

**Data Fields:**

**Location Object:**
| Field | Type | Description | Unit |
|---|---|---|---|
| `latitude` | number | GPS latitude | Decimal degrees |
| `longitude` | number | GPS longitude | Decimal degrees |
| `elevation.base` | number | Base elevation | Meters |
| `elevation.summit` | number | Summit elevation | Meters |
| `address` | string | Mailing address | — |
| `timezone` | string | IANA timezone | — |

**Stats Object:**
| Field | Type | Description | Unit |
|---|---|---|---|
| `verticalDrop` | number | Elevation difference | Meters |
| `totalAcres` | number | Skiable acres | Acres |
| `totalRuns` | number | Total trails | Count |
| `totalLifts` | number | Total lifts | Count |
| `longestRun` | number | Longest trail | Kilometers |
| `averageAnnualSnowfall` | number | Historical avg snowfall | Centimeters |

**Terrain Object:**
| Field | Type | Description |
|---|---|---|
| `beginner` | number | % beginner terrain |
| `intermediate` | number | % intermediate terrain |
| `advanced` | number | % advanced terrain |

**Amenities Object:**
| Field | Type | Description |
|---|---|---|
| `nightSkiing` | boolean | Night skiing available |
| `snowmaking` | boolean | Artificial snow capability |
| `skiSchool` | boolean | Ski school on-site |
| `childCare` | boolean | Child care available |
| `rental` | boolean | Equipment rental on-site |

---

#### 1.3.4 Weather Endpoint (`GET /resort/:id/weather`)

**Response Schema:**
```json
{
  "resort": 123,
  "daily": [
    {
      "date": "2026-02-06",
      "base": {
        "tempHigh": 5,
        "tempLow": -3,
        "snow": 10,
        "rain": 0,
        "windSpeed": 15,
        "windGust": 25
      },
      "mid": {
        "tempHigh": 2,
        "tempLow": -6,
        "snow": 15,
        "rain": 0,
        "windSpeed": 20,
        "windGust": 35
      },
      "summit": {
        "tempHigh": -2,
        "tempLow": -10,
        "snow": 25,
        "rain": 0,
        "windSpeed": 30,
        "windGust": 50
      }
    }
  ],
  "hourly": [
    {
      "datetime": "2026-02-06T12:00:00Z",
      "elevation": "summit",
      "temp": -5,
      "feelsLike": -12,
      "precipitation": 2,
      "windSpeed": 35,
      "windDirection": 270,
      "humidity": 75,
      "cloudCover": 90
    }
  ]
}
```

**Data Fields:**

**Daily Forecast (7 days):**
| Field | Type | Description | Unit |
|---|---|---|---|
| `date` | string | Forecast date | YYYY-MM-DD |
| `base.tempHigh` | number | High temperature | Celsius |
| `base.tempLow` | number | Low temperature | Celsius |
| `base.snow` | number | Expected snowfall | Centimeters |
| `base.rain` | number | Expected rainfall | Millimeters |
| `base.windSpeed` | number | Average wind speed | km/h |
| `base.windGust` | number | Wind gust speed | km/h |
| `mid.*` | — | Same fields for mid-mountain | — |
| `summit.*` | — | Same fields for summit | — |

**Hourly Forecast:**
| Field | Type | Description | Unit |
|---|---|---|---|
| `datetime` | string | Forecast timestamp | ISO 8601 |
| `elevation` | string | base / mid / summit | — |
| `temp` | number | Temperature | Celsius |
| `feelsLike` | number | Apparent temperature | Celsius |
| `precipitation` | number | Precip amount | mm/hour |
| `windSpeed` | number | Wind speed | km/h |
| `windDirection` | number | Wind direction | Degrees (0-360) |
| `humidity` | number | Relative humidity | % |
| `cloudCover` | number | Cloud coverage | % |

---

#### 1.3.5 Webcams Endpoint (`GET /resort/:id/webcams`)

**Response Schema:**
```json
{
  "resort": 123,
  "webcams": [
    {
      "id": 456,
      "name": "Mid-Vail Cam",
      "url": "https://cdn.vail.com/webcams/midvail.jpg",
      "streamUrl": "https://stream.vail.com/midvail.m3u8",
      "location": {
        "latitude": 39.6420,
        "longitude": -106.3700,
        "elevation": 3000,
        "description": "Mid-mountain looking east"
      },
      "updatedAt": "2026-02-06T08:35:00Z"
    }
  ]
}
```

**Data Fields:**
| Field | Type | Description |
|---|---|---|
| `id` | number | Webcam identifier |
| `name` | string | Webcam name |
| `url` | string | Static image URL (JPEG) |
| `streamUrl` | string | Live stream URL (HLS/m3u8) |
| `location.latitude` | number | GPS coordinates |
| `location.longitude` | number | GPS coordinates |
| `location.elevation` | number | Webcam elevation (meters) |
| `location.description` | string | View description |
| `updatedAt` | string | Last image update |

---

#### 1.3.6 Regions Endpoint (`GET /regions`)

**Response Schema:**
```json
{
  "regions": [
    {
      "id": 45,
      "name": "Colorado",
      "slug": "colorado",
      "country": "USA",
      "resortCount": 28
    }
  ]
}
```

**Data Fields:**
| Field | Type | Description |
|---|---|---|
| `id` | number | Region identifier |
| `name` | string | Region name (state/province) |
| `slug` | string | URL-friendly identifier |
| `country` | string | Country code |
| `resortCount` | number | # of resorts in region |

---

### 1.4 OnTheSnow API Limitations

**What OnTheSnow API Provides:**
- ✅ Real-time snow reports (updated multiple times daily)
- ✅ 7-day weather forecasts (base, mid, summit)
- ✅ Lift and trail status (open counts)
- ✅ Resort profiles (location, stats, amenities)
- ✅ Live webcams

**What OnTheSnow API Does NOT Provide:**
- ❌ **No interpretation layer** — Raw data, no recommendations
- ❌ **No personalization** — Same data for all users (no location-based ranking)
- ❌ **No multi-source fusion** — Only OnTheSnow's data (no SNOTEL, OSM, etc.)
- ❌ **No user behavior tracking** — Can't learn preferences
- ❌ **No drive-time data** — No proximity calculations
- ❌ **No storm severity scoring** — Just snowfall numbers, no "chase-worthy" classification
- ❌ **No trip planning** — No flight/lodging/rental car integration
- ❌ **No historical data** — Limited to recent 7 days
- ❌ **No predictive analytics** — No forecast quality scoring
- ❌ **No pass awareness** — Doesn't know which resorts are on Epic/Ikon/Indy

**Key Insight:** OnTheSnow API is a **data provider**, not a **decision engine**. OnlySnow adds the intelligence layer on top.

---

## 2. Data Enhancement Strategy

### 2.1 Five Enhancement Layers

OnlySnow will enhance OnTheSnow's base data through **five strategic layers**:

#### Layer 1: Multi-Source Data Fusion

**Goal:** Supplement OnTheSnow data with additional sources for richer, more accurate information

| Data Source | What It Adds | Update Frequency | Cost |
|---|---|---|---|
| **Open-Meteo API** | 10-day weather forecasts, ECMWF/GFS models | 4x daily | Free |
| **NOAA GFS** | Long-range forecasts (10-16 days) | Daily | Free |
| **SNOTEL (NRCS)** | Snowpack % of normal, SWE data | Daily | Free |
| **OpenStreetMap** | Interactive trail maps, piste data | Weekly refresh | Free (ODbL license) |
| **Google Maps API** | Drive times, traffic conditions | Real-time | $0.005/request |
| **Google Flights API** | Flight prices for destination trips | Real-time | Affiliate (free to access) |
| **Booking.com API** | Lodging prices and availability | Real-time | Affiliate (free to access) |

**Implementation:**
```
OnTheSnow base data → Supabase → Enrichment pipeline → Enhanced data
                          ↓
                  Additional APIs (Open-Meteo, SNOTEL, etc.)
```

**Example Enhancement:**
```json
// OnTheSnow API provides:
{
  "resort": 123,
  "depth": {
    "base": 150,
    "summit": 220
  },
  "recent": [
    {"date": "2026-02-06", "snow": 25}
  ]
}

// OnlySnow enhances with:
{
  "resort": 123,
  "depth": {
    "base": 150,
    "summit": 220,
    "percentOfNormal": 110  // ← from SNOTEL
  },
  "recent": [
    {"date": "2026-02-06", "snow": 25}
  ],
  "extended": [  // ← from Open-Meteo (10-16 day forecast)
    {"date": "2026-02-13", "snow": 35},
    {"date": "2026-02-14", "snow": 40}
  ],
  "trailMapData": {  // ← from OpenStreetMap
    "geojson": "...",
    "pisteCounts": {
      "green": 18,
      "blue": 57,
      "black": 120
    }
  }
}
```

**Sources:**
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [NOAA GFS Forecast API](https://open-meteo.com/en/docs/gfs-api)
- [SNOTEL Data (NRCS)](https://www.nrcs.usda.gov/resources/data-and-reports/snow-and-water-interactive-map)

---

#### Layer 2: Intelligent Interpretation

**Goal:** Convert raw data into actionable insights (storm severity, recommendation scores, quality ratings)

**2.1 Storm Severity Scoring**

OnTheSnow says: "25cm snowfall expected"
OnlySnow interprets: "**Chase-worthy storm** (18-24" forecast, flight prices from NYC $289)"

**Scoring Algorithm:**
```typescript
interface StormSeverity {
  level: 'none' | 'quiet' | 'light' | 'moderate' | 'significant' | 'heavy' | 'epic' | 'chase';
  score: number; // 0-100
  reasoning: string;
}

function calculateStormSeverity(
  snowfall24h: number,
  snowfall48h: number,
  baseDepth: number,
  snowpackPercent: number,
  windSpeed: number
): StormSeverity {
  let score = 0;

  // 24-hour snowfall (40% weight)
  if (snowfall24h >= 60) score += 40; // 24"+
  else if (snowfall24h >= 45) score += 30; // 18-24"
  else if (snowfall24h >= 30) score += 20; // 12-18"
  else if (snowfall24h >= 15) score += 10; // 6-12"

  // 48-hour snowfall (30% weight)
  if (snowfall48h >= 90) score += 30; // 36"+
  else if (snowfall48h >= 60) score += 20; // 24-36"
  else if (snowfall48h >= 30) score += 10; // 12-24"

  // Base depth (15% weight)
  if (baseDepth >= 200) score += 15; // Deep base
  else if (baseDepth >= 150) score += 10;
  else if (baseDepth >= 100) score += 5;

  // Snowpack % of normal (10% weight)
  if (snowpackPercent >= 120) score += 10; // Above normal
  else if (snowpackPercent >= 90) score += 5;

  // Wind penalty (5% weight)
  if (windSpeed > 60) score -= 5; // Wind holds likely

  // Classify
  if (score >= 90) return { level: 'chase', score, reasoning: 'Major storm, fly-out worthy' };
  if (score >= 75) return { level: 'epic', score, reasoning: 'Epic conditions, road trip worthy' };
  if (score >= 60) return { level: 'heavy', score, reasoning: 'Heavy snow, great day' };
  if (score >= 45) return { level: 'significant', score, reasoning: 'Significant snowfall' };
  if (score >= 30) return { level: 'moderate', score, reasoning: 'Moderate snowfall' };
  if (score >= 15) return { level: 'light', score, reasoning: 'Light snow' };
  if (score >= 5) return { level: 'quiet', score, reasoning: 'Quiet conditions' };
  return { level: 'none', score: 0, reasoning: 'No snow expected' };
}
```

**2.2 Resort Recommendation Scoring**

**Goal:** Rank resorts by "should you ski there today/this weekend?"

```typescript
interface ResortScore {
  resort: number;
  score: number; // 0-100
  rank: number;
  factors: {
    snowfall: number; // 0-40 pts
    baseDepth: number; // 0-20 pts
    terrainOpen: number; // 0-15 pts
    surfaceConditions: number; // 0-10 pts
    weatherQuality: number; // 0-10 pts
    passStatus: number; // 0-5 pts (free vs walk-up)
  };
}

function calculateResortScore(
  resort: Resort,
  userLocation: Location,
  userPass: PassType,
  timeWindow: TimeWindow
): ResortScore {
  // Snowfall score (40% weight)
  const snowfallScore = Math.min(40, (resort.snowfall24h / 60) * 40);

  // Base depth score (20% weight)
  const baseScore = Math.min(20, (resort.depth.base / 300) * 20);

  // Terrain open % (15% weight)
  const terrainScore = (resort.terrain.runs.open / resort.terrain.runs.total) * 15;

  // Surface conditions (10% weight)
  const surfaceScore = getSurfaceScore(resort.surfaceType); // powder=10, ice=2

  // Weather quality (10% weight)
  const weatherScore = 10 - (resort.weather.windSpeed / 10); // wind penalty

  // Pass status (5% weight)
  const passScore = resort.passTypes.includes(userPass) ? 5 : 0;

  const totalScore = snowfallScore + baseScore + terrainScore + surfaceScore + weatherScore + passScore;

  return {
    resort: resort.id,
    score: totalScore,
    rank: 0, // Set after sorting
    factors: {
      snowfall: snowfallScore,
      baseDepth: baseScore,
      terrainOpen: terrainScore,
      surfaceConditions: surfaceScore,
      weatherQuality: weatherScore,
      passStatus: passScore
    }
  };
}
```

**2.3 "Worth Knowing" Discovery Algorithm**

**Goal:** Surface resorts NOT on user's list when they're having significantly better conditions

```typescript
function shouldShowWorthKnowing(
  resort: Resort,
  userTopResort: Resort,
  userFollowedResorts: number[]
): boolean {
  // Don't show if user already follows this resort
  if (userFollowedResorts.includes(resort.id)) return false;

  // Must be within user's drive radius
  if (resort.driveTime > user.driveRadiusMax) return false;

  // Threshold: 50% more snow than user's best resort
  if (resort.snowfall24h > userTopResort.snowfall24h * 1.5) return true;

  // OR: 2x better surface conditions (powder vs ice)
  if (resort.surfaceScore > userTopResort.surfaceScore * 2) return true;

  return false;
}
```

**Sources:**
- [RRC Associates: Mountain Resort Data Analysis](https://www.rrcassociates.com/where-we-work/mountain-resorts/)

---

#### Layer 3: User Behavior Tracking

**Goal:** Learn user preferences to personalize recommendations over time

**3.1 User Events to Track**

| Event | What It Signals | How to Use It |
|---|---|---|
| **Resort Tap** | Interest in this resort | Boost ranking for similar resorts (aspect, terrain, difficulty) |
| **Worth Knowing Dismissal** | Not interested in this resort | Lower threshold for future "Worth Knowing" alerts |
| **Storm Alert Click** | User responds to chase-worthy storms | Lower threshold for chase alerts (user is a storm chaser) |
| **Trip Plan Completion** | User books a destination trip | Learn budget, preferred destination regions |
| **Forecast View Duration** | User spends 30+ sec on resort detail | Strong interest signal, boost ranking |
| **Notification Dismissal** | User dismisses powder alert | Raise threshold for future notifications (reduce noise) |
| **Session Frequency** | User opens app 3+ times/week | Engaged user, prioritize for premium upsell |

**3.2 Persona Classification (Machine Learning)**

```typescript
interface UserBehaviorSignals {
  tapFrequency: number; // taps per week
  avgTapsPerSession: number;
  mostTappedResorts: number[]; // resort IDs
  worthKnowingEngagement: number; // % of alerts clicked
  chaseAlertEngagement: number;
  tripPlansCompleted: number;
  avgTripBudget: number;
  preferredDayOfWeek: string; // weekday vs weekend
  avgSessionDuration: number; // seconds
}

function classifyPersona(signals: UserBehaviorSignals): PersonaType {
  // Storm Chaser: High chase alert engagement, completes trip plans, flexible schedule
  if (signals.chaseAlertEngagement > 0.7 && signals.tripPlansCompleted > 2) {
    return 'storm-chaser';
  }

  // Weekend Warrior: Only skis weekends, high frequency, local resorts only
  if (signals.preferredDayOfWeek === 'weekend' && signals.tapFrequency > 5 && signals.tripPlansCompleted === 0) {
    return 'weekend-warrior';
  }

  // Family Planner: Plans far in advance, looks at family-friendly resorts
  if (signals.mostTappedResorts.includes(familyFriendlyResorts) && signals.avgSessionDuration > 180) {
    return 'family-planner';
  }

  // Core Local: Very high frequency (15+ days/season), taps same resort repeatedly
  if (signals.tapFrequency > 10 && signals.mostTappedResorts.length <= 3) {
    return 'core-local';
  }

  // Default: Weekend Warrior (most common persona)
  return 'weekend-warrior';
}
```

**3.3 Collaborative Filtering**

**Goal:** "Users like you also skied at these resorts"

```sql
-- Find users with similar tap patterns
WITH user_similarity AS (
  SELECT
    u2.user_id,
    COUNT(DISTINCT u2.resort_id) AS common_taps,
    ARRAY_AGG(u2.resort_id) AS their_taps
  FROM user_taps u1
  JOIN user_taps u2 ON u1.resort_id = u2.resort_id
  WHERE u1.user_id = :current_user_id
    AND u2.user_id != :current_user_id
  GROUP BY u2.user_id
  HAVING COUNT(DISTINCT u2.resort_id) >= 3
  ORDER BY common_taps DESC
  LIMIT 50
)
SELECT
  resort_id,
  COUNT(*) AS recommendation_score
FROM user_similarity
WHERE resort_id NOT IN (
  SELECT resort_id FROM user_taps WHERE user_id = :current_user_id
)
GROUP BY resort_id
ORDER BY recommendation_score DESC
LIMIT 10;
```

**Sources:**
- [Alpine Media: Audience Segmentation for Ski Resorts](https://www.alpinemedia.com/blog/audience-segmentation-for-ski-resorts-a-comprehensive-guide-to-personalized-guest-experiences)
- [ScienceDirect: Data-Driven Personas](https://www.sciencedirect.com/science/article/pii/S2543925122000560)

---

#### Layer 4: Drive-Time Intelligence

**Goal:** Personalize resort rankings by proximity (drive time, not just distance)

**4.1 Google Maps Distance Matrix API Integration**

```typescript
interface DriveTimeRequest {
  origins: Location[]; // User's home location
  destinations: Location[]; // Resort locations
  mode: 'driving'; // Always driving for ski trips
  departureTime: Date; // Consider traffic
  trafficModel: 'best_guess' | 'pessimistic' | 'optimistic';
}

interface DriveTimeResponse {
  origin: Location;
  destination: Location;
  distance: {
    value: number; // meters
    text: string; // "120 km"
  };
  duration: {
    value: number; // seconds
    text: string; // "1 hour 45 mins"
  };
  durationInTraffic: {
    value: number; // seconds with traffic
    text: string;
  };
}

async function fetchDriveTimes(
  userLocation: Location,
  resorts: Resort[]
): Promise<Map<number, DriveTimeResponse>> {
  const destinations = resorts.map(r => ({ lat: r.latitude, lng: r.longitude }));

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/distancematrix/json?` +
    `origins=${userLocation.lat},${userLocation.lng}&` +
    `destinations=${destinations.map(d => `${d.lat},${d.lng}`).join('|')}&` +
    `departure_time=now&` +
    `traffic_model=best_guess&` +
    `key=${GOOGLE_MAPS_API_KEY}`
  );

  const data = await response.json();

  const driveTimesMap = new Map<number, DriveTimeResponse>();
  data.rows[0].elements.forEach((element, index) => {
    driveTimesMap.set(resorts[index].id, {
      origin: userLocation,
      destination: destinations[index],
      distance: element.distance,
      duration: element.duration,
      durationInTraffic: element.duration_in_traffic
    });
  });

  return driveTimesMap;
}
```

**4.2 Drive Time Ranking Adjustment**

```typescript
// Penalize distant resorts, even if they have great snow
function adjustScoreForDriveTime(
  score: number,
  driveTimeMinutes: number,
  userDriveRadiusMax: number
): number {
  const maxDriveTimeMinutes = userDriveRadiusMax * 60;

  // No penalty if within user's comfort zone (< 2 hours)
  if (driveTimeMinutes <= 120) return score;

  // Linear penalty: 10% score reduction per extra hour
  const excessHours = (driveTimeMinutes - 120) / 60;
  const penalty = excessHours * 10;

  return Math.max(0, score - penalty);
}
```

**4.3 "On the Way" Intelligence**

**Goal:** Show resorts that are on the route to user's destination

```typescript
// Check if Resort B is "on the way" to Resort A
function isOnTheWay(
  origin: Location,
  destination: Location,
  intermediate: Location,
  maxDetourMinutes: number = 15
): boolean {
  // Direct route: origin → destination
  const directRoute = calculateDriveTime(origin, destination);

  // Detour route: origin → intermediate → destination
  const detourRoute =
    calculateDriveTime(origin, intermediate) +
    calculateDriveTime(intermediate, destination);

  // If detour adds < 15 minutes, it's "on the way"
  return (detourRoute - directRoute) <= maxDetourMinutes * 60;
}
```

**Example Use Case:**
User is driving from Denver to Crested Butte (4.5 hours). OnlySnow suggests:
- "Monarch Mountain is on the way (+10 min detour) and got 18" last night. Stop there first?"

**Sources:**
- [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/overview)

---

#### Layer 5: Predictive Analytics

**Goal:** Forecast quality scoring, booking price predictions, trend analysis

**5.1 Forecast Quality Scoring**

**Challenge:** Weather forecasts 7+ days out are uncertain. How confident should user be?

```typescript
interface ForecastQuality {
  confidence: 'high' | 'medium' | 'low';
  score: number; // 0-100
  reasoning: string;
}

function assessForecastQuality(
  forecastDaysOut: number,
  modelAgreement: number, // % agreement between GFS, ECMWF
  historicalAccuracy: number // % accuracy for this region
): ForecastQuality {
  let score = 100;

  // Confidence decreases with forecast range
  if (forecastDaysOut <= 3) score -= 0; // High confidence
  else if (forecastDaysOut <= 5) score -= 15; // Medium confidence
  else if (forecastDaysOut <= 7) score -= 30; // Lower confidence
  else if (forecastDaysOut <= 10) score -= 50; // Low confidence

  // Model agreement increases confidence
  if (modelAgreement >= 0.9) score += 10; // Models agree
  else if (modelAgreement < 0.6) score -= 20; // Models disagree

  // Historical accuracy
  score = score * (historicalAccuracy / 100);

  // Classify
  if (score >= 75) return { confidence: 'high', score, reasoning: 'Models agree, short range' };
  if (score >= 50) return { confidence: 'medium', score, reasoning: 'Reasonable confidence' };
  return { confidence: 'low', score, reasoning: 'Long range, models uncertain' };
}
```

**Display to User:**
```
Storm Tracker:
"S. Colorado: 18-30" expected Feb 10-12"
[Forecast confidence: Medium (65%)]
```

**5.2 Booking Price Prediction**

**Goal:** "Book flights now or wait? Prices likely to drop/rise"

```typescript
interface PricePrediction {
  currentPrice: number;
  predictedPrice: number;
  trend: 'rising' | 'stable' | 'falling';
  recommendation: 'book-now' | 'wait' | 'monitor';
}

function predictFlightPrices(
  origin: string,
  destination: string,
  departureDate: Date,
  historicalPrices: number[]
): PricePrediction {
  const currentPrice = historicalPrices[historicalPrices.length - 1];
  const avgPrice = historicalPrices.reduce((a, b) => a + b) / historicalPrices.length;

  // Simple trend: compare current to 7-day average
  const recentAvg = historicalPrices.slice(-7).reduce((a, b) => a + b) / 7;

  let trend: 'rising' | 'stable' | 'falling';
  let predictedPrice: number;
  let recommendation: 'book-now' | 'wait' | 'monitor';

  if (currentPrice > recentAvg * 1.1) {
    trend = 'rising';
    predictedPrice = currentPrice * 1.05; // Expect 5% increase
    recommendation = 'book-now';
  } else if (currentPrice < recentAvg * 0.9) {
    trend = 'falling';
    predictedPrice = currentPrice * 0.95; // Expect 5% decrease
    recommendation = 'wait';
  } else {
    trend = 'stable';
    predictedPrice = currentPrice;
    recommendation = 'monitor';
  }

  return { currentPrice, predictedPrice, trend, recommendation };
}
```

**Display to User:**
```
Trip Planner:
Flights: EWR → MTJ $289 (↑ 15% from yesterday)
[Recommendation: Book now — prices rising]
```

---

### 2.2 Data Enhancement Comparison Table

| Data Field | OnTheSnow API | OnlySnow Enhancement | Value Add |
|---|---|---|---|
| **Snow Depth** | Base, mid, summit (cm) | + Snowpack % of normal (SNOTEL) | Context: "110% of normal" |
| **7-Day Forecast** | Snow totals, temps | + 10-16 day extended (Open-Meteo)<br>+ Forecast quality score | Longer planning window, confidence |
| **Resort List** | All resorts, no ranking | + Ranked by score (snow + conditions)<br>+ Drive time from user location | Personalized, actionable |
| **Lift/Trail Status** | Open counts | + Webcam analysis (AI: crowd levels)<br>+ Real-time user reports | More granular conditions |
| **Weather** | Daily forecasts | + Storm severity scoring<br>+ "Chase-worthy" classification | Interpretation layer |
| **Surface Conditions** | Code (1-18) | + Text explanation<br>+ Quality score (powder=10, ice=2) | User-friendly |
| **Historical Data** | 7 days only | + 10-year snowfall history<br>+ Seasonal trends | Long-term context |
| **Personalization** | None | + User behavior tracking<br>+ Persona classification<br>+ Collaborative filtering | Learns preferences |
| **Trip Planning** | None | + Flight prices (Google Flights)<br>+ Lodging prices (Booking.com)<br>+ Total trip cost calculator | End-to-end solution |
| **Pass Awareness** | None | + Epic/Ikon/Indy pass filters<br>+ Walk-up vs free indicator | Cost transparency |
| **Trail Maps** | None | + Interactive maps (OSM GeoJSON)<br>+ Piste difficulty overlay | Visual planning |

---

## 3. Database Schema Design

### 3.1 Core Tables (Supabase PostgreSQL + PostGIS)

#### 3.1.1 `resorts` Table

```sql
CREATE TABLE resorts (
  id BIGSERIAL PRIMARY KEY,
  onthesnow_id INTEGER UNIQUE, -- From OnTheSnow API
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  region_id INTEGER REFERENCES regions(id),

  -- Location (PostGIS geometry)
  location GEOGRAPHY(POINT, 4326), -- lat/lng
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  elevation_base INTEGER, -- meters
  elevation_summit INTEGER,
  timezone TEXT, -- IANA timezone

  -- Stats
  vertical_drop INTEGER, -- meters
  total_acres INTEGER,
  total_runs INTEGER,
  total_lifts INTEGER,
  longest_run DECIMAL(5, 2), -- km
  avg_annual_snowfall INTEGER, -- cm

  -- Terrain %
  terrain_beginner INTEGER, -- %
  terrain_intermediate INTEGER,
  terrain_advanced INTEGER,

  -- Amenities
  night_skiing BOOLEAN DEFAULT false,
  snowmaking BOOLEAN DEFAULT false,
  ski_school BOOLEAN DEFAULT false,
  child_care BOOLEAN DEFAULT false,
  rental BOOLEAN DEFAULT false,

  -- Pass affiliations
  pass_types TEXT[], -- ['epic', 'ikon', 'indy', 'independent']

  -- Contact
  phone TEXT,
  website TEXT,
  email TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX resorts_location_gist ON resorts USING GIST(location);
CREATE INDEX resorts_region_id_idx ON resorts(region_id);
CREATE INDEX resorts_pass_types_gin ON resorts USING GIN(pass_types);
```

---

#### 3.1.2 `snow_reports` Table

```sql
CREATE TABLE snow_reports (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,
  report_date DATE NOT NULL,

  -- Status
  open_flag INTEGER, -- 1=Open, 2=Closed, etc.
  opening_date DATE,
  closing_date DATE,

  -- Snow depths (cm)
  depth_base INTEGER,
  depth_middle INTEGER,
  depth_summit INTEGER,

  -- Snowfall (cm)
  snowfall_24h INTEGER,
  snowfall_48h INTEGER,
  snowfall_72h INTEGER,
  snowfall_7day INTEGER,

  -- Lifts
  lifts_total INTEGER,
  lifts_open INTEGER,

  -- Terrain
  runs_total INTEGER,
  runs_open INTEGER,
  runs_beginner_pct INTEGER,
  runs_intermediate_pct INTEGER,
  runs_advanced_pct INTEGER,
  acres_total INTEGER,
  acres_open INTEGER,
  parks_total INTEGER,
  parks_open INTEGER,

  -- Surface conditions
  surface_type_summit INTEGER, -- 1-18 codes
  surface_type_base INTEGER,

  -- Enhanced data (OnlySnow-specific)
  snowpack_percent_normal INTEGER, -- From SNOTEL
  storm_severity TEXT, -- 'none', 'light', ..., 'chase'
  storm_score INTEGER, -- 0-100
  forecast_quality_score INTEGER, -- 0-100 (confidence)

  -- Metadata
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'onthesnow', -- 'onthesnow', 'snotel', 'open-meteo'

  UNIQUE(resort_id, report_date)
);

CREATE INDEX snow_reports_resort_date_idx ON snow_reports(resort_id, report_date DESC);
CREATE INDEX snow_reports_storm_severity_idx ON snow_reports(storm_severity);
```

---

#### 3.1.3 `weather_forecasts` Table

```sql
CREATE TABLE weather_forecasts (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  forecast_generated_at TIMESTAMPTZ NOT NULL,
  elevation TEXT NOT NULL, -- 'base', 'mid', 'summit'

  -- Daily weather
  temp_high INTEGER, -- Celsius
  temp_low INTEGER,
  snow_cm INTEGER, -- Expected snowfall
  rain_mm INTEGER, -- Expected rainfall
  wind_speed INTEGER, -- km/h
  wind_gust INTEGER,
  wind_direction INTEGER, -- degrees
  humidity INTEGER, -- %
  cloud_cover INTEGER, -- %

  -- Enhanced data
  precipitation_type TEXT, -- 'snow', 'rain', 'mixed'
  freeze_level INTEGER, -- meters (altitude where rain turns to snow)

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  source TEXT DEFAULT 'onthesnow', -- 'onthesnow', 'open-meteo', 'gfs'

  UNIQUE(resort_id, forecast_date, elevation, source)
);

CREATE INDEX weather_forecasts_resort_date_idx ON weather_forecasts(resort_id, forecast_date);
```

---

#### 3.1.4 `webcams` Table

```sql
CREATE TABLE webcams (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,
  onthesnow_id INTEGER,
  name TEXT NOT NULL,
  url TEXT, -- Static image URL
  stream_url TEXT, -- Live stream URL (HLS)

  -- Location
  latitude DECIMAL(10, 7),
  longitude DECIMAL(10, 7),
  elevation INTEGER, -- meters
  description TEXT,

  -- Metadata
  last_updated TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX webcams_resort_id_idx ON webcams(resort_id);
```

---

#### 3.1.5 `drive_times` Table

```sql
CREATE TABLE drive_times (
  id BIGSERIAL PRIMARY KEY,
  user_location GEOGRAPHY(POINT, 4326),
  user_location_text TEXT, -- "Denver, CO" for display
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,

  -- Drive time data (from Google Maps API)
  distance_meters INTEGER,
  distance_text TEXT, -- "120 km"
  duration_seconds INTEGER,
  duration_text TEXT, -- "1 hour 45 mins"
  duration_in_traffic_seconds INTEGER,

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Cache for 7 days

  UNIQUE(user_location, resort_id)
);

CREATE INDEX drive_times_user_location_gist ON drive_times USING GIST(user_location);
CREATE INDEX drive_times_resort_id_idx ON drive_times(resort_id);
CREATE INDEX drive_times_expires_at_idx ON drive_times(expires_at);
```

---

#### 3.1.6 `trail_maps` Table

```sql
CREATE TABLE trail_maps (
  id BIGSERIAL PRIMARY KEY,
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,

  -- Trail map data (GeoJSON from OpenStreetMap)
  geojson JSONB, -- Piste lines, lifts, base areas

  -- Piste counts (parsed from GeoJSON)
  piste_count_total INTEGER,
  piste_count_green INTEGER, -- Beginner
  piste_count_blue INTEGER, -- Intermediate
  piste_count_red INTEGER, -- Advanced
  piste_count_black INTEGER, -- Expert

  -- Metadata
  data_source TEXT DEFAULT 'openstreetmap',
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(resort_id)
);

CREATE INDEX trail_maps_resort_id_idx ON trail_maps(resort_id);
```

---

#### 3.1.7 `user_events` Table (Behavioral Tracking)

```sql
CREATE TABLE user_events (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'resort_tap', 'worth_knowing_dismiss', 'trip_plan_complete', etc.

  -- Event data
  resort_id BIGINT REFERENCES resorts(id),
  session_id UUID,
  metadata JSONB, -- Flexible structure for event-specific data

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX user_events_user_id_idx ON user_events(user_id);
CREATE INDEX user_events_event_type_idx ON user_events(event_type);
CREATE INDEX user_events_created_at_idx ON user_events(created_at DESC);
```

---

#### 3.1.8 `user_personas` Table

```sql
CREATE TABLE user_personas (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,

  -- Persona classification
  persona_type TEXT NOT NULL, -- 'storm-chaser', 'weekend-warrior', etc.
  confidence_score DECIMAL(3, 2), -- 0.00-1.00
  secondary_persona TEXT, -- Second-best fit

  -- Behavioral signals (derived from user_events)
  tap_frequency DECIMAL(5, 2), -- taps per week
  avg_taps_per_session DECIMAL(5, 2),
  most_tapped_resorts INTEGER[], -- Array of resort IDs
  worth_knowing_engagement DECIMAL(3, 2), -- 0.00-1.00
  chase_alert_engagement DECIMAL(3, 2),
  trip_plans_completed INTEGER,
  avg_trip_budget INTEGER, -- USD
  preferred_day_of_week TEXT, -- 'weekday', 'weekend', 'any'
  avg_session_duration INTEGER, -- seconds

  -- Metadata
  classified_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX user_personas_user_id_idx ON user_personas(user_id);
CREATE INDEX user_personas_persona_type_idx ON user_personas(persona_type);
```

---

#### 3.1.9 `resort_scores` Table (Pre-computed Rankings)

```sql
CREATE TABLE resort_scores (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  resort_id BIGINT REFERENCES resorts(id) ON DELETE CASCADE,
  time_window TEXT NOT NULL, -- 'today', 'weekend', 'next_5_days', 'next_10_days'

  -- Scores
  total_score DECIMAL(5, 2), -- 0-100
  rank INTEGER, -- 1st, 2nd, 3rd, etc.

  -- Score breakdown
  snowfall_score DECIMAL(5, 2),
  base_depth_score DECIMAL(5, 2),
  terrain_open_score DECIMAL(5, 2),
  surface_conditions_score DECIMAL(5, 2),
  weather_quality_score DECIMAL(5, 2),
  pass_status_score DECIMAL(5, 2),
  drive_time_penalty DECIMAL(5, 2),

  -- Metadata
  calculated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ, -- Cache for 6 hours

  UNIQUE(user_id, resort_id, time_window)
);

CREATE INDEX resort_scores_user_time_window_idx ON resort_scores(user_id, time_window, rank);
CREATE INDEX resort_scores_expires_at_idx ON resort_scores(expires_at);
```

---

### 3.2 Materialized Views (Performance Optimization)

#### 3.2.1 `resort_rankings_today` (Materialized View)

```sql
CREATE MATERIALIZED VIEW resort_rankings_today AS
SELECT
  r.id AS resort_id,
  r.name,
  r.slug,
  sr.snowfall_24h,
  sr.depth_base,
  sr.storm_severity,
  sr.storm_score,
  sr.runs_open,
  sr.runs_total,
  (sr.runs_open::DECIMAL / NULLIF(sr.runs_total, 0)) AS terrain_open_pct,
  sr.surface_type_summit,
  sr.updated_at
FROM resorts r
JOIN snow_reports sr ON r.id = sr.resort_id
WHERE sr.report_date = CURRENT_DATE
  AND sr.open_flag = 1
ORDER BY sr.storm_score DESC;

CREATE UNIQUE INDEX ON resort_rankings_today(resort_id);

-- Refresh every 6 hours via cron job
-- SELECT refresh_materialized_view_concurrently('resort_rankings_today');
```

---

## 4. Data Pipeline Architecture

### 4.1 Data Flow Overview

```
External APIs → Ingestion Pipelines → Supabase → Enhancement Layer → API → Frontend
     ↓                                    ↓              ↓
OnTheSnow API              Cache (Redis)  Enrichment    react-leaflet
Open-Meteo                                (scoring,      (display)
SNOTEL                                    ranking,
Google Maps                               personalization)
OpenStreetMap
```

### 4.2 Ingestion Pipelines

#### Pipeline 1: OnTheSnow Data Ingestion

**Frequency:** Every 6 hours (4x daily)
**Script:** `pipelines/onthesnow-ingestion/index.ts`

```typescript
// Pseudocode
async function ingestOnTheSnowData() {
  const regions = await fetchRegions(); // Cache for 30 days

  for (const region of regions) {
    const resorts = await fetchResorts(region.id); // Cache for 30 days

    for (const resort of resorts) {
      // Fetch snow reports (cache for 6 hours)
      const snowReport = await fetchSnowReport(resort.id);
      await upsertSnowReport(resort.id, snowReport);

      // Fetch weather forecast (cache for 6 hours)
      const weather = await fetchWeather(resort.id);
      await upsertWeatherForecast(resort.id, weather);

      // Fetch webcams (cache for 24 hours)
      const webcams = await fetchWebcams(resort.id);
      await upsertWebcams(resort.id, webcams);

      // Rate limit: 1 request per second
      await sleep(1000);
    }
  }
}
```

---

#### Pipeline 2: SNOTEL Data Ingestion

**Frequency:** Daily (6am MT)
**Script:** `pipelines/snotel-ingestion/index.ts`

```typescript
async function ingestSNOTELData() {
  const stations = await fetchSNOTELStations(); // All 800+ stations

  for (const station of stations) {
    const data = await fetchSNOTELData(station.id);

    // Find nearest resorts (within 50km)
    const nearbyResorts = await findResortsNearStation(station.location, 50);

    for (const resort of nearbyResorts) {
      await updateSnowpackPercent(resort.id, data.snowpackPercentNormal);
    }
  }
}
```

---

#### Pipeline 3: Open-Meteo Extended Forecast

**Frequency:** Daily (8am UTC)
**Script:** `pipelines/open-meteo-ingestion/index.ts`

```typescript
async function ingestOpenMeteoForecasts() {
  const resorts = await getAllResorts();

  for (const resort of resorts) {
    // Fetch 16-day forecast from Open-Meteo
    const forecast = await fetchOpenMeteoForecast(resort.latitude, resort.longitude);

    // Store days 8-16 (OnTheSnow only provides 7 days)
    for (let day = 8; day <= 16; day++) {
      await upsertWeatherForecast(resort.id, forecast.daily[day], 'open-meteo');
    }
  }
}
```

---

#### Pipeline 4: Drive Time Calculation

**Frequency:** On-demand (when user sets location)
**Script:** `pipelines/drive-times/index.ts`

```typescript
async function calculateDriveTimes(userLocation: Location) {
  const resorts = await getResortsWithinRadius(userLocation, 500); // 500 km

  // Batch API call (Google Maps supports up to 25 destinations per request)
  const batches = chunk(resorts, 25);

  for (const batch of batches) {
    const driveTimes = await fetchDriveTimes(userLocation, batch);

    for (const [resortId, driveTime] of driveTimes.entries()) {
      await upsertDriveTime(userLocation, resortId, driveTime);
    }
  }
}
```

---

#### Pipeline 5: Resort Scoring & Ranking

**Frequency:** Every 6 hours (after OnTheSnow data refresh)
**Script:** `pipelines/scoring/index.ts`

```typescript
async function calculateResortScores() {
  const users = await getAllActiveUsers();

  for (const user of users) {
    const resorts = await getUserResorts(user.id); // User's followed resorts + nearby
    const driveTimes = await getDriveTimes(user.location, resorts);

    const scores: ResortScore[] = [];

    for (const resort of resorts) {
      const snowReport = await getLatestSnowReport(resort.id);
      const weather = await getLatestWeather(resort.id);
      const driveTime = driveTimes.get(resort.id);

      const score = calculateResortScore(
        resort,
        snowReport,
        weather,
        driveTime,
        user.passType,
        user.persona
      );

      scores.push(score);
    }

    // Rank by total score
    scores.sort((a, b) => b.score - a.score);
    scores.forEach((score, index) => score.rank = index + 1);

    // Store pre-computed rankings
    await upsertResortScores(user.id, scores);
  }
}
```

---

### 4.3 Caching Strategy

**Redis Cache Layers:**

| Data Type | Cache Key | TTL | Rationale |
|---|---|---|---|
| **Snow Reports** | `snow:resort:{id}:latest` | 6 hours | Updated 4x daily |
| **Weather Forecasts** | `weather:resort:{id}:7day` | 6 hours | Updated 4x daily |
| **Resort Profiles** | `resort:profile:{id}` | 30 days | Rarely changes |
| **Drive Times** | `drive:user:{lat,lng}:resort:{id}` | 7 days | Changes with traffic patterns |
| **Resort Rankings** | `rankings:user:{id}:{window}` | 6 hours | Updated after scoring pipeline |
| **API Responses** | `api:resorts:ranked:user:{id}` | 5 minutes | Reduce DB load |

**Cache Invalidation:**
- OnTheSnow data refresh → Invalidate `snow:*` and `weather:*`
- User changes location → Invalidate `drive:user:*` and `rankings:user:*`
- Scoring pipeline completes → Invalidate `rankings:*` and `api:*`

---

## 5. Data Quality & Validation

### 5.1 Data Quality Checks

**Automated Validation Pipeline:**

```typescript
interface DataQualityCheck {
  field: string;
  rule: string;
  severity: 'error' | 'warning' | 'info';
  action: 'reject' | 'flag' | 'auto-fix';
}

const snowReportChecks: DataQualityCheck[] = [
  {
    field: 'depth_base',
    rule: 'value >= 0 AND value <= 1000',
    severity: 'error',
    action: 'reject'
  },
  {
    field: 'snowfall_24h',
    rule: 'value >= 0 AND value <= 200',
    severity: 'error',
    action: 'reject'
  },
  {
    field: 'lifts_open',
    rule: 'lifts_open <= lifts_total',
    severity: 'error',
    action: 'reject'
  },
  {
    field: 'updated_at',
    rule: 'updated_at > NOW() - INTERVAL \'24 hours\'',
    severity: 'warning',
    action: 'flag'
  }
];

async function validateSnowReport(report: SnowReport): Promise<boolean> {
  for (const check of snowReportChecks) {
    const isValid = evaluateRule(report, check.rule);

    if (!isValid) {
      if (check.action === 'reject') {
        logger.error(`Invalid data: ${check.field} failed rule: ${check.rule}`);
        return false;
      } else if (check.action === 'flag') {
        await flagDataQualityIssue(report.id, check.field, check.rule);
      }
    }
  }

  return true;
}
```

### 5.2 Multi-Source Data Reconciliation

**Challenge:** OnTheSnow says 25cm snowfall, Open-Meteo says 35cm. Which is correct?

```typescript
async function reconcileSnowfallData(
  resortId: number,
  date: Date
): Promise<number> {
  const onthesnow = await getSnowfallFromOnTheSnow(resortId, date);
  const openmeteo = await getSnowfallFromOpenMeteo(resortId, date);
  const snotel = await getSnowfallFromSNOTEL(resortId, date);

  // Weight sources by reliability
  const sources = [
    { value: onthesnow, weight: 0.5 }, // Resort self-reported (most reliable)
    { value: openmeteo, weight: 0.3 }, // Model-based
    { value: snotel, weight: 0.2 } // Nearby station
  ].filter(s => s.value !== null);

  // Weighted average
  const totalWeight = sources.reduce((sum, s) => sum + s.weight, 0);
  const weightedSum = sources.reduce((sum, s) => sum + s.value * s.weight, 0);

  return Math.round(weightedSum / totalWeight);
}
```

---

## 6. Performance & Caching Strategy

### 6.1 API Response Time Targets

| Endpoint | Target Latency | Cache Strategy |
|---|---|---|
| `GET /resorts` | <200ms | Redis cache (5 min TTL) |
| `GET /resort/:id` | <150ms | Redis cache (5 min TTL) |
| `GET /resorts/ranked` | <300ms | Pre-computed in `resort_scores` table |
| `GET /resort/:id/trail-map` | <500ms | CDN-cached GeoJSON (24 hr TTL) |
| `POST /user/events` | <100ms | Async write (no blocking) |

### 6.2 Database Query Optimization

**Slow Query Example:**
```sql
-- BAD: Full table scan, no indexes
SELECT * FROM snow_reports
WHERE resort_id IN (
  SELECT id FROM resorts WHERE region_id = 45
)
ORDER BY snowfall_24h DESC;
```

**Optimized Query:**
```sql
-- GOOD: Uses indexes, materialized view
SELECT * FROM resort_rankings_today
WHERE resort_id IN (
  SELECT id FROM resorts WHERE region_id = 45
)
ORDER BY snowfall_24h DESC
LIMIT 50;
```

### 6.3 Horizontal Scaling Plan

**Year 1:** Single Supabase instance (Pro plan, $25/month)
**Year 2:** Read replicas for high-traffic queries
**Year 3:** Sharding by region (Colorado DB, Utah DB, etc.)

---

## 7. Implementation Roadmap

### Phase 1: Foundation (Months 1-2)

**Week 1-2: Database Setup**
- ✅ Set up Supabase project (Pro plan)
- ✅ Create core tables (`resorts`, `snow_reports`, `weather_forecasts`)
- ✅ Add PostGIS extension for geographic queries
- ✅ Set up Redis cache (Upstash, $10/month)

**Week 3-4: OnTheSnow Integration**
- ✅ Sign up for OnTheSnow Partner API (paid plan)
- ✅ Build ingestion pipeline (`pipelines/onthesnow-ingestion/`)
- ✅ Test data ingestion for 100 resorts
- ✅ Set up cron job (every 6 hours via Vercel Cron)

**Deliverables:**
- 500+ resorts in database with real-time snow data
- API endpoint: `GET /resorts/ranked` (basic ranking, no personalization)

---

### Phase 2: Enhancement (Months 3-4)

**Week 5-6: Multi-Source Fusion**
- ✅ Build SNOTEL ingestion pipeline
- ✅ Build Open-Meteo ingestion pipeline
- ✅ Add enhanced data fields to `snow_reports` table
- ✅ Implement data reconciliation logic

**Week 7-8: Intelligent Interpretation**
- ✅ Implement storm severity scoring algorithm
- ✅ Implement resort recommendation scoring
- ✅ Pre-compute rankings (materialized view)
- ✅ Build "Worth Knowing" discovery algorithm

**Deliverables:**
- Enhanced data: snowpack % of normal, 16-day forecasts, storm severity
- API endpoint: `GET /resorts/ranked?userId={id}` (personalized rankings)

---

### Phase 3: Personalization (Months 5-6)

**Week 9-10: User Behavior Tracking**
- ✅ Implement `user_events` table
- ✅ Add event tracking to frontend (tap, dismiss, view duration)
- ✅ Build persona classification algorithm
- ✅ Async event processing (don't block API responses)

**Week 11-12: Drive-Time Intelligence**
- ✅ Integrate Google Maps Distance Matrix API
- ✅ Build drive-time calculation pipeline
- ✅ Add drive-time penalty to resort scoring
- ✅ Implement "on the way" logic

**Deliverables:**
- Persona classification for each user (stored in `user_personas` table)
- Drive-time aware rankings: "Loveland (1h 15m) ranked higher than CB (4h 30m)"

---

### Phase 4: Advanced Features (Months 7-12)

**Month 7-8: Trail Maps & Webcams**
- ✅ Build OpenStreetMap ingestion pipeline
- ✅ Store GeoJSON trail data in `trail_maps` table
- ✅ Render interactive maps with `react-leaflet`
- ✅ Integrate OnTheSnow webcams

**Month 9-10: Predictive Analytics**
- ✅ Implement forecast quality scoring
- ✅ Track flight price history (Google Flights API)
- ✅ Build price prediction model (simple trend analysis)
- ✅ Display recommendations: "Book now — prices rising"

**Month 11-12: Trip Planning**
- ✅ Integrate flight booking (Google Flights affiliate)
- ✅ Integrate lodging booking (Booking.com affiliate)
- ✅ Build trip cost calculator
- ✅ Complete trip planning flow (Chase Mode → Book)

**Deliverables:**
- Interactive trail maps for 200+ resorts
- Predictive analytics: forecast confidence, price trends
- End-to-end trip planning with booking integration

---

## Appendix A: API Response Examples

### Example 1: Enhanced Resort Ranking

**Request:**
```
GET /api/resorts/ranked?userId=abc123&window=today
```

**Response:**
```json
{
  "resorts": [
    {
      "id": 123,
      "name": "Crested Butte",
      "slug": "crested-butte",
      "score": 92.5,
      "rank": 1,
      "factors": {
        "snowfall": 38.0,
        "baseDepth": 18.5,
        "terrainOpen": 14.2,
        "surfaceConditions": 10.0,
        "weatherQuality": 7.3,
        "passStatus": 5.0,
        "driveTimePenalty": -0.5
      },
      "snowReport": {
        "snowfall24h": 25,
        "depthBase": 185,
        "runsOpen": 142,
        "runsTotal": 147,
        "terrainOpenPct": 96.6,
        "surfaceType": "Powder",
        "stormSeverity": "epic",
        "stormScore": 85,
        "updatedAt": "2026-02-06T08:30:00Z"
      },
      "driveTime": {
        "durationMinutes": 270,
        "durationText": "4 hours 30 mins",
        "distanceKm": 420
      },
      "passStatus": "included",
      "reasoning": "Epic conditions with 25cm overnight, excellent base depth, 96.6% terrain open"
    },
    {
      "id": 456,
      "name": "Loveland",
      "slug": "loveland",
      "score": 88.2,
      "rank": 2,
      "factors": {
        "snowfall": 32.0,
        "baseDepth": 16.0,
        "terrainOpen": 13.5,
        "surfaceConditions": 9.0,
        "weatherQuality": 8.2,
        "passStatus": 0.0,
        "driveTimePenalty": 9.5
      },
      "snowReport": {
        "snowfall24h": 20,
        "depthBase": 160,
        "runsOpen": 84,
        "runsTotal": 93,
        "terrainOpenPct": 90.3,
        "surfaceType": "Packed Powder",
        "stormSeverity": "heavy",
        "stormScore": 78,
        "updatedAt": "2026-02-06T07:45:00Z"
      },
      "driveTime": {
        "durationMinutes": 75,
        "durationText": "1 hour 15 mins",
        "distanceKm": 95
      },
      "passStatus": "walk-up",
      "walkUpPrice": 89,
      "reasoning": "Heavy snow with 20cm overnight, close proximity (1h 15m), walk-up $89"
    }
  ],
  "worthKnowing": [
    {
      "id": 789,
      "name": "Monarch Mountain",
      "reasoning": "Getting 67% more snow than your top resort (Crested Butte), on the way (+15 min detour), walk-up $59",
      "snowfall24h": 30,
      "walkUpPrice": 59,
      "onTheWay": true,
      "detourMinutes": 15
    }
  ],
  "stormTracker": {
    "severity": "epic",
    "message": "S. Colorado: 18-30\" expected Feb 10-12",
    "forecastConfidence": "medium",
    "confidenceScore": 65,
    "affectedResorts": [123, 456, 789]
  }
}
```

---

## Appendix B: Data Sources Reference

### Commercial APIs

| Provider | URL | Pricing | Coverage |
|---|---|---|---|
| **OnTheSnow** | [partner.docs.onthesnow.com](https://partner.docs.onthesnow.com/) | $500-5K/month | 2,000+ resorts |
| **Google Maps** | [developers.google.com/maps](https://developers.google.com/maps/documentation/distance-matrix) | $0.005/request | Global |
| **Google Flights** | [developers.google.com/flights](https://developers.google.com/) | Affiliate (free) | Global |
| **Booking.com** | [developers.booking.com](https://developers.booking.com/) | Affiliate (5-12%) | Global |

### Free APIs

| Provider | URL | License | Coverage |
|---|---|---|---|
| **Open-Meteo** | [open-meteo.com](https://open-meteo.com/en/docs) | Free (non-commercial) | Global |
| **NOAA GFS** | [open-meteo.com/gfs-api](https://open-meteo.com/en/docs/gfs-api) | Public domain | Global |
| **SNOTEL** | [nrcs.usda.gov/snow](https://www.nrcs.usda.gov/resources/data-and-reports/snow-and-water-interactive-map) | Public domain | Western U.S. (800+ stations) |
| **OpenStreetMap** | [openstreetmap.org](https://www.openstreetmap.org/) | ODbL | Global (100K+ km pistes) |

### Sources Cited

- [Mountain News Partner API](https://partner.docs.onthesnow.com/)
- [Open-Meteo API](https://open-meteo.com/en/docs)
- [NOAA GFS Forecast API](https://open-meteo.com/en/docs/gfs-api)
- [SNOTEL Data (NRCS)](https://www.nrcs.usda.gov/resources/data-and-reports/snow-and-water-interactive-map)
- [Google Maps Distance Matrix API](https://developers.google.com/maps/documentation/distance-matrix/overview)
- [Mapbox: Build a Ski Trail Map Using OSM](https://www.mapbox.com/blog/build-a-ski-trail-map-using-openstreetmap-and-mts)
- [RRC Associates: Mountain Resort Data Analysis](https://www.rrcassociates.com/where-we-work/mountain-resorts/)
- [Alpine Media: Audience Segmentation](https://www.alpinemedia.com/blog/audience-segmentation-for-ski-resorts-a-comprehensive-guide-to-personalized-guest-experiences)

---

**Last Updated:** February 6, 2026
**Next Review:** March 2026 (after Phase 1 completion)

**Questions or Feedback?**
Contact: chris@onlysnow.com
