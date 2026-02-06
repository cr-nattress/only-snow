# Epic 001: Responsive Layout — Mobile, Tablet, Desktop

## Summary

Optimize the app for mobile (< 640px), tablet (640–1024px), and desktop (> 1024px). Use separate components per breakpoint where layouts diverge significantly. Push shared data transformation, sorting, and formatting into a shared hooks/utils layer so UI components stay thin.

## Current State

The entire app is locked to `max-w-md` (448px) in the root layout. Every component assumes mobile width — fixed column widths, `text-xs` sizing, cramped grids. There is no tablet or desktop treatment.

## Architecture

```
Page
 └─ <ResortRow.Mobile />  or  <ResortRow.Desktop />
         │                          │
         └────── useResortRow() ────┘   (shared hook: sorting, formatting, derived state)
```

**Principle**: If a component renders a fundamentally different layout at a breakpoint (card vs. table row, stacked vs. inline), use a separate component. If it just needs padding/font tweaks, use Tailwind breakpoints in a single component. All business logic, data shaping, and formatting lives in shared hooks — never duplicated across size variants.

## Breakpoints

| Name    | Range       | Tailwind prefix |
|---------|-------------|-----------------|
| Mobile  | < 640px     | (default)       |
| Tablet  | 640–1024px  | `sm:` / `md:`   |
| Desktop | > 1024px    | `lg:`           |

---

## User Stories

### 1. Unlock the root container

**As a** user on a tablet or desktop,
**I want** the app to fill available width with appropriate max-widths,
**so that** content doesn't feel like a phone app stretched onto a big screen.

#### Acceptance Criteria
- Remove `max-w-md` from root layout
- Apply responsive max-widths: `max-w-md` mobile, `max-w-2xl` tablet, `max-w-5xl` desktop
- Center the container with `mx-auto`
- Scale horizontal padding: `px-4` mobile, `px-6` tablet, `px-8` desktop

#### Notes
- This unblocks all other stories — do this first
- Existing components will stretch and break; that's expected and handled by subsequent stories

---

### 2. Responsive ResortRow — card (mobile) vs. table row (desktop)

**As a** user on desktop,
**I want** resort data displayed as a scannable table row with all columns visible,
**so that** I can compare resorts at a glance.

**As a** user on mobile,
**I want** resort data displayed as a compact card,
**so that** I can read it without horizontal scrolling.

#### Acceptance Criteria
- **Mobile**: Resort name + conditions badge on top line, key stats (24hr, forecast, base) below in a 3-col grid. Daily breakdown hidden behind a tap-to-expand.
- **Tablet**: Same as mobile but with the daily breakdown visible inline.
- **Desktop**: Single horizontal row — icon, name, pass badge, 24hr, forecast, base, open%, daily breakdown cells — all in one line.
- Create `useResortRow(conditions, timeWindow)` hook that computes: display values, sort keys, color classes, formatted strings. Both mobile and desktop components consume this hook.

#### Notes
- ResortRow is the most complex component and the highest priority for split treatment
- The 10-day daily breakdown is especially problematic — 10 cells at 30px each is unreadable on mobile

---

### 3. Responsive ResortMap height

**As a** user on a larger screen,
**I want** the map to be taller and more useful,
**so that** I can actually see resort positions and interact with the map.

#### Acceptance Criteria
- Mobile: `h-48` (192px) — current behavior
- Tablet: `h-64` (256px)
- Desktop: `h-80` (320px)
- Marker size scales: 32px mobile, 36px tablet, 40px desktop
- Move marker icon creation into a shared `createSnowfallIcon(total, display, size)` util

---

### 4. Responsive WorthKnowing stats layout

**As a** user on mobile,
**I want** Worth Knowing stats readable without squishing,
**so that** I can see snowfall, base depth, and open % clearly.

#### Acceptance Criteria
- **Mobile**: Stats in a horizontal row with tighter labels (e.g., "6+" instead of "6\" 24hr")
- **Tablet/Desktop**: Full stat labels with room to breathe, inline with resort header
- Extract stat formatting into `useResortStats(entry)` shared hook

---

### 5. Responsive resort detail page

**As a** user viewing a resort detail on desktop,
**I want** a wider layout with the forecast chart and stats side by side,
**so that** I can see everything without scrolling.

#### Acceptance Criteria
- **Mobile**: Current vertical stack — stats grid, forecast chart, daily breakdown
- **Tablet**: Stats grid (3-col) + forecast chart side by side
- **Desktop**: Two-column layout — left: stats + forecast chart, right: daily breakdown + AI analysis
- Stats grid: 3 columns at all sizes, but with more padding on larger screens
- Forecast bar chart: bars get wider and taller on desktop
- Extract forecast data shaping into `useResortDetail(resortId)` hook

---

### 6. Responsive chase page

**As a** user exploring chase mode on desktop,
**I want** region cards in a grid instead of a single column,
**so that** I can compare regions side by side.

#### Acceptance Criteria
- **Mobile**: Single-column region card list (current)
- **Tablet**: 2-column grid of region cards
- **Desktop**: 3-column grid, with the selected region's detail expanding full-width below
- Trip plan layout: 2-column on desktop (flight/lodging left, ski plan right)
- Extract trip cost calculations into `useTripPlan(plan)` hook

---

### 7. Responsive ScenarioSwitcher

**As a** user on desktop,
**I want** the scenario switcher to feel native to a wider layout,
**so that** it doesn't look like a stretched mobile search bar.

#### Acceptance Criteria
- **Mobile**: Full-width input with icon, current behavior
- **Desktop**: Centered input with max-width, slightly larger text and padding
- Scenario dropdown: wider on desktop to show full scenario descriptions

---

### 8. Responsive text and spacing scale

**As a** user on a larger screen,
**I want** text and spacing to scale up appropriately,
**so that** the app doesn't feel like a zoomed-in phone screen.

#### Acceptance Criteria
- Body text: `text-xs` mobile, `text-sm` desktop
- Headings: `text-sm` mobile, `text-base` desktop
- Section spacing: `space-y-3` mobile, `space-y-4` tablet, `space-y-6` desktop
- Card padding: `p-3` mobile, `p-4` tablet, `p-6` desktop
- Define a shared spacing/typography scale (Tailwind config or CSS variables) so all components stay consistent

---

## Shared Layer (Hooks & Utils)

These are extracted as part of the stories above, collected here for reference:

| Hook / Util | Extracted from | Provides |
|---|---|---|
| `useResortRow(conditions, timeWindow)` | ResortRow | Display values, sort keys, color classes, formatted snowfall strings |
| `useResortStats(entry)` | WorthKnowing, ResortRow | Formatted stat labels, color coding, comparison logic |
| `useResortDetail(resortId)` | Resort detail page | Forecast data, chart values, season context |
| `useTripPlan(plan)` | Chase page trip view | Cost breakdowns, formatted prices, per-day calculations |
| `createSnowfallIcon(total, display, size)` | ResortMap | Leaflet DivIcon with size parameter |

## Implementation Order

1. Story 1 (unlock container) — unblocks everything
2. Story 8 (text/spacing scale) — improves everything cheaply
3. Story 2 (ResortRow) — highest complexity, biggest impact
4. Story 3 (map height) — quick win
5. Story 4 (WorthKnowing) — medium effort
6. Story 7 (ScenarioSwitcher) — quick win
7. Story 5 (resort detail) — medium effort
8. Story 6 (chase page) — lowest priority, largest page
