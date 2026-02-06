# Epic 202: Flight & Lodging Price Integration

**Status:** Not started (trip costs currently hardcoded)
**Priority:** Medium — revenue-generating feature, highest-value user segment
**Phase:** D (Revenue & growth)

## Context

The chase trip planner shows flight prices, lodging options, and rental car costs — all hardcoded. The backend `/api/chase/[region]/trip` uses a `COST_ESTIMATES` object with static regional price ranges. The affiliate links return template Skyscanner/Booking.com URLs.

The product spec identifies destination travelers as the highest-value user segment ($1,000–3,000 per trip, 2-5 trips/season) and affiliate commissions as a primary revenue stream.

## Goal

Real-time (or near-real-time) flight and lodging prices in chase trip plans, with working affiliate links that generate revenue.

## User Stories

### 202.1 — Flight price data source
- Research and integrate a flight price API:
  - **Google Flights** (via SerpAPI or similar scraping service)
  - **Skyscanner API** (affiliate program)
  - **Kiwi.com API** (affiliate program with direct API access)
  - **Amadeus API** (free tier: 500 calls/month)
- For each chase alert: query flights from user's nearest airports to region's best airport
- Cache results (1-hour TTL — prices change but not minute-by-minute)

### 202.2 — Lodging price data source
- Research and integrate a lodging API:
  - **Booking.com Affiliate API** (5-12% commission)
  - **Expedia Rapid API** (5-10% commission)
  - **Google Hotels** (via SerpAPI)
- Query by: destination, dates, 2-night minimum
- Return: hotel name, price/night, rating, link

### 202.3 — Update trip estimation endpoint
- Replace `COST_ESTIMATES` in `/api/chase/[region]/trip` with real API calls
- Fallback to estimates when API unavailable
- Include `isEstimate: boolean` flag in response so frontend can display "(estimated)" label
- Track affiliate click-throughs (redirect through our URL for attribution)

### 202.4 — Rental car prices (stretch)
- **Kayak** or **RentalCars.com** affiliate API
- Query by: airport, dates, AWD/4WD filter for mountain driving
- Lower priority than flights/lodging

### 202.5 — Price drop notifications (stretch, depends on Epic 300)
- Track prices over time for active chase alerts
- Notify user when flight price drops significantly (>$50)
- "EWR→MTJ dropped from $349 to $249 — book now"

## Verification

- [ ] Chase trip plan shows real flight prices for user's airport → destination
- [ ] Lodging options show real prices and availability
- [ ] Affiliate links include tracking parameters
- [ ] Prices are cached (not re-fetched on every page load)
- [ ] Fallback to estimates when API unavailable, with "(estimated)" label
- [ ] `pnpm build` and `pnpm typecheck` pass

## Revenue Impact

Per product spec:
- 1,000 users × 1 trip/season × $1,500 avg trip × 5% affiliate = $75K/season from chase trips
- Flight affiliates: $5–15 per booking
- Hotel affiliates: 5–12% commission
- Rental car: $3–8 per booking
