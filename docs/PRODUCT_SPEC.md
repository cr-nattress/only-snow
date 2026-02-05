# Product Spec: The Ski Decision Engine

**Date**: 2026-02-05
**Status**: Concept / First Draft
**Source**: Session analysis of OpenSnow, skier personas, and real-world user scenarios

---

## One Sentence

**Tell us where you live and what pass you have. We'll tell you where to ski and when.**

---

## The Setup (30 seconds)

First time only. Three questions:

```
1. Where do you live?
   [ Denver, CO          ]

2. What pass do you have?
   [Epic] [Ikon] [Indy] [Multi] [None]

3. How far will you drive on a normal day?
   [1 hr] [2 hr] [3 hr]

   Will you travel for a big storm?
   [Yes — anywhere] [Yes — within driving] [No]
```

That's it. From this we know:
- Which resorts are in your backyard
- Which ones are on your pass
- Your drive radius
- Whether to enable chase alerts

Everything else is inferred or learned over time.

---

## The Single Screen

One screen. Three sections. Answers everything.

```
┌─────────────────────────────────────────────────┐
│                                                   │
│  ① YOUR RESORTS                                   │
│                                                   │
│  ② WORTH KNOWING                                  │
│                                                   │
│  ③ STORM TRACKER                                  │
│                                                   │
└─────────────────────────────────────────────────┘
```

That's the whole app. Let's break each section down.

---

### ① YOUR RESORTS

Every resort on your pass within your drive radius. Ranked by snow forecast. Always visible.

**Normal day (dry, groomed conditions):**

```
YOUR RESORTS · Epic · From Denver
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                  24hr  Next 5d  Base   Open
Breckenridge       0"     0"     24"    64%   1h30
Keystone           0"     0"     26"    70%   1h30
Vail               0"     0"     37"    60%   1h40
Beaver Creek       0"     0"     33"    55%   1h50

Conditions: Groomed everywhere. No new snow.
Best pick: Breckenridge (most terrain open)
```

Compact. Scannable. The ranking shifts every time the forecast updates.

**Storm day:**

```
YOUR RESORTS · Epic · From Denver
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                  24hr  Next 5d  Base   Open
Vail              10"     2"     47"    85%   1h40
Beaver Creek       8"     2"     41"    80%   1h50
Breckenridge       4"     1"     28"    75%   1h30
Keystone           3"     1"     29"    72%   1h30

❄️ POWDER DAY — Vail got the most. Back Bowls
are loaded. Leave by 6:30am, garage fills 8:30.
```

Same format. Order flipped because Vail got the most snow. One-line recommendation at the bottom.

**Incoming storm:**

```
YOUR RESORTS · Epic · From Denver
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                  24hr  Next 5d  Base   Open
Vail               0"    9-12"   37"    60%   1h40
Beaver Creek       0"    8-10"   33"    55%   1h50
Breckenridge       0"    4-8"    24"    64%   1h30
Keystone           0"    3-6"    26"    70%   1h30

❄️ STORM ARRIVING TUE — NW flow favors Vail.
Best powder day: Wed Feb 12 at Vail.
```

Same table. The "Next 5d" column now has forecast ranges instead of zeros. That column IS the 10-day forecast — compressed into one number per resort.

### Key design choice: The table IS the forecast

OpenSnow shows one resort's 15-day chart at a time. We show ALL your resorts in one table with one forecast number each. You can see at a glance that Vail is getting 9-12" while Keystone is getting 3-6". No scrolling through charts. No mental comparison.

If you want the detailed daily breakdown for one resort, tap it. But the default view is the comparative table.

---

### ② WORTH KNOWING

Only appears when a resort NOT in your list is having a meaningfully better day or forecast than your best resort. Hidden when there's nothing to report.

```
💡 WORTH KNOWING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Loveland        6"   --    42"   85%   1h15   $89
Got 2x your best resort today. 15 min closer
than Breck. No-frills, but the snow is real.
```

One resort. Maybe two. Never a wall of text. Only the ones where the differential is large enough to matter. Includes pass status and walk-up price because that's the immediate question: "what would it cost me?"

**Rules:**
- Appears when a non-followed resort has >50% more snow (24hr or forecast) than your best followed resort
- Must be within your drive radius
- Shows walk-up price if not on your pass
- Disappears when your resorts are the best options (most days, this section is empty)

---

### ③ STORM TRACKER

A small, persistent bar at the bottom. Most days it's quiet. When something big is coming, it lights up.

**Quiet day:**

```
STORMS · Nothing major in the next 10 days
```

One line. Grey. Ignorable.

**Something brewing:**

```
🟡 STORMS · CO: 8-14" expected Feb 10-12
```

One line. Yellow. Interesting but not actionable yet for a destination traveler.

**Chase-worthy:**

```
🔴 STORMS · S. Colorado: 18-30" Feb 10-13 · ✈️ $289 RT
   Tap for trip plan →
```

One line. Red. Flight price right in the bar. Tapping opens the full chase trip breakdown (flights, hotels, rental car, ski plan, cost estimate).

**For a local who doesn't travel:**

