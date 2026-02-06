# What 60% of Skiers Actually Want

**Date**: 2026-02-04 (updated throughout session)
**Source**: OpenSnow Vail page analysis + Skier Persona research + Chris's firsthand skier perspective
**Purpose**: Reduce the data surface to what matters for the mainstream skier

---

## The Fundamental Reframe

**Every ski data product gets this wrong: they start with a resort.**

OpenSnow, Epic Mix, Ikon, OnTheSnow — they're all resort-centric. Pick Vail, see Vail's data. But that's not how skiers think. The real mental model is:

> "I have a window to ski. Where's the best snow I can reach?"

The unit of interest isn't the **resort** — it's the **region**. "I live in Avon" or "I'm staying in Silverthorne" or "I'm driving from Denver." The resorts are options within a radius. The product should start with the region, show all the resorts in it, and help you pick the best one.

**Our premise: You define a region. We show you conditions across every resort in it. We help you make the best decision.**

This is the product nobody has built yet.

---

## The 60% — Who Are They?

The "60% skier" is NOT the powder hunter checking OpenSnow 5x/day. That's the 10%.

The 60% is a blend of:
- **The Family Planner** (~25%) — "Will the kids be okay? Is it worth the drive?"
- **The Casual Intermediate** (~20%) — "Is it a good day to go? What should I wear?"
- **The Weekend Warrior** (~15%) — "Where's the best bang for my buck this Saturday?"

These people share one trait: **they want a decision, not data. And the decision is WHERE + WHEN, not just "how's Vail?"**

---

## What OpenSnow Shows (9 tabs of data)

| Tab | What's There | Data Volume |
|-----|-------------|-------------|
| **Weather** | Current temp, feels-like, wind, 10-day forecast cards, hourly temp chart, sunrise/sunset, moon phase, weather station map | Heavy |
| **Snow Summary** | 15-day snow chart (past + future), local expert write-up, AI overview, current conditions, hourly forecast TABLE (precip, temp, humidity, wind, cloud, snow ratio, snow level), daily forecast TABLE | Very Heavy |
| **Snow Report** | Live snow stake cam, 12hr snowfall chart, recent snow (24hr/5day/base), season snowfall, snowpack vs average, resort report (% open, trails, lifts, conditions) | Heavy |
| **Cams** | 9+ webcam images (snow stakes, bowls, village) | Medium |
| **Weather Stations** | 12+ nearby weather stations with individual readings | Very Heavy |
| **Daily Snows** | Expert blog posts (local, regional, national, powder chaser) | Medium |
| **Avalanche Forecast** | CAIC rating, zone map, backcountry warnings | Medium |
| **Trail Maps** | 6 map images (front, back bowls, blue sky, hiking, biking, village) | Light |
| **Info** | Maps, directions, helpful links, social media | Light |

**Total: ~50+ distinct data points across 9 views.**

---

## What the 60% Actually Looks At

### Tier 1: "TELL ME THIS OR I LEAVE" (The Essentials)

The #1 question isn't "what's it like right now?" — it's **"when is it going to snow?"**

Skiers plan around **snow windows**, not temperature. The 10-15 day snow forecast is the single most important piece of data on the entire page. Everything else is secondary to: **is snow coming, when, and how much?**

| Data Point | Why It Matters | Source Tab |
|------------|---------------|------------|
| **10-15 day snow forecast** | "When is the next storm?" — THE planning decision | Snow Summary |
| **Recent snowfall (24-48hr)** | "Did it just snow? Should I go NOW?" | Snow Summary / Snow Report |
| **Is it open? How much?** | "Open (60%)" — instant status check | Snow Report |
| **Expert take (1 paragraph)** | "Storm arrives Thursday" — human interpretation of the forecast, trusted more than raw data | Daily Snows / Snow Summary |
| **Base depth** | "Is there enough coverage to bother?" — especially early/late season | Snow Report |

**These 5 data points answer 80% of what the 60% needs.**

Note: Temperature, wind, and conditions are **day-of logistics** — checked the morning you're going. The snow forecast is checked days or weeks out to decide WHEN to go. The forecast drives the decision; the weather drives the wardrobe.

### Tier 2: "I'M GOING — NOW PLAN MY DAY" (Day-Of Logistics)

Checked the morning of, once the decision to go has already been made based on the snow forecast.

