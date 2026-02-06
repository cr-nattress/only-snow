# OpenSnow Favorites vs. Our Approach

**Date**: 2026-02-05
**Source**: OpenSnow favorites page (Chris's account) + product analysis

---

## What OpenSnow Does Well

The Favorites page shows your followed resorts stacked vertically, each with the same 15-day snow chart (prev 11-15 / prev 6-10 / prev 1-5 / last 24hr / next 1-5 / next 6-10 / next 11-15).

Chris's followed resorts:
- Purgatory — 0" last 24hr, 13" next 6-10, 14" next 11-15
- Brian Head — 0" last 24hr, 10" next 6-10, 11" next 11-15
- Beaver Creek — 0" last 24hr, 9" next 6-10, 8" next 11-15
- Crested Butte — 0" last 24hr, 15" next 6-10, 13" next 11-15
- Vail — 1" last 24hr, 9" next 6-10, 10" next 11-15
- Silverton — 0" last 24hr, 21" next 6-10, 14" next 11-15

**What works:**
1. Consistent format — every resort shows the same chart, easy to scan
2. 15-day window — past and future side by side
3. Visual bars — you can spot which days have snow at a glance
4. "Reported" badge — trust signal on 24hr totals
5. Multiple views — Snow Summary, Snow Forecast, Snow Report, Cams, All Cams

**This is a solid data presentation tool.** It shows you the numbers. You can visually compare.

---

## What OpenSnow Leaves to You

Looking at Chris's actual favorites right now, a skier would need to:

1. **Scan all 6 charts** and mentally register the forecast totals
2. **Notice** that Silverton (21") and Crested Butte (15") are getting significantly more than Vail/BC (9") in the next 6-10 days
3. **Remember** that Silverton isn't on Epic but CB is
4. **Calculate** that Purgatory (13") is closer to Brian Head conditions than CB
5. **Know** which storm direction produces these differentials
6. **Figure out** the timing — when exactly in the "next 6-10 days" window does the snow arrive?
7. **Decide** whether 21" at Silverton or 15" at CB is worth the drive from Avon vs. 9" at Vail
8. **Plan** logistics (drive time, lodging, road conditions) if they decide to chase it

**That's 8 cognitive steps the user has to do themselves.** OpenSnow gives you the data. You do the work.

---

## The Gap: Data → Decision

```
OPENSNOW:
  Data → [shown to user] → User interprets → User decides → User plans

US:
  Data → [analyzed by system] → Recommendation shown → User decides → Plan provided
```

We're not replacing the data view. Some users (Chris included) want to see the charts. But we're adding the layer on top that says:

**"Here's what this data means for YOU, right now, given where you live and what pass you have."**

---

## Our Approach: Three Features OpenSnow Doesn't Have

### 1. AUTO-POPULATE FROM PASS + LOCATION

**OpenSnow**: You manually pick resorts to follow. If you don't add a resort, you never see it.

**Us**: Tell us your pass and where you live. We auto-populate every resort that's relevant:
- All resorts on your pass within your max drive radius
- Resorts ranked by drive time (closest first)
- Resorts grouped by region/cluster

The user can still add/remove resorts. But the starting point is intelligent, not blank.

**Why this matters**: A Denver Epic pass holder might not think to follow Crested Butte because it's 4 hours away. But when CB is forecast for 2x what the I-70 corridor is getting, they'd want to know. The system follows it for them because it's on their pass.

### 2. RANKED + INTERPRETED (not just side-by-side)

**OpenSnow**: Shows all favorites in a fixed order (alphabetical or custom sort). Every resort gets the same visual weight. Purgatory at 13" looks the same as Silverton at 21".

**Us**: Rank resorts by the forecast, dynamically. The one getting the most snow is at the top. And add the interpretation layer.

Looking at Chris's actual data right now:

```
OpenSnow shows (stacked, equal weight):

  Purgatory     0" now   13" next 6-10   14" next 11-15
  Brian Head    0" now   10" next 6-10   11" next 11-15
  Beaver Creek  0" now    9" next 6-10    8" next 11-15
  Crested Butte 0" now   15" next 6-10   13" next 11-15
  Vail          1" now    9" next 6-10   10" next 11-15
  Silverton     0" now   21" next 6-10   14" next 11-15
```

```
We would show (ranked, interpreted):

  STORM INCOMING · Next 6-10 Days
  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  YOUR RESORTS — RANKED BY INCOMING SNOW

  🥇 Silverton      21"   3h 45m   ❌ Not on Epic
     Heli + cat skiing. Experts only.
     Walk-up: $59. Biggest totals in CO.

  🥈 Crested Butte  15"   3h 30m   ✅ Epic
     Your best Epic option by far.
     Extremes and North Face open with this
     depth. 6" MORE than your local resorts.

  🥉 Purgatory      13"   5h 15m   ✅ Epic
     Too far for a day trip from Avon.
     Only worth it if already in SW Colorado.

     Brian Head      10"   7h 30m   ❌ Not on Epic
     Too far. Skip.

  ── YOUR LOCAL ──────────────────────────

     Vail             9"   10 min   ✅ Epic
     Beaver Creek     9"   15 min   ✅ Epic
     Solid locally. Back Bowls will be good.
     But CB is getting 67% more snow.

  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

  💡 RECOMMENDATION

  BEST OVERALL: Silverton (21") — but it's
  not on your pass and it's expert-only heli.

  BEST ON YOUR PASS: Crested Butte (15")
  — worth the 3.5hr drive. 15" at CB is a
  different experience than 9" at Vail.
  The Extremes open. Start planning now.

  BEST IF STAYING LOCAL: Vail (9")
  — Still a great day. Back Bowls with 9"
  of fresh is nothing to complain about.
```

**The difference**: OpenSnow shows 6 identical charts. We show a ranked leaderboard with context, pass status, drive time, terrain implications, and a recommendation.

### 3. PROACTIVE DISCOVERY (resorts you're NOT following)

**OpenSnow**: Only shows resorts you've manually added to favorites. If you're not following Copper Mountain, you'll never know Copper got 14" while your resorts got 6".

**Us**: The system monitors ALL resorts on your pass (and optionally nearby non-pass resorts). When one that's not in your saved list is having a significantly better day/forecast, it surfaces in the "Worth Knowing" section.

**Example**: Chris follows Vail, BC, CB, Silverton, Purgatory, Brian Head. He does NOT follow:
- Copper Mountain (Ikon, not Epic — but sometimes worth a walk-up)
- Breckenridge (Epic — maybe he just doesn't think about it)
- Keystone (Epic — same)
- Monarch (independent — but it's on the way to CB)
- Telluride (Epic — 4.5 hrs but on his pass)

If Telluride is forecast for 18" and it's on his Epic pass, the product should say:

```
 💡 WORTH KNOWING

 Telluride          18"   4h 30m   ✅ Epic
 Not in your resorts, but on your pass.
 Getting more snow than Vail (9") and
 almost as much as CB (15"). If you're
 considering the CB road trip, Telluride
 is an alternative with similar snow and
 a better town for overnight stays.
```

The user never asked about Telluride. But the system knows it's on their pass, within road-trip range, and having an exceptional forecast. That's the kind of proactive intelligence that OpenSnow can't provide with a manual favorites list.

---

## The Blind Spot Problem (Real Example)

Chris follows: Beaver Creek, Vail, Crested Butte, Telluride.

Chris does NOT follow: Monarch, Copper Mountain, Loveland, Breckenridge, Keystone, A-Basin, Steamboat, Winter Park, Aspen (x4), Ski Cooper, Sunlight, Eldora, Wolf Creek, Monarch...

That's **~20 resorts he'll never see** in OpenSnow. Any of them could be having a better day than his followed resorts at any given time.

**Specific scenario**: A storm drops in with a SW flow.

| Resort | Forecast | Followed? | On Epic? | Drive from Avon |
|--------|----------|-----------|----------|-----------------|
| Monarch | 18" | ❌ No | ❌ No ($59 walk-up) | 2h 45m |
| Crested Butte | 15" | ✅ Yes | ✅ Yes | 3h 30m |
| Copper Mountain | 12" | ❌ No | ❌ Ikon | 45 min |
| Vail | 8" | ✅ Yes | ✅ Yes | 10 min |
| Beaver Creek | 7" | ✅ Yes | ✅ Yes | 15 min |
| Loveland | 14" | ❌ No | ❌ Independent ($89) | 1h 15m |

**What Chris sees in OpenSnow**: Vail 8", BC 7", CB 15". He plans for CB.

**What Chris misses**:
- **Monarch at 18"** — MORE snow than CB, and it's on the way to CB. $59 walk-up. He could ski Monarch on the drive to CB, or ski Monarch instead and save 45 min of driving.
- **Loveland at 14"** — Almost as much as CB, 1h 15m from Avon instead of 3h 30m, $89 walk-up. If he just wants powder and doesn't need to go all the way to CB, Loveland is the efficient play.
- **Copper at 12"** — More than Vail, 45 min from Avon. Not on Epic but $139 walk-up. Maybe worth it when Vail's at 8" and you don't feel like driving 3.5 hours.

**This is real information he'd act on.** He's not going to follow 25 resorts on OpenSnow. He shouldn't have to.

### How we solve it

The system monitors ALL Colorado resorts (not just followed ones). On every forecast update, it runs a simple comparison:

```
For each non-followed resort in the user's state/region:
  - Is it forecast for MORE snow than the user's best followed resort?
  - Is it within the user's max drive radius?
  - Is the differential meaningful (>4" or >50% more)?
  
  If yes → surface in "Worth Knowing" with:
    - Snow forecast
    - Pass status + walk-up price
    - Drive time from user's home
    - Why it matters (e.g., "on the way to CB", "half the drive of CB")
```

**This is computationally trivial.** It's a sort + filter on ~25-30 resorts. The hard part is having the forecast data for all of them — but that's what the weather API gives us.

### The "On Your Way" Intelligence

A special case worth highlighting: **resorts that are on the route to your planned destination.**

If Chris is planning to drive to CB, the system should know that Monarch is literally on Highway 50, which is the route to CB. If Monarch is getting more snow than CB:

```
 🛣️ ON YOUR WAY

 You're heading to CB (15") via US-50.
 Monarch Mountain is on your route and
 getting 18" — more than CB.

 Option: Stop at Monarch ($59), ski the
 morning, continue to CB for day 2.

 Or: Skip CB entirely. Monarch has more
 snow, costs $59, and saves you 45 min
 of driving past it.
```

Nobody provides this. It requires knowing:
1. The user's planned destination
2. The driving route to get there
3. Which resorts are on or near that route
4. The forecast comparison between the route resorts and the destination

All of this data exists. Nobody has connected it.

---

## Summary: OpenSnow vs. Us

| Feature | OpenSnow | Us |
|---------|----------|-----|
| Resort selection | Manual (you pick) | Auto-populated from pass + location, plus manual adds |
| Display | Stacked charts, equal weight | Ranked by forecast, dynamically reordered |
| Interpretation | None — raw data | "CB is getting 67% more than your local resorts" |
| Recommendation | None — you decide | "Best on your pass: CB. Best local: Vail." |
| Non-followed resorts | Invisible | Surfaced when meaningfully better |
| Pass awareness | Has a "Passes" tab (static info) | Pass filters every recommendation |
| Drive time | Not shown | Core to every comparison |
| Logistics | Not provided | "Leave tonight, book Elevation Hotel, chain law on Monarch" |
| Timing | "Next 6-10 days" (vague) | "Storm arrives Tuesday. Be at CB by Wednesday AM." |
| Storm intelligence | Not analyzed | "Southern storm — favors CB and Silverton over I-70" |

---

## The Key Insight

**OpenSnow is a weather dashboard with resort data.**
**We're building a ski decision engine with weather intelligence.**

OpenSnow answers: "What's the forecast for each of my saved resorts?"
We answer: "Where should you ski, when, and how do you get there?"

The data underneath might be similar. The experience is completely different.

---

## Do We Still Show the Charts?

Yes. Power users (and Chris is one) want to see the raw forecast data. The side-by-side 15-day view is valuable. But it should be:

1. **Below** the recommendation layer, not the primary view
2. **Ranked** by forecast totals (not alphabetical)
3. **Annotated** with pass status, drive time, and storm pattern notes
4. **Available** as a "detailed view" toggle

The default view is the recommendation. The data view is one tap away for people who want it.
