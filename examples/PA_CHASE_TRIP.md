# Example: Pennsylvania Destination Traveler

**Scenario**: Lives in Scranton, PA. Ikon pass. Skis Elk Mountain / Montage / Camelback locally. Will fly West to chase a big storm 2-3x per season.

---

## The Problem

This user operates at two scales:
- **Weekly**: "Where should I ski Saturday in the Poconos?"
- **Chase mode**: "Something historic is happening out West. Should I book a flight?"

OpenSnow can handle the first (if you set up favorites). Nobody handles the second — connecting storm forecasts to flight prices to trip logistics.

---

## What the User Sees

### Normal Week (Home Mode)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESORTS · Ikon · From Scranton

                  24hr  Next 5d  Base  Open  Drive
Elk Mountain       1"     2"     18"   100%  1h15
Montage            1"     1"     12"   80%   45m
Camelback          0"     1"     8"    75%   30m

Weak clipper. Elk has the best coverage.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💡 WORTH KNOWING

Killington (VT)    4"     6"     38"   90%   4h30
Ikon ✓ · 3x your local. Worth a weekend trip?
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

STORMS · Nothing chase-worthy in the next 10 days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Storm Brewing Out West (6 days out)

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESORTS · Ikon · From Scranton
[same local table — nothing changed locally]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🟡 STORMS · S. Colorado: 18-30" possible Feb 10-13
   Models still diverging. Worth watching.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Storm Locked In (4 days out)

Push notification:
> 🔴 Chase alert: Telluride forecast 18-24". On your Ikon pass. EWR→MTJ $289 RT. Tap for trip plan.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESORTS · Ikon · From Scranton
[same local table]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔴 STORMS · S. Colorado: 18-30" Feb 10-13
   Telluride: 18-24" · On Ikon ✓
   EWR→MTJ $289 RT · Tap for trip plan →
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### Tap → Chase Trip Plan

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ✈️  CHASE TRIP: Telluride, CO
 Feb 11-14 (Wed-Sat) · 3 nights · Ikon ✓
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 SNOW FORECAST
 Telluride:       18-24" (Tue-Thu)
 Crested Butte:   15-20" (Ikon ✗, Epic only)
 Silverton:       24-30" (expert heli, $59)

 Best on your pass: Telluride

 FLIGHTS
 EWR → MTJ:  $289 RT  (United, Tue 2pm → 6pm)
 EWR → DEN:  $180 RT  (but 6hr drive to Telluride)
 ⚠️ Book today — Montrose flights sell out fast

 LODGING
 Hotel Telluride:  $195/night (walk to gondola)
 Airbnb avg:       $160/night
 Book now — small town, limited inventory

 RENTAL CAR
 Montrose airport: $55/day (AWD recommended)

 SKI PLAN
 Wed: Storm active. Ski PM if lifts open. Trees.
 Thu: POWDER DAY. First chair 9am. Revelation Bowl.
 Fri: Day 2. Steeps + trees still have stashes.
 Sat: Groomed. Cruise. Depart 2pm for flight.

 ESTIMATED TOTAL
 Flights:        $289
 Lodging (3n):   $585
 Rental car:     $165
 Lift tickets:   $0 (Ikon pass)
 Food/misc:      $200
 ─────────────────
 TOTAL:          ~$1,239

 Cost per powder day: ~$413

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 💡 18-24" at Telluride is a 2-3x per season event.
    $1,239 for 2 powder days + 1 groomer day.
    Book flights by Saturday — prices will jump
    once the forecast firms up Sunday.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Why This Works

1. **Same interface, two scales** — Local Poconos table + national storm tracker on one screen
2. **Escalating alerts** — Yellow (watching) → Red (book now) over 6 days
3. **Complete trip plan** — Not just "storm coming" but flights + hotels + car + ski plan + total cost
4. **Pass-aware** — Knows Telluride is on Ikon, CB is not. Recommends accordingly.
5. **Timing pressure** — "Book by Saturday, prices jump Sunday" creates urgency that matches reality
6. **Decision deadline** — Tells you WHEN to decide, not just WHAT to decide
7. **Cost transparency** — "$1,239 total, $413 per powder day" — you can evaluate immediately
