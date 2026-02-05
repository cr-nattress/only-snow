# 🎿 Ski Decision Engine

**Tell us where you live and what pass you have. We'll tell you where to ski and when.**

---

## What Is This?

Every ski data product today starts with a resort. Pick Vail, see Vail's weather data. But that's not how skiers think.

The real question is: **"I have a window to ski. Where's the best snow I can reach?"**

This project is building a **ski decision engine** — a product that starts with YOU (your location, your pass, your drive radius), monitors every resort in range, and tells you where to go and when. It surfaces opportunities you'd miss by only checking your usual spots, and helps you plan trips to chase big storms when they happen.

---

## The Core Idea

### One Screen, Three Sections

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  ① YOUR RESORTS        (always visible, ranked)   │
│                                                   │
│  ② WORTH KNOWING       (appears when relevant)    │
│                                                   │
│  ③ STORM TRACKER       (1-line bar, always there) │
│                                                   │
└─────────────────────────────────────────────────┘
```

**① Your Resorts** — Every resort on your pass within range, ranked by snow forecast. One table. At a glance you see Vail is getting 12" while Keystone is getting 3". No tab-switching, no mental math.

**② Worth Knowing** — Appears ONLY when a resort outside your list is having a meaningfully better day. "Loveland got 6" today — 2x your best resort, $89, 15 min closer than Breck." Most days this section is empty. That's fine.

**③ Storm Tracker** — One line at the bottom. Quiet days: "Nothing major." Big storm brewing: "🔴 S. Colorado: 18-30" Feb 10-13 · ✈️ $289 RT"

### Setup: Three Questions

```
1. Where do you live?
2. What pass do you have?
3. How far will you drive?
```

Everything else is inferred.

---

## Why This Doesn't Exist Yet

| Product | What It Does | What It Doesn't Do |
|---------|-------------|-------------------|
| **OpenSnow** | Best weather data per resort | No comparison, no recommendations, no trip planning |
| **Epic/Ikon App** | Pass benefits, lift tickets | No snow data, no cross-pass insight |
| **Ski Booking Sites** | Package deals | No weather intelligence, no storm tracking |
| **Google Flights** | Cheap flights | Doesn't know a storm is coming |
| **This Product** | Connects all of the above with snow intelligence | — |

All the pieces exist separately. Nobody has connected them.

---

## Documentation

### Product
- **[Product Spec](docs/PRODUCT_SPEC.md)** — Full product specification, UI design, MVP phases, revenue model
- **[Core Data Analysis](research/CORE_DATA_ANALYSIS.md)** — What data skiers actually need (and what they don't)
- **[OpenSnow Comparison](research/OPENSNOW_VS_US.md)** — Detailed analysis of OpenSnow's approach vs. ours

### Research
- **[Skier Personas](research/SKIER_PERSONAS.md)** — 5 skier personas with data needs and journey maps
- **[Destination Traveler](research/DESTINATION_TRAVELER.md)** — The destination traveler persona and chase mode design
- **[Competitive Landscape](research/COMPETITIVE_LANDSCAPE.md)** — Market analysis

### Examples
- **[Denver Epic Weekender](examples/DENVER_EPIC_WEEKENDER.md)** — Hypothetical response for a Denver Epic pass weekend skier
- **[Avon Road Trip](examples/AVON_ROAD_TRIP.md)** — When Crested Butte gets 2x your local snow
- **[PA Chase Trip](examples/PA_CHASE_TRIP.md)** — Destination traveler chasing a Colorado storm from Pennsylvania

### References
- **[OpenSnow Screenshots](references/opensnow/)** — Full page captures of OpenSnow's Vail resort pages (all tabs)

---

## Key Insights

1. **Skiers plan around snow windows, not temperature.** The 10-day snow forecast is the most important data point. Temperature is day-of logistics.

2. **The unit of interest is the REGION, not the resort.** "I'm in Avon, where should I ski?" not "How's Vail?"

3. **OpenSnow's favorites show data. We show decisions.** Same data underneath, completely different experience on top.

4. **The blind spot problem is real.** You follow 4 resorts, there are 25+ in your state. Monarch could be getting hammered and you'd never know.

5. **Destination travelers need 5-7 days lead time.** Forecast-based alerts, not after-the-fact notifications. Book flights before prices spike.

6. **The product is most valuable as notifications.** The right push at the right time: "🔴 Telluride: 18-24" next week. EWR→MTJ $289"

---

## Tech Stack (Planned)

- **Frontend**: Next.js, React, Tailwind
- **Data**: Weather APIs (Open-Meteo), resort APIs, SNOTEL
- **Backend**: Supabase (database, auth, real-time)
- **Notifications**: Push notifications, email digest
- **Integrations**: Flight pricing APIs, lodging APIs, Google Maps

---

## Status

🟡 **Concept / Research Phase**

The product design and research are documented. No code yet. Next step is building the data pipeline (weather forecasts for all US ski resorts) and the MVP table view.