| Data Point | Why It Matters | Source Tab |
|------------|---------------|------------|
| **Current temp + feels like** | "What do I wear?" — day-of wardrobe decision | Weather |
| **Wind speed** | "Will lifts be on hold?" — the hidden day-ruiner | Weather |
| **Trails open / Lifts open** | "166 of 277 trails, 20 of 33 lifts" — scope of what's available | Snow Report |
| **Surface conditions** | "Snow Groomed" / "Powder" / "Icy" — the vibe check | Snow Report |
| **Webcam (1-2 images)** | "What does it actually look like?" — trust verification | Cams |

### Tier 3: "I'M A DATA NERD" (The 10-20% Power Users)

| Data Point | Who Uses It |
|------------|-------------|
| Hourly precip/humidity/snow ratio table | Powder hunters, forecasters |
| Weather station network (12+ stations) | Data obsessives, backcountry |
| Snowpack % of average (SNOTEL) | Season trackers, journalists |
| Snow level (ft) forecasts | Backcountry, elevation-sensitive planning |
| Avalanche forecast + CAIC zone map | Backcountry skiers ONLY |
| Moon phase | Almost nobody |

### Tier 4: "NICE TO HAVE" (Reference Material)

| Data Point | Usage |
|------------|-------|
| Trail maps | Checked once per season or by first-timers |
| Driving directions | First-timers only |
| Social media links | Rarely clicked from a data app |
| Season snowfall total | Bragging rights, season context |
| Historical snowpack trends | Journalists, climate watchers |

---

## The "One Screen" Challenge

**If we could only show ONE SCREEN, what goes on it?**

It's not a resort page. It's a **regional decision screen** with two modes:
1. **PLANNING MODE** (default): "When is it going to snow, and where should I be?"
2. **DAY-OF MODE** (morning check): "I'm going today — which resort, and what do I need to know?"

See the regional dashboard mockup in the "Region-First Architecture" section above.

