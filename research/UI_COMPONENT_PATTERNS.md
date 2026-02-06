# UI Component Patterns

**Purpose**: Define the core UI components and patterns used across the app. Every screen is built from these primitives.

---

## Core Components

### 1. Resort Row

The atomic unit of the app. A single resort's data in one scannable row.

```
┌──────────────────────────────────────────────────────┐
│ ❄️  Vail                10"   9-12"  37"  60%  1h40  │
│     Epic ✓              24hr  5day   base open drive │
└──────────────────────────────────────────────────────┘
```

**Anatomy:**
- **Left**: Resort icon/emoji + name + pass badge
- **Center**: Data columns (24hr snow, forecast, base depth, open %)
- **Right**: Drive time
- **Row highlight**: Top-ranked resort gets a subtle accent border or background

**Behavior:**
- Tap → opens Resort Detail
- Long-press → quick actions (add to favorites, share, set alert)
- Swipe left → dismiss from Worth Knowing (if in that section)

**Variants:**
- **Your Resort row**: Full data, no price. Pass badge shows ✓
- **Worth Knowing row**: Adds walk-up price. Pass badge shows ✗ or price
- **Storm alert row**: Adds flight price. Destination badge

**Typography:**
- Resort name: 16sp semibold
- Data values: 18sp bold (the numbers are the point)
- Labels: 12sp regular, muted color
- Drive time: 14sp regular

---

### 2. Section Header

Separates the three main sections with clear labels and optional status.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
YOUR RESORTS · Epic · From Avon        [Edit]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
💡 WORTH KNOWING
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🔴 STORMS · S. Colorado: 18-30" Feb 10-13
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Typography:**
- Section title: 13sp bold, uppercase, letter-spaced
- Context: 13sp regular, muted
- Divider line: 1px, subtle

---

### 3. Recommendation Bar

A single-line, high-contrast recommendation that appears below the resort table.

```
┌──────────────────────────────────────────────────────┐
│ ❄️ POWDER DAY — Vail got the most. Leave by 6:30am. │
└──────────────────────────────────────────────────────┘
```

```
┌──────────────────────────────────────────────────────┐
│ 🟡 Groomers everywhere. Breck has most terrain open. │
└──────────────────────────────────────────────────────┘
```

**Rules:**
- Maximum one sentence
- Starts with a status emoji/indicator
- Contains the action or decision
- Background color matches severity (subtle blue for info, gold for storm, red for alert)

---

### 4. Time Segment Switcher

Horizontal pill selector for changing the ranking time window.

```
┌──────────────────────────────────────────────────────┐
│  [Today]  [ Weekend ]  [Next 5 Days]  [Next 10 Days] │
└──────────────────────────────────────────────────────┘
```

**Behavior:**
- Tap a segment → table re-ranks based on that time window
- Active segment: filled pill, bold text
- Inactive: outline pill, regular text
- Also supports swipe left/right on the table area
- "Weekend" auto-calculates to the next Sat-Sun (or current Sat-Sun if it IS the weekend)

---

### 5. Storm Tracker Bar

Persistent bar at the bottom of the main screen. Collapsible. Expandable.

**Quiet state (most days):**
```
┌──────────────────────────────────────────────────────┐
│ ⚪ No major storms in the next 10 days               │
└──────────────────────────────────────────────────────┘
```

**Active state:**
```
┌──────────────────────────────────────────────────────┐
│ 🔴 S. Colorado: 18-30" Feb 10-13 · ✈️ $289 RT   →  │
└──────────────────────────────────────────────────────┘
```

**Behavior:**
- Tap → expands to full storm detail / chase trip plan
- Color scales with severity: grey → yellow → orange → red
- Contains just enough info to decide whether to tap
- For local-only users: shows incoming storms for their area instead

---

### 6. Resort Detail Card (Level 2)

Full-screen view when tapping a resort row. This is where the data lives.

```
┌──────────────────────────────────────────────────────┐
│  ← Back                                    [Alert 🔔]│
│                                                       │
│  VAIL · Open (60%) · 37" base                        │
│  Epic ✓ · 10 min from Avon                           │
│                                                       │
│  ┌─ SNOW FORECAST ──────────────────────────────┐    │
│  │  [15-day bar chart — OpenSnow-style]         │    │
│  │  Past ←──────── Now ──────────→ Future       │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
│  EXPERT TAKE                                          │
│  "Sunny through Monday, then storm likely             │
│   mid-next week. NW flow favors Vail."                │
│                                      — Joel Gratz     │
│                                                       │
│  TODAY                                                │
│  🌡️ 20°F (feels 13°F) · 💨 5mph NNW · Clear         │
│  🎿 166/277 trails · 20/33 lifts                     │
│  📋 Snow Groomed                                      │
│                                                       │
│  ┌─ DAILY FORECAST ─────────────────────────────┐    │
│  │  [Scrollable day cards: temp, precip, wind]  │    │
│  └──────────────────────────────────────────────┘    │
│                                                       │
│  WEBCAM · [Thumbnail → tap for full]                  │
│                                                       │
│  [More: Hourly · Stations · Avalanche · Trail Map]   │
└──────────────────────────────────────────────────────┘
```

