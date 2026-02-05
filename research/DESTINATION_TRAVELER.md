# The Destination Traveler Persona

**Date**: 2026-02-05
**Scenario**: Lives in Pennsylvania. Skis locally most weekends. Will fly West to chase a big storm 2-3x per season.

---

## Two Modes, One User

This person doesn't think about skiing the way a local does. They have:

**HOME MODE** — Weekly, low-stakes, driving distance
- Montage, Elk Mountain, Camelback, Blue Mountain, Jack Frost, Big Boulder
- Maybe Killington, Stowe, Jay Peak (3-5 hrs for a weekend trip)
- Decision: "Where has the best conditions within 2-3 hours?"
- Works exactly like the local model we've already designed

**CHASE MODE** — 2-3x per season, high-stakes, requires flights
- Colorado (multiple regions), Utah (multiple resorts), California (Tahoe + Mammoth), Wyoming (Jackson Hole), Montana (Big Sky)
- Decision: "Something huge is happening somewhere. Is it worth booking a flight?"
- This is a COMPLETELY different decision with different data, different timelines, and different logistics

The product needs to serve both seamlessly.

---

## How Chase Mode Works

### The mental model

The destination traveler isn't monitoring individual resorts out West. They can't — there are 200+ resorts across the Western US. They're monitoring **regions**. The thought process is:

1. "Is anything big happening out West?" (national scale)
2. "Where exactly?" (regional scale → Colorado? Utah? Tahoe?)
3. "Which resorts specifically?" (resort scale → which ones in that region)
4. "Can I get there?" (flights, timing, logistics)
5. "Is it worth the money?" (trip cost vs. quality of experience)

### Step 1: National Storm Radar

The first thing a destination traveler needs is a **national-scale view** that answers: "Is anything worth chasing right now?"

This doesn't exist anywhere in a useful format. OpenSnow has regional daily snows, but you'd have to read 8 different regional forecasts to understand the national picture.

What we show:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 STORM TRACKER · National Overview
 Updated Wed Feb 4, 10pm EST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 NEXT 10 DAYS — WHERE'S THE SNOW?

 🔴 MAJOR EVENT
 Southern Colorado / SW:  18-30"  Feb 10-13
   Crested Butte, Telluride, Silverton, Wolf Creek
   Deep southern storm. Could be biggest of the year.

 🟠 SIGNIFICANT
 Central Colorado:        8-14"   Feb 10-12
   Vail, Beaver Creek, Aspen, Steamboat
   Same storm system, less totals on the I-70.

 🟡 MODERATE
 Utah (Cottonwoods):      6-10"   Feb 11-13
   Alta, Snowbird, Brighton, Solitude
   Tail end of the Colorado storm clips Utah.

 ⚪ QUIET
 California / Tahoe:      0-2"    Dry pattern continues
 Pacific NW:              2-4"    Light refresh
 Northeast:               1-3"    Weak clipper system
 Wyoming / Montana:       0-2"    Dry

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 💡 CHASE ALERT: Southern Colorado, Feb 10-13
    This is chase-worthy from the East Coast.
    See flight + logistics breakdown below.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 2: Region Zoom