```
🟢 STORMS · Your area: 9-12" coming Tue
   Vail getting the most →
```

The storm tracker adapts to the user. Local-only users see it as a "storm incoming for your resorts" alert. Travelers see it as a national radar.

---

## How It Adapts to Different Users

### Chris in Avon (Epic, local + road trips)

```
┌─────────────────────────────────────────────────┐
│ YOUR RESORTS · Epic · From Avon                   │
│                                                   │
│                24hr  Next 5d  Base  Open          │
│ Vail            1"    9-12"   37"   60%   10m    │
│ Beaver Creek    0"    8-10"   33"   55%   15m    │
│                                                   │
│ ❄️ Storm Tue. Vail gets the most locally.         │
├─────────────────────────────────────────────────┤
│ 💡 WORTH KNOWING                                  │
│ Copper          0"   10-14"   30"   75%   45m    │
│ Ikon · $139 walk-up                               │
│ Getting more than BC from this storm.             │
├─────────────────────────────────────────────────┤
│ 🔴 STORMS · Crested Butte: 15-20" Feb 10-13     │
│    On your pass. 3h30 drive. Worth it? →          │
└─────────────────────────────────────────────────┘
```

### Denver weekend warrior (Epic, weekends only)

```
┌─────────────────────────────────────────────────┐
│ YOUR RESORTS · Epic · From Denver                 │
│                                                   │
│                24hr  Next 5d  Base  Open          │
│ Breckenridge    3"     0"     24"   64%   1h30   │
│ Keystone        2"     0"     26"   70%   1h30   │
│ Vail            1"     0"     37"   60%   1h40   │
│                                                   │
│ This weekend: 🟡 Groomers. Breck has most snow.  │
│ Next weekend: 🟢 Post-storm! Vail best pick.     │
├─────────────────────────────────────────────────┤
│ 💡 WORTH KNOWING                                  │
│ Loveland        6"     0"     42"   85%   1h15   │
│ $89 walk-up · Best snow on I-70 today             │
├─────────────────────────────────────────────────┤
│ STORMS · 9-12" on I-70 corridor Tue              │
└─────────────────────────────────────────────────┘
```

### PA destination traveler (Ikon, local + chase)

```
┌─────────────────────────────────────────────────┐
│ YOUR RESORTS · Ikon · From Scranton               │
│                                                   │
│                24hr  Next 5d  Base  Open          │
│ Elk Mountain    1"     2"     18"   100%  1h15   │
│ Montage         1"     1"     12"   80%   45m    │
│ Camelback       0"     1"     8"    75%   30m    │
│                                                   │
│ Weak clipper system. Elk's your best bet.         │
├─────────────────────────────────────────────────┤
│ WORTH KNOWING                                     │
│ Killington (VT) 4"    6"     38"   90%   4h30   │
│ Ikon ✓ · 3x your local resorts this weekend.     │
├─────────────────────────────────────────────────┤
│ 🔴 STORMS · S. Colorado: 18-30" Feb 10-13       │
│    Telluride: 18-24" · On Ikon ✓                  │
│    EWR→MTJ $289 RT · Tap for trip plan →          │
└─────────────────────────────────────────────────┘
```

---

## Interactions

### Tap a resort → Detail view

```
VAIL · Next 10 Days
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[The OpenSnow-style daily forecast bar chart]
[Detailed daily breakdown: temp, wind, precip]
[Expert take from Joel Gratz]
[Webcam]
[Trail count, lift count, grooming report]
```

This is where the detailed data lives. For power users who want the numbers. But it's one tap deep, not the default.

### Tap "Worth Knowing" resort → Same detail + context

```
LOVELAND · Why we're showing this
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Got 6" in the last 24hr — 2x your best resort.
Walk-up: $89 · 1h 15m from Denver
Not on Epic, but cheapest powder in the state.

[Detailed forecast]
[Add to My Resorts?]
```

### Tap storm tracker → Chase trip plan

```
CHASE TRIP: Telluride
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Full trip breakdown: flights, hotels, car, ski plan]
[Estimated total cost]
[Book now links]
[Day-by-day powder forecast]
```

### Swipe between time windows

The main table has a subtle time toggle:

```
[Today] [This Weekend] [Next 5 Days] [Next 10 Days]
```

- **Today**: Ranks by 24hr snowfall + current conditions
- **This Weekend**: Ranks by Sat-Sun forecast
- **Next 5 Days**: Ranks by 5-day forecast total
- **Next 10 Days**: Ranks by 10-day forecast total

Swiping changes the ranking. Your resorts reorder. The "best pick" recommendation updates.

---

## What We DON'T Show

Ruthlessly excluded from the main screen:

- Hourly forecast tables
- Snow ratio, snow level, humidity
- Weather station data
- Moon phase
- Avalanche details (unless High or Extreme — then it's a warning badge)
- Season snowfall totals
- Historical snowpack comparisons
- Trail maps
- Social media links

All of this exists in the detail view for people who want it. None of it belongs on the decision screen.

---

## The Information Architecture

```
MAIN SCREEN (the decision)
├── Your Resorts (table, ranked by snow)
├── Worth Knowing (contextual, 0-2 resorts)
└── Storm Tracker (1-line bar)

TAP RESORT → DETAIL SCREEN (the data)
├── 10-day forecast chart
├── Daily breakdown
├── Expert take
├── Webcams
├── Resort stats (trails, lifts, grooming)
└── Conditions detail

TAP STORM → CHASE SCREEN (the plan)
├── Region overview (which resorts, how much)
├── Best resort for your pass
├── Flight options + prices
├── Lodging options
├── Rental car
├── Day-by-day ski plan
└── Total cost estimate

SETTINGS
├── Home location
├── Pass type
├── Drive radius
├── Chase preferences (on/off, regions, budget)
├── Notification preferences
└── My Resorts (add/remove/reorder)
```

Three levels. Main screen for decisions. Detail screen for data. Chase screen for trip planning. Settings for personalization.

---

## How It Learns

The product gets smarter over time without the user doing anything:

1. **If you always tap Vail first** → Vail moves to the top of your list (even on dry days)
2. **If you never tap Camelback** → It drops lower in the ranking
3. **If you tap "Worth Knowing" resorts often** → The threshold for showing them lowers (you like discovering new spots)
4. **If you dismiss chase alerts** → The threshold raises (you're mostly a local skier)
5. **If you book a chase trip** → The system learns your actual budget and preferences for next time

No configuration required. The app adapts to how you actually ski.

---

## Notification Strategy

The app is most valuable as a **notification-first experience**. Most people won't open a ski app every day. But they'll respond to the right push notification.

| Notification | When | Example |
|-------------|------|---------|
| **Powder alert** | 24hr snowfall > 6" at a your resort | "Vail got 8" overnight ❄️" |
| **Storm incoming** | 5-day forecast shows >6" at your resorts | "9-12" hitting Vail Tuesday" |
| **Worth knowing** | Non-followed resort significantly outperforms | "Loveland got 6" today — 2x your resorts, $89" |
| **Weekend outlook** | Thursday evening | "This weekend: Breck is your best bet 🟡" |
| **Chase alert** | Major storm forecast at a distant pass resort | "🔴 Telluride: 18-24" next week. EWR→MTJ $289" |
| **Price alert** | Flight or lodging for an active chase drops in price | "MTJ flights dropped to $249 ✈️" |

**Never send**: Routine dry-day updates, minor forecasts, temperature reports.

The rule: every notification should be **actionable**. If the user can't do anything with it, don't send it.

---

## Revenue Model

| Source | How It Works | Revenue Per Event |
|--------|-------------|-------------------|
| Flight affiliates | "Book EWR→MTJ $289" link | $5-15 per booking |
| Hotel affiliates | "Hotel Telluride $195/night" link | 5-12% commission |
| Rental car affiliates | "AWD from Montrose $55/day" link | $3-8 per booking |
| Lift ticket partnerships | "Buy 3-day pass $169/day" link | $5-10 per sale |
| Premium subscription | Chase alerts + trip planner | $9.99/mo (ski season) |
| Advertising | Resort-sponsored "Worth Knowing" placements | CPM |

The destination traveler segment is extremely valuable. If we help 1,000 users book one chase trip each per season at an average trip value of $1,500, that's $1.5M in referred bookings. At a 5% average commission, that's $75K from chase trips alone.

---

## What Makes This Different From Everything Else

| Product | What It Does | What It Doesn't Do |
|---------|-------------|-------------------|
| **OpenSnow** | Best weather data per resort | No comparison, no recommendations, no trip planning |
| **Epic/Ikon app** | Pass benefits, lift tickets | No snow data, no cross-pass comparison, no chase |
| **Ski booking sites** | Package deals | No weather intelligence, no real-time storm tracking |
| **Google Flights** | Cheap flights | Doesn't know a storm is coming or which airport matters |
| **Us** | All of the above, connected by snow intelligence | — |

The insight: **all the pieces exist separately. Nobody has connected them.**

Snow data + pass data + location data + flight data + lodging data + storm intelligence = a product that tells you where to ski, when to go, and how to get there.

That's the entire product in one sentence.

---

## MVP: What to Build First

### Phase 1: The Table (core value, no revenue yet)
- Setup: location + pass + drive radius
- Your Resorts: ranked table with 24hr / forecast / base / open / drive time
- Time toggle: Today / This Weekend / Next 5 Days
- Tap for resort detail
- Data sources: weather API + resort APIs + static database

### Phase 2: Worth Knowing (discovery, trust-building)
- Monitor all resorts in user's state/region
- Surface when non-followed resort outperforms
- Include pass status + walk-up price

### Phase 3: Storm Tracker + Notifications (engagement)
- National-scale storm monitoring
- Push notifications for powder days + incoming storms
- Weekend outlook notifications

### Phase 4: Chase Mode + Trip Planning (revenue)
- Chase alerts for destination travelers
- Flight price integration
- Lodging/rental car suggestions
- Trip cost calculator
- Affiliate links

### Phase 5: Learning + Personalization
- Behavioral learning (which resorts you tap, which alerts you act on)
- Adaptive thresholds
- Personalized "best pick" based on history