**Sections (in order):**
1. Snow forecast chart (the hero — biggest visual element)
2. Expert take (human signal)
3. Current conditions (temp, wind, trails, lifts)
4. Daily forecast cards (scrollable horizontal)
5. Webcam thumbnail
6. "More" links for deep-dive data (Level 3)

---

### 7. Chase Trip Card (Level 2)

Full-screen view when tapping a storm tracker alert.

```
┌──────────────────────────────────────────────────────┐
│  ← Back                                              │
│                                                       │
│  ✈️ CHASE TRIP: Telluride                             │
│  Feb 11-14 · 3 nights · On your pass (Ikon ✓)       │
│                                                       │
│  SNOW FORECAST                                        │
│  🥇 Telluride   18-24"                               │
│  🥈 CB          15-20"                               │
│  🥉 Silverton   24-30" (expert only)                 │
│                                                       │
│  ────────────────────────────────────────────         │
│  ✈️ FLIGHTS                                           │
│  EWR → MTJ  $289 RT  [Book →]                        │
│  EWR → DEN  $180 RT  (6hr drive)                     │
│                                                       │
│  🏨 LODGING                                           │
│  Hotel Telluride  $195/night  [Book →]                │
│                                                       │
│  🚗 RENTAL CAR                                        │
│  Montrose  $55/day AWD  [Book →]                      │
│                                                       │
│  ────────────────────────────────────────────         │
│  TOTAL: ~$1,239 · $413/powder day                    │
│                                                       │
│  📅 SKI PLAN                                          │
│  Wed: Storm active. Ski PM, trees.                    │
│  Thu: POWDER DAY. Revelation Bowl first.              │
│  Fri: Day 2 steeps + stashes.                         │
│  Sat: Groomed cruise. Depart 2pm.                     │
│                                                       │
│  ⚠️ Book by Saturday — prices jump Sunday             │
└──────────────────────────────────────────────────────┘
```

---

## Layout Patterns

### The F-Pattern

Users scan mobile screens in an F-pattern: top-left → across the top → down the left side. Our layout respects this:

- **Top**: Section header with context (pass, location)
- **Left column**: Resort names (the anchor — what you scan first)
- **Right columns**: Data values (what you compare once you've found the resort)
- **Bottom**: Recommendation / storm tracker

### Card-Based Layout

Each section (Your Resorts, Worth Knowing, Storm Tracker) is a distinct card with clear visual separation:
- Cards have subtle backgrounds (slightly lighter than the page background in dark mode)
- Cards have rounded corners (12-16px radius)
- Cards have consistent internal padding (16px)
- Spacing between cards: 12px

### Horizontal Scroll for Time Data

Day-by-day forecasts use horizontal scroll (cards), not vertical tables:
- Each day is a card: date, temp, precip, icon
- Horizontal scroll lets you see 4-5 days, swipe for more
- No wrapping — one continuous row

---

## Interaction Patterns

### Pull-to-Refresh
Pull down on the main screen refreshes all resort data. Shows "Updated 2 min ago" timestamp.

### Swipe Between Time Windows
Swipe left/right on the resort table area to switch between Today / Weekend / Next 5 Days / Next 10 Days. Visual feedback: the time segment switcher animates along.

### Tap to Expand
Tap any resort row → full detail slides up from the bottom (sheet pattern). Swipe down to dismiss.

### Long-Press for Quick Actions
Long-press a resort row → context menu:
- Set snow alert (notify me when > X inches)
- Share conditions
- Add/remove from My Resorts
- Open in maps (driving directions)

### Haptic Feedback
- Light haptic on tab switch
- Medium haptic on pull-to-refresh completion
- Heavy haptic on storm alert interaction

---

## Responsive Considerations

### Phone (Primary)
- Single column layout
- Resort table is the full-width hero
- Bottom sheet for detail views
- Tab bar at bottom (if needed): Home / Storms / Settings

### Tablet
- Side-by-side: resort table + detail view
- Tap a resort on the left → detail loads on the right
- No bottom sheet — detail is always visible

### Web
- Three-column: resort table | detail view | storm tracker/map
- Desktop-optimized data density (show more columns)
- Keyboard shortcuts for power users (↑↓ to navigate resorts, Enter to expand)

### Watch (Apple Watch / WearOS)
- Complication: Current snow at #1 resort
- Glance: Top 3 resorts with 24hr snowfall
- Notification: Storm alerts delivered to wrist