User taps "Southern Colorado" — now we zoom into resort-level detail for that region:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SOUTHERN COLORADO · Feb 10-13 Storm
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 FORECAST TOTALS (Tue-Fri)

 🥇 Silverton      24-30"   Expert only, heli/cat
 🥈 Wolf Creek     22-28"   No lodging at base
 🥉 Telluride      18-24"   Best town + terrain combo
    Crested Butte  15-20"   Epic pass ✓
    Purgatory      12-16"   Family-friendly
    Monarch         14-18"   Budget ($59), no-frills

 FOR YOU (Ikon pass holder):
    Best option: Telluride (18-24")
    Telluride is your best pass resort for this
    storm. Great town for 2-3 nights.

 FOR EPIC PASS:
    Best option: Crested Butte (15-20")
    Not as much snow as Telluride, but on Epic.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Step 3: Trip Builder

This is where it gets powerful. The destination traveler doesn't just need to know WHERE — they need a plan to GET THERE on short notice:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✈️  CHASE TRIP: Telluride, CO
 Feb 11-14 (Wed-Sat) · 3 nights
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 FLIGHTS (from PHL/EWR/JFK)
 ─────────────────────────────────────────────────
 Best option: Fly into Montrose (MTJ)
   → 1h 15m drive to Telluride
   → United: EWR → MTJ, $289 RT (book today)
   → Depart Tue 2pm, arrive 6pm local

 Alternative: Fly into Denver (DEN)
   → 6h drive to Telluride (not ideal)
   → Cheaper flights (~$180 RT) but long drive
   → Only if you want to hit I-70 resorts too

 ⚠️ Flights to Montrose WILL sell out once the
    forecast firms up. Book today, refundable
    fare if possible.

 LODGING
 ─────────────────────────────────────────────────
 Telluride town (walk to gondola):
   → Hotel Telluride: $195/night (book now)
   → Airbnb avg: $160/night
   → Mountain Lodge at Telluride: $250/night

 Mountain Village (ski-in/ski-out):
   → More expensive ($300+/night)
   → Worth it if you want first tracks

 RENTAL CAR
 ─────────────────────────────────────────────────
 From Montrose: ~$55/day (AWD recommended)
 Book now — limited inventory at small airports.

 LIFT TICKETS
 ─────────────────────────────────────────────────
 On your pass: ✅ (if Ikon) / ❌ (if Epic)
 Walk-up: ~$189/day
 Multi-day: $169/day for 3+ days
 → Buy in advance online for best price

 SKI PLAN
 ─────────────────────────────────────────────────
 Wed Feb 11: Storm still active. Ski afternoon
   if lifts open. Tree runs hold best in wind.
 Thu Feb 12: POWDER DAY. Storm clears AM.
   First chair 9am. Hit Revelation Bowl first.
   Prospect Bowl by 11am. Gold Hill trees PM.
 Fri Feb 13: Day 2 powder. Steeps + trees still
   have stashes. Less frantic than Day 1.
 Sat Feb 14: Groomed + packed powder. Cruise.
   Depart for Montrose by 2pm for evening flight.

 ESTIMATED TOTAL
 ─────────────────────────────────────────────────
 Flights:        $289
 Lodging (3n):   $585
 Rental car:     $165
 Lift tickets:   $507 (or $0 with pass)
 Food/misc:      $200
 ─────────────────────────
 TOTAL:          ~$1,746 (or ~$1,239 with pass)
 ─────────────────────────
 Cost per powder day: ~$580 (or ~$413 with pass)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 💡 BOTTOM LINE

 18-24" at Telluride is a 2-3x per season event.
 Total trip cost is ~$1,200-1,750. You get 2
 genuine powder days and 1 packed-powder day.

 If you're going to chase one storm this year,
 this is a strong candidate. The southern CO
 mountains are in the bullseye.

 DECISION DEADLINE: Book flights by Saturday.
 After the forecast firms up on Sunday, prices
 will jump and Montrose flights will sell out.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## The Chase Alert System

### Timing matters more for destination travelers

A local skier needs 1-2 days notice. A destination traveler needs **5-7 days** because they have to:
1. Book flights (prices spike as forecast firms up)
2. Book lodging (sells out at small resort towns)
3. Book rental car (limited inventory at regional airports)
4. Arrange time off work
5. Pack and prepare

### The escalation timeline for chase alerts

```
7-10 DAYS OUT (models diverge, low confidence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📡 HEADS UP — Models showing potential major
   storm in southern Colorado next week.
   Totals could be 18-30". Very early — models
   disagree. But worth watching if you're
   thinking about a trip.

   No action needed yet.

5-6 DAYS OUT (models converging)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 STORM TRACK FIRMING UP — Southern Colorado
   is the target. Telluride 18-24", CB 15-20".
   This looks real.

   ✈️ ACTION: Check flight prices now.
   EWR → MTJ is $289 RT. Will likely go up.
   Refundable fare recommended.

3-4 DAYS OUT (high confidence)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 CHASE-WORTHY — This is a go/no-go moment.
   Forecast is locked in. Telluride 18-24".
   
   ✈️ BOOK NOW if you're going.
   Flights: $289 → $340 and rising
   Lodging: Hotel Telluride still has rooms
   Rental car: Book today, Montrose is limited

   Here's your full trip plan: [link]

1-2 DAYS OUT (storm arriving)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
❄️ STORM ARRIVING — Telluride expecting first
   flakes by Tuesday evening. If you booked,
   you're set. If not, flights are $450+ and
   hotels are mostly sold out.

   For next time: earlier alerts = cheaper trips.
```

### What triggers a chase alert?

For a destination traveler, the threshold is much higher than for a local:

| Metric | Threshold for Chase Alert |
|--------|--------------------------|
| Forecast total | 18"+ at a destination resort |
| Storm confidence | Models must agree (not just one run) |
| Duration | Multi-day storm (not a quick 6" dump) |
| Quality | Cold storm (not rain/snow line issues) |
| Timing | Must align with ability to travel (weekday storm = harder) |
| Uniqueness | Is this the best storm of the season so far? |

A 10" storm in Colorado is NOT chase-worthy from Pennsylvania. A 24" storm at Telluride with clear skies after? That's a plane ticket.

---

## The Two-Scale Product

### How it works for the PA skier

**Default view (Home Mode):**
```
MY REGION: Northeast PA · Ikon Pass
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

YOUR RESORTS
  Elk Mountain      2"   1h 15m
  Montage           1"   45 min
  Camelback         1"   30 min

WORTH KNOWING
  Killington (VT)   6"   4h 30m   Ikon ✓
  Got 3x your local. Worth a weekend trip.

NATIONAL STORM TRACKER
  🔴 Southern CO: 18-30" coming Feb 10-13
     [Tap to see chase trip details]
```

The national storm tracker is a **persistent widget** at the bottom of the home view. Most days it says "⚪ No major events nationally." But when something big is brewing, it turns red and shows the opportunity.

### User settings for destination travelers

```
PROFILE SETUP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Home location:     Scranton, PA
Pass:              Ikon
Home airports:     PHL, EWR, AVP
Max drive (local): 3 hours
Weekend trips:     Up to 5 hours drive

CHASE PREFERENCES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Enable chase alerts:    ✅ Yes
Chase regions:          CO, UT, CA, WY, MT
Max trip budget:        $2,000
Trip length:            2-4 days
Alert threshold:        18"+ forecast
Preferred airports:     DEN, SLC, MTJ, JAC
```

This tells the system: "I ski locally in PA. But if something huge is happening in Colorado, Utah, California, Wyoming, or Montana, tell me about it and help me get there for under $2,000."

---

## How Chase Mode Changes the Data Model

For local skiing, we need:
- Snow forecast for ~10-15 nearby resorts
- Drive times from home

For chase mode, we additionally need:
- **National-scale storm tracking** (not resort-level — REGION-level)
- **Flight prices** from the user's home airports to destination airports
- **Lodging availability** at destination resort towns
- **Rental car availability** at small regional airports
- **Airport-to-resort mapping** (Montrose → Telluride, SLC → Alta/Snowbird, JAC → Jackson Hole)
- **Storm quality assessment** (cold/dry snow vs. heavy/wet, rain line elevation)
- **Historical storm frequency** (is this a once-a-season event or average?)

### Region definitions for national tracking

| Region | Key Resorts | Best Airport | Storm Patterns |
|--------|-------------|-------------|----------------|
| Colorado I-70 | Vail, Breck, Copper, Keystone | DEN | NW flow, upslope |
| Colorado South | CB, Telluride, Silverton, Wolf Creek | MTJ, GUC, DRO | SW flow, southern storms |
| Colorado North | Steamboat, Winter Park | DEN, HDN | NW flow, Pacific moisture |
| Utah Cottonwoods | Alta, Snowbird, Brighton, Solitude | SLC | Greatest snow on earth, lake effect |
| Utah Southern | Park City, Deer Valley, Sundance | SLC | Variable |
| California Tahoe | Palisades, Kirkwood, Heavenly | RNO, SMF | Atmospheric rivers, Pineapple Express |
| California South | Mammoth | LAX, MMH | Long-fetch Pacific storms |
| Wyoming | Jackson Hole, Grand Targhee | JAC | NW flow, Tetons catch everything |
| Montana | Big Sky, Whitefish | BZN | Cold, dry, consistent |
| Pacific NW | Mt. Baker, Crystal, Stevens | SEA | Wettest snow, massive totals |
| Northeast | Killington, Stowe, Jay Peak, Sugarloaf | BTV, BOS | Nor'easters, lake effect |

The system monitors these 11 regions. Most days, most regions are quiet. When one lights up, the user gets a notification scaled to the magnitude:

- 6-12" somewhere out West: Not chase-worthy from PA. Don't alert.
- 12-18" somewhere: "📡 FYI — solid storm in Utah this week."
- 18-30": "🎯 Chase-worthy storm in southern CO. Check flights."
- 30"+: "🔴 HISTORIC EVENT — Jackson Hole expecting 36"+. This might not happen again this year."

---

## Revenue Implications

This is where the product gets interesting commercially:

1. **Affiliate revenue on flights** — If we're recommending "book EWR → MTJ for $289," that's a booking we're driving. Flight affiliate commissions are $5-15 per booking.

2. **Lodging partnerships** — "Book the Hotel Telluride at $195/night" is a direct referral. Hotel affiliate commissions are 5-12%.

3. **Rental car referrals** — Same model.

4. **Lift ticket partnerships** — "Buy your 3-day pass in advance for $169/day" — commission or referral fee.

5. **Premium tier** — Chase alerts with trip planning could be a premium feature ($9.99/mo during ski season). The free tier shows the national storm tracker but doesn't build the trip plan.

The destination traveler is the highest-value user in skiing. They spend $1,000-3,000 per trip, multiple times per season. If we help them book better trips to better snow, everyone wins.

---

## Summary

The destination traveler needs the product to operate at two scales simultaneously:

| Scale | Question | Update Frequency |
|-------|----------|-----------------|
| **Local** (Home Mode) | "Where should I ski this Saturday in PA?" | Daily |
| **National** (Chase Mode) | "Is anything historic happening out West?" | Every 12 hours |

When a national event triggers, the product transitions smoothly from "here's where to ski locally" to "here's a complete trip plan to get to Telluride for $1,746."

**The key insight**: The destination traveler doesn't need to follow 200 resorts. They need the system to watch the entire country and tap them on the shoulder when something worth chasing appears. Then it needs to help them ACT on it — flights, lodging, rental car, lift tickets, and a day-by-day ski plan.

Nobody does this. OpenSnow shows weather data. Ski booking sites sell packages. Airline sites sell flights. Nobody connects "a 24-inch storm is coming to Telluride" → "here's a flight for $289 and a hotel for $195 and a ski plan for 3 days."

That connection IS the product for the destination traveler.
