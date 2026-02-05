# UI Design Principles

**Purpose**: Establish the design principles that govern every screen, component, and interaction in the ski decision engine. These are non-negotiable — every design decision should trace back to one of these.

---

## 1. Glanceability Over Depth

The primary screen must answer the user's question in **under 3 seconds**. Most interactions happen in context — standing in a lift line, sitting on a chairlift with gloves on, checking your phone at breakfast. The interface must work at a glance.

**Rules:**
- The most important information is the largest and highest on screen
- Every data point earns its pixel — if it doesn't change a decision, it doesn't belong on the main screen
- Numbers > words. "8 inches" beats "moderate snowfall expected"
- Color and size encode meaning — don't make users read to understand

**Anti-patterns:**
- Scrolling to find the answer
- Requiring more than one tap to get the core information
- Walls of text where a number would do
- Equal visual weight for unequal importance

---

## 2. Progressive Disclosure

Show only what's needed at each level. The app has three depth levels, and each reveals more detail:

```
Level 1: DECISION SCREEN (main)
  → Glanceable table. Ranked resorts. One recommendation.
  → 80% of users stop here.

Level 2: RESORT DETAIL (tap a resort)
  → Full forecast chart, expert take, webcams, conditions
  → For power users who want the data behind the decision.

Level 3: RAW DATA (deep dive)
  → Hourly tables, weather stations, snow ratios, SNOTEL
  → For weather nerds and forecasters. 5% of users.
```

**Rules:**
- Never show Level 2 information at Level 1
- The path from Level 1 → 2 → 3 must be obvious (tap to expand)
- Users should never feel like information is hidden — just organized
- Advanced data is always accessible, never forced

**Reference**: Nielsen Norman Group defines progressive disclosure as deferring advanced features to secondary UI components while keeping essential content primary.

---

## 3. Comparison Is the Default State

The app's core job is comparison — which resort has the most snow? The UI must make comparison effortless. Side-by-side data, not sequential pages.

**Rules:**
- Resorts appear in a single ranked list, not separate pages
- The same data columns appear for every resort (consistency enables scanning)
- Ranking order changes dynamically based on the active metric (snow, base, open %)
- Visual hierarchy makes the #1 option obvious without reading

**Anti-patterns:**
- Separate pages per resort (forces back-and-forth)
- Inconsistent data formats between resorts
- Static sort order that doesn't reflect current conditions
- Equal visual treatment of all resorts regardless of conditions

---

## 4. Context Over Chrome

The interface serves the data. Decorative elements, heavy gradients, and elaborate animations add friction. Use visual design to **encode meaning**, not to decorate.

**Rules:**
- Color means something: ❄️ blue for snow, 🟢 green for good conditions, 🔴 red for alerts
- Typography creates hierarchy: size and weight differentiate importance, not decorative fonts
- Whitespace guides the eye — don't fill every pixel
- Icons supplement text, never replace it for critical data
- No purely decorative elements on the decision screen

**Reference**: "Less is more" remains dominant in modern app design. Minimalist interfaces featuring plenty of whitespace, simple layouts, and only essential elements help users focus on content without distraction. (Chop Dawg, 2025)

---

## 5. Dark Mode First

Ski conditions are often checked early morning (pre-dawn), in dark cars, and on bright slopes. Dark mode:
- Reduces eye strain in low light
- Provides natural contrast for snow/weather data
- Feels premium and matches the ski-culture aesthetic
- Makes colored data points (snow amounts, alerts) pop

**Rules:**
- Design dark mode first, light mode second
- All text meets WCAG AA contrast ratios (4.5:1 minimum for body text, 3:1 for large text)
- Use a near-black background (#0D1117 or similar), not pure black (#000)
- Accent colors are vibrant but not neon — think OpenSnow's palette
- Light mode is available but not the default

---

## 6. One-Handed, Gloves-On Operation

Skiers often check conditions with cold hands, thick gloves, or while holding gear. The interface must be operable with minimal precision.

**Rules:**
- Minimum tap target: 48x48dp (per Apple HIG and Material Design)
- Primary actions in the thumb zone (bottom half of screen)
- Swipe gestures for time window switching (Today → Weekend → Next 5 Days)
- No hover states (mobile-first)
- No small text links as primary navigation
- Pull-to-refresh for data updates

---

## 7. Notification-First Design

The app is most valuable when it comes to you, not when you come to it. Design notifications as a first-class experience, not an afterthought.

**Rules:**
- Every notification must be **actionable** — if the user can't do something with it, don't send it
- Notifications carry enough context to be useful without opening the app
- Notification → app deep-link must land on the relevant screen (not home)
- Users control notification types and frequency granularly
- Never send routine dry-day updates
- Storm alerts escalate in urgency over time (📡 → 🎯 → 🔴)

**Reference**: "Start notification design early, not as an afterthought. Classify notifications by three levels: high, medium, and low." (Toptal, 2025)

---

## 8. Trust Through Transparency

Skiers are weather-skeptical. They know forecasts are often wrong. The app earns trust by being honest, showing sources, and admitting uncertainty.

**Rules:**
- Show forecast ranges, not false precision ("8-12 inches" not "10 inches")
- Attribute data sources ("Reported by resort" vs "Estimated by model")
- Show when data was last updated
- Expert commentary alongside automated data builds credibility
- Acknowledge uncertainty: "Models diverge — this could change"
- Never over-hype conditions for engagement

---

## Summary

| Principle | One-liner |
|-----------|-----------|
| Glanceability | Answer the question in 3 seconds |
| Progressive Disclosure | Show only what's needed at each level |
| Comparison Default | Side-by-side, not page-by-page |
| Context Over Chrome | Design encodes meaning, not decoration |
| Dark Mode First | Designed for 5 AM and the slopes |
| Gloves-On Operation | Big targets, thumb zone, swipe navigation |
| Notification-First | The app comes to you |
| Trust Through Transparency | Honest data, attributed sources, admitted uncertainty |