**That single screen answers:**
- When's the next storm? ✅ (Storm arriving Tue Feb 10)
- Where should I be for it? ✅ (Copper gets 6-8", most in the region)
- What about my pass? ✅ (Best Epic option: Vail at 4-6")
- Should I go this week or wait? ✅ (Dry now — wait for Tuesday)
- If I go today anyway? ✅ (Best grooming: Beaver Creek; Best value: Keystone)
- What does the expert think? ✅ (Joel says NW flow favors Copper/Vail)
- Best for my family? ✅ (Beaver Creek — groomed, easy parking, ski school)

---

## What OpenSnow Gets Right

1. **15-day snow forecast chart** — The most valuable single widget. Shows past snow + future snow in one visual. This is what skiers actually plan around.
2. **Local Expert content** — Joel Gratz's write-ups are the killer feature. Human interpretation > raw data. "Storm arrives Thursday" is worth more than 50 data points.
3. **AI Overview** — Smart addition. Summarizes conditions in plain language.
4. **Resort Report bar** — % open, trails, lifts, conditions in a single row.
5. **"Reported" snowfall badge** — Trust signal. Knowing the 24hr total is resort-reported (not estimated) matters.

## Where OpenSnow Over-Indexes

1. **Hourly forecast TABLE** — 24+ columns of precip chance, snow ratio, snow level, humidity. This is for meteorologists, not skiers.
2. **Weather Stations tab** — 12 individual stations. Nobody except data scientists clicks this.
3. **Moon phase** — Almost zero decision impact for resort skiing.
4. **9 tabs** — Too many. The 60% won't click past 2.
5. **Temperature-centric weather tab** — Leads with temp when skiers care about precip first.

## Where OpenSnow Has Gaps (Our Opportunity)

1. **No nearby resort comparison** — THE biggest miss. If I'm looking at Vail, I want to know what Beaver Creek, Copper, Breck, Keystone, and A-Basin are getting from the same storm. Skiers aren't loyal to one resort — they're loyal to the best snow within driving distance. OpenSnow forces you to manually check 5-6 resort pages and mentally compare. That's our #1 opportunity.
2. **No "Should I go?" answer** — All data, no verdict. The 60% wants YES/NO/MAYBE.
3. **No "where should I go?" answer** — Even more important than the above. "Copper got 8 inches, Vail got 3 — go to Copper today."
4. **No parking/crowd prediction** — The #1 logistics anxiety for families.
5. **No "what to wear" guidance** — 20°F means nothing to a casual skier.
6. **No price context** — How much will this cost me today?
7. **No lift wait estimates** — "20 of 33 lifts open" doesn't tell you about lines.
8. **No beginner translation** — "Snow Groomed" means what exactly?

---

## Recommendation: Our Data Hierarchy

### For the `snow-report` skill (the default "what's it like?" query):

**Always show (Tier 1 — Snow-first):**
1. Snow forecast: next 5 / 6-10 / 11-15 day totals
2. Recent snowfall: 24hr + 5-day
3. Base depth + open status
4. Expert summary (1 paragraph — the human signal)
5. Next powder day prediction (our differentiator)

**Show on request (Tier 2 — Day-of logistics):**
6. Current temp + feels like + wind
7. Surface conditions
8. Trails open / lifts open counts
9. Webcam link
10. Avalanche rating (if moderate+)

**Deep dive only (Tier 3):**
11. Hourly breakdown
12. Snow history / season total
13. Snowpack vs average
14. Weather station details

### For the `hunter` agent (powder-focused):
- Flip the hierarchy: 24hr snow is Tier 0
- Add: wind holds, bowl openings, backcountry gates
- Add: snow ratio, snow level, storm tracking

### For the `sherpa` agent (family-focused):
- Flip the hierarchy: parking + logistics is Tier 0
- Add: grooming report, beginner terrain status
- Add: crowd prediction, dining hours
- Translate jargon: "Snow Groomed" → "Smooth, easy-to-ski packed snow"

---

---

## Region-First Architecture

### The product nobody has built

Every ski app today:
```
User → picks a resort → sees that resort's data
```

What we're building:
```
User → defines their region → sees all resorts ranked → gets a recommendation
```

The region can be defined multiple ways:
- **By location**: "I'm in Avon" → shows everything within X minutes
- **By pass**: "I have an Ikon Pass" → filters to Ikon resorts in range
- **By cluster name**: "I-70 corridor" or "Summit County" or "Vail Valley"
- **By radius**: "Within 90 minutes of Denver"
- **Custom**: User saves their own set of resorts they care about

### What the default view looks like

Instead of a resort page, the primary interface is a **regional dashboard**:

```
┌─────────────────────────────────────────────────────────┐
│  MY REGION: I-70 Corridor  ·  Based from: Avon, CO     │
│  6 resorts within 60 min                                │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  SNOW INCOMING (Next 5 Days)                             │
│  ❄️ Storm arriving Tue Feb 10                            │
│                                                           │
│  🥇 Copper Mountain    6-8"   35 min   Ikon ✓           │
│  🥈 Vail               4-6"   10 min   Epic ✓           │
│  🥉 Beaver Creek       4-5"   15 min   Epic ✓           │
│     Breckenridge        2-4"   45 min   Epic ✓           │
│     Keystone            2-3"   50 min   Epic ✓           │
│     A-Basin             1-2"   55 min   Ikon ✓           │
│                                                           │
│  → Best powder day: Copper on Tuesday                    │
│  → Best on your pass (Epic): Vail on Tuesday            │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  LAST 24 HOURS                                           │
│  Dry across the region. Groomed conditions everywhere.   │
│                                                           │
├─────────────────────────────────────────────────────────┤
│  EXPERT TAKE                                             │
│  "Sunny and warm through Monday, then the pattern       │
│   shifts. Copper and Vail favored for the Tuesday       │
│   storm — NW flow. Breck gets less from this one."      │
│                                            — Joel Gratz  │
├─────────────────────────────────────────────────────────┤
│  TODAY (if you're going)                                 │
│                                                           │
│  Best grooming: Beaver Creek (freshly groomed, 25°F)    │
│  Best value: Keystone ($109 vs $249 at Vail)            │
│  Shortest lines: A-Basin (midweek, low volume)          │
│  Best for families: Beaver Creek (Ski School, village)   │
│                                                           │
│  All resorts: Open, no wind holds, sunny                │
└─────────────────────────────────────────────────────────┘
```

### The key decisions it answers

| Question | How We Answer It |
|----------|-----------------|
| "When should I ski?" | Snow forecast ranked across your region |
| "Where should I ski?" | Resort comparison by snow, drive time, pass, value |
| "Where should I ski TODAY?" | Best conditions right now across your region |
| "What if I have an Epic/Ikon pass?" | Filter to your pass resorts |
| "Best for my family?" | Factor in beginner terrain, ski school, parking |
| "Best bang for my buck?" | Price + conditions + drive time optimization |

### Why this is hard to replicate

This requires:
- Snow forecast data for every resort in a region (not just one)
- Drive time calculations from a user's base location
- Pass affiliation data (Epic, Ikon, Indy, independent)
- Resort characteristics (family-friendly, terrain parks, expert terrain)
- Price data (dynamic ticket pricing)
- Storm pattern knowledge (which direction favors which resorts)

Most of this lives in our data model already. The storm pattern intelligence is the hardest part — and the most valuable.

### Colorado resort clusters (natural regions)

| Cluster | Resorts | Drive from Denver | Storm Notes |
|---------|---------|-------------------|-------------|
| **Vail Valley** | Vail, Beaver Creek | 1.5-2 hr | NW flow favored |
| **Summit County** | Breck, Keystone, A-Basin, Copper, Loveland | 1.5 hr | Continental divide effects |
| **I-70 Corridor** | All of the above | 1.5-2 hr | Combined super-region |
| **Central Mountains** | Aspen (4 mtns), Crested Butte | 3-4 hr | SW flow favored |
| **Steamboat** | Steamboat, Howelsen | 3 hr | NW flow, champagne powder |
| **Front Range** | Eldora, Winter Park, Mary Jane | 1-1.5 hr | Upslope storms, closest to Denver |
| **Southwest** | Telluride, Purgatory, Wolf Creek | 5-7 hr | Southern storms, different world |

Users should be able to define custom regions, but these are smart defaults.

### How this reshapes every skill and agent

| Construct | Old Premise (Resort-Centric) | New Premise (Region-First) |
|-----------|------------------------------|---------------------------|
| `snow-report` | "How's Vail?" | "What's the snow outlook across my region?" |
| `powder-finder` | "Which resort has the most powder?" | "Where in my region got the most snow?" |
| `compare-resorts` | "Compare Vail vs Breck" | Default view IS a comparison — always on |
| `resort-search` | "Find me a resort with X" | "Which resorts in my region have X?" |
| `trip-planner` | "Plan a trip to Vail" | "Plan a trip to the I-70 corridor — pick the best resort each day" |
| `price-tracker` | "What's Vail's ticket price?" | "Cheapest resort in my region this Saturday?" |
| `hunter` agent | "Powder alert for Vail" | "Storm coming — Copper gets the most, but Vail's closest to you" |
| `sherpa` agent | "Family day at Vail" | "Best family resort in your region today: Beaver Creek (groomed, easy parking, ski school open)" |
| `scout` agent | "Cheapest ticket at Vail" | "Keystone is $140 less than Vail today with similar conditions" |

---

## Key Insight

**Skiers plan around SNOW WINDOWS, not temperature.**

The fundamental question is "when is it going to snow?" — everything else is secondary. OpenSnow gets this partially right with their 15-day chart, but buries it under 9 tabs of meteorological detail.

Our competitive advantage:
1. **Regional comparison by default** — "Where should I go?" not just "how's Vail?" — this is the killer feature no one does well
2. **Snow-first hierarchy** — Lead with the forecast, not the thermometer
3. **Interpretation** — "Next powder day: Tuesday Feb 10 → go to Copper" not "9 inches next 6-10 days"
4. **Expert signal** — Surface the human take prominently (Joel > data tables)
5. **Two-mode design** — Planning mode (when/where to go) vs Day-of mode (what to expect)
6. **Personalization** — Powder hunter sees storm tracking + best resort pick; Family sees "best groomer day + easiest parking"

The skills and agents should be **region-first, snow-forecast-driven decision engines.**

The mental shift: we're not building a better resort page. We're building **a regional ski decision assistant** that happens to have resort-level data underneath.

---

## "Your Resorts" + Smart Discovery

### The two-layer model

Skiers have a short list of resorts they regularly ski — usually 3-5. These are their defaults: they have passes, they know the terrain, they know where to park. The product should always show these.

But limiting the view to saved resorts is a trap. The whole point of a regional tool is to surface **opportunities you'd miss** by only checking your usual spots.

**Layer 1: Your Resorts (always shown)**
- The 3-5 resorts the user saves
- Full detail: snow, forecast, conditions, open status
- These are the "home team" — they always appear

**Layer 2: Worth Knowing (contextually shown)**
- Nearby resorts that are **meaningfully outperforming** your saved resorts
- Only appear when they have notably better conditions
- Include pass compatibility and price context since you might not have a pass there

The key word is **meaningfully**. If Copper got 1 more inch than Breck, don't bother. If Copper got 8 inches and Breck got 2, that's worth knowing — even if Copper isn't on your pass and adds 15 minutes of driving.

### What triggers a "Worth Knowing" alert

| Trigger | Example |
|---------|---------|
| Snowfall differential > 4" in 24hr | "Copper got 10", your best Epic resort got 4"" |
| Storm pattern strongly favors a non-saved resort | "SW flow is dumping on Monarch — 18" and counting" |
| A non-pass resort has an exceptional deal | "Loveland: $59 today, got 6" overnight" |
| A nearby resort is having a rare great day | "A-Basin opened the East Wall — first time this season" |
| Your saved resorts are all mediocre but something nearby is great | "Your resorts: 0-2". But Wolf Creek: 14"" |

### What does NOT trigger it

- Minor differences (1-2" more at a non-saved resort)
- Resorts outside the user's max drive radius
- Resorts that are always better but always too far (Wolf Creek for a Denver skier on a day trip)
- A resort being slightly cheaper when conditions are the same

### How it looks in practice

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YOUR RESORTS · Epic Pass
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        24hr  Base  Open  Drive
 1. Breckenridge         3"    24"   64%  1h30m
 2. Keystone             2"    26"   70%  1h30m
 3. Vail                 1"    37"   60%  1h40m

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 💡 WORTH KNOWING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Loveland              6"    42"   85%  1h15m
 Not on your pass · Walk-up $89 today
 ✦ Got surprise 6" — most snow on the I-70
   corridor today. 15 min closer than Breck.
   Steep, no-frills, but the snow is real.

 Copper Mountain       2"    30"   75%  1h25m
 Not on your pass (Ikon) · Walk-up $139
 ✦ Same snow as Keystone but more terrain
   open (75% vs 70%). Worth noting if you
   ever grab a buddy pass.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### The "Worth Knowing" section is contextual

- On a day when your saved resorts are the best options → **section doesn't appear at all** (no noise)
- On a day when a nearby non-pass resort got hammered → **section appears with clear context** (pass status, price, drive time delta)
- On a historic day → **section becomes prominent**: "🚨 Wolf Creek got 28" in 24 hours. Yes, it's 4 hours away. Yes, it's worth the drive."

### Why this matters

Most people stick to their resorts out of habit, not because they're always the best option. The skier who drives past Loveland every weekend to get to Breck doesn't know Loveland got 6 inches today because they never check Loveland.

We're not telling them to abandon their pass. We're saying: **the one day Loveland gets 6 inches while your resorts get 1, it might be worth $89 and 15 minutes less driving.**

That's the kind of insight that earns long-term trust. The product isn't just tracking your resorts — it's looking out for you across the whole region.

---

## The Road Trip Threshold

### When "nearby" isn't enough

Sometimes the best snow isn't in your region — it's 3+ hours away. The product needs to know when conditions elsewhere are SO much better that it justifies a road trip, even when your home resorts are having a good day.

**Real example**: Chris lives in Avon. Epic pass. Vail gets 10", Beaver Creek gets 8", Crested Butte gets 20".

10" at Vail is an excellent day. Most people would stop there. But 20" at Crested Butte — which is also on Epic — is a once-or-twice-a-season event. The product needs to surface that and help plan the trip.

### The threshold formula (conceptual)

It's not just "more snow = go." The decision factors are:

```
Is the trip worth it?

  Snow differential:     CB has 2x what Vail got (20" vs 10")
  Pass compatible:       Yes — both on Epic
  Drive time:            3.5 hrs (vs 10 min to Vail)
  Road conditions:       Winter mountain passes required
  Day of week:           Can I take time off? Powder day on a weekday?
  Crowd factor:          CB is smaller, 20" will draw people
  Powder longevity:      20" lasts longer than 10" before tracking out
  Terrain unlocked:      20" at CB opens extreme terrain that 10" doesn't
```

A 2" difference? Never worth a 3.5-hour drive. A 10" difference? Almost always worth it — especially when the deeper resort has terrain that only comes alive with that much snow.

### The response for this scenario

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 YOUR RESORTS · From Avon, CO
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

                        24hr  Base  Open  Drive
 Vail                   10"   47"   85%   10 min
 Beaver Creek            8"   41"   80%   15 min

 Both are having a great day. Back Bowls are
 loaded. This is a go-right-now situation locally.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🚨 ROAD TRIP ALERT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Crested Butte          20"   65"   95%
 On your pass (Epic) · 3h 30m drive

 This is a 2x day. CB got double what Vail got.
 20 inches at Crested Butte is a different
 animal — the Extremes, Headwall, North Face,
 and the glades all come alive at this depth.

 10" at Vail is great skiing.
 20" at CB is a story you tell for years.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 🗺️  GET THERE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 OPTION A: Drive tonight, ski first chair
 ─────────────────────────────────────────
 Depart Avon:      7:00 PM tonight
 Route:            I-70 W → Glenwood → CO-82
                   → CO-135 → Mt Crested Butte
 Drive time:       ~3h 20m (dry roads tonight)
 Arrive:           ~10:30 PM
 Stay:             Book tonight in CB village
 First chair:      9:00 AM
 ✦ You'll be on fresh 20" at opening. This
   is the play if you want untracked lines.

 OPTION B: Early morning mission
 ─────────────────────────────────────────
 Depart Avon:      4:30 AM
 Arrive:           ~8:00 AM
 First chair:      9:00 AM
 ✦ Brutal wake-up but saves the hotel cost.
   Still on the mountain at opening. Roads
   should be plowed by then.

 OPTION C: Ski Vail today, CB tomorrow
 ─────────────────────────────────────────
 Today:            Ski Vail (10" is still great)
 Depart Avon:      7:00 PM tonight
 Tomorrow:         First chair at CB
 ✦ Best of both worlds. 20" will still be
   skiing great on day 2 — that much snow
   doesn't track out in one day. The steeps
   and trees will hold untracked lines.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 ⚠️  ROAD CONDITIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Independence Pass:  CLOSED (seasonal)
 Monarch Pass:       Open, chain law likely
 CO-82 (Aspen):      Open, plowed
 CO-135 (Gunnison):  Open

 Route goes through Glenwood Springs and over
 McClure Pass or down to Gunnison via US-50.
 Expect winter driving conditions. AWD/4WD
 recommended.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 💡 BOTTOM LINE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 Vail at 10" is a great day. Go ski it.
 CB at 20" is a bucket-list day. Go chase it.

 If you can swing it: ski Vail today, drive
 to CB tonight, ski CB tomorrow. The 20" will
 still be there.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

### The alert must be FORECAST-BASED, not reactive

The road trip alert is useless if it says "CB got 20" last night." You're in Avon — that's 3.5 hours away. You missed it.

The entire value is in the **forecast comparison across your full pass network**. The product needs to:

1. Monitor snow forecasts for EVERY resort on your pass — not just your saved local resorts
2. Detect when a distant pass resort is forecast to get significantly more than your home resorts
3. Alert you **days in advance** so you can plan, not scramble

### The alert timeline

A storm is forecast to arrive Tuesday. Here's how the product should communicate across the days leading up to it:

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 SATURDAY (5 days out)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 📡 HEADS UP — Storm brewing for Tuesday

 Early models showing a big southern-track storm.
 This pattern favors southern CO mountains.

 Your local (Vail/BC):     6-10" likely
 Crested Butte (Epic):    16-22" possible

 CB could see 2x what the Vail Valley gets.
 Keep an eye on this — details still uncertain.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 MONDAY (1 day out)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 🎯 STORM TRACK LOCKED IN

 Models have converged. This is a southern storm.
 Crested Butte is in the bullseye.

 FORECAST (Tue-Wed):
 Crested Butte (Epic):    18-24"    3h 30m
 Vail:                     8-12"    10 min
 Beaver Creek:             7-10"    15 min

 CB is going to get 2x what you'll see locally.
 18-24" at CB opens the Extremes, Headwall, and
 North Face — terrain that needs this kind of
 depth.

 🗓️ DECISION TIME: If you want to be at CB for
 this storm, make plans now.

 Option A: Drive to CB tomorrow (Tue) evening
           after the storm tapers. Ski Wed AM.
           Book lodging tonight.

 Option B: Ski Vail's 8-12" on Wednesday (still
           a great day). Drive to CB Wed night.
           Ski CB Thursday — 24" holds in the
           trees for day 2.

 Option C: Stay local. 8-12" at Vail is still
           a legit powder day. No shame in it.

 💡 CB lodging tip: Elevation Hotel has rooms
    from ~$180. Book now — they'll sell out
    once the forecast firms up.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 TUESDAY EVENING (storm winding down)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 ❄️ STORM DELIVERED

 Crested Butte:    22" in 36 hours
 Vail:             10"
 Beaver Creek:      8"

 CB got more than double your local resorts.

 If you're heading to CB:
 Route:  I-70 W → Glenwood → CO-82 → CO-135
 Roads:  Monarch Pass has chain law. CO-135
         is plowed. Expect winter conditions.
 Depart: By 7 PM to arrive by 10:30 PM.
 Tomorrow: First chair 9:00 AM. Get in line
           by 8:30 — everyone saw this forecast.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
 WEDNESDAY MORNING (powder day)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

 🎿 IT'S ON

 CB: 22" fresh. Extremes OPEN. North Face OPEN.
 Clear skies, 15°F, light wind. Perfect.

 Lift strategy:
 - Red Lady Express first → Headwall Traverse
 - Or: Paradise Lift → North Face (less tracked)
 - Avoid: Painter Boy (everyone goes there first)

 Your local resorts today:
 Vail: 10" — Back Bowls are great. If you
       stayed local, you're still having a
       good day.
```

### This changes what we're monitoring

The product isn't just tracking conditions at "your resorts" (Vail, BC). It's tracking forecasts across your **entire pass network**:

**Epic Pass resorts within road trip range of Avon:**
| Resort | Drive Time | Always Monitor? |
|--------|-----------|-----------------|
| Vail | 10 min | ✅ Home resort |
| Beaver Creek | 15 min | ✅ Home resort |
| Breckenridge | 1h 15m | ✅ Day trip |
| Keystone | 1h 20m | ✅ Day trip |
| Crested Butte | 3h 30m | ✅ Road trip — alert when 1.5x+ local |
| Park City | 5h | ⚠️ Long trip — alert when 2x+ local |
| Telluride (Ikon, not Epic) | 4h 30m | ❌ Not on pass |

The threshold scales with distance:
- **Under 1 hour**: Show always (it's your backyard)
- **1-2 hours**: Show when conditions are better or equal to local
- **2-4 hours**: Only alert when forecast is **1.5x or more** than your best local resort
- **4+ hours**: Only alert when forecast is **2x+ or more** — this has to be extraordinary

### What makes this work

1. **Forecast comparison across the full pass network** — not just your saved resorts
2. **Lead time** — 3-5 days of escalating alerts, not a "you missed it" notification
3. **Decision support at each stage** — Saturday: "heads up." Monday: "here are your options." Tuesday: "here's the route."
4. **Lodging/logistics baked in** — "Book the Elevation Hotel tonight" is part of the alert, not a separate step
5. **Respects that local is still good** — Never makes you feel bad for skiing 10" at Vail. Always frames it as "great day locally, but extraordinary day at CB if you want to chase it."
6. **Powder longevity awareness** — "24" holds in the trees for day 2" means you don't have to panic-drive tonight. You can ski Vail tomorrow and CB the next day.

### The key data requirements

| Data | Source | Update Frequency |
|------|--------|-----------------|
| 10-day snow forecast for ALL pass resorts | Weather API (Open-Meteo) | Every 6-12 hours |
| Storm track / pattern type | Weather models (GFS, ECMWF) | Every 12 hours |
| Resort aspect & elevation | Static database | Once |
| Pass affiliation per resort | Static database (updated yearly) | Once/season |
| Drive time from user's home | Maps API / static lookup | Once |
| Lodging availability | Partnership API or scrape | On alert trigger |
| Road conditions | CDOT API | Real-time on day of |
| Terrain opening thresholds | Per-resort knowledge base | Static |
