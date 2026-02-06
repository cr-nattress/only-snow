# Design System

**Purpose**: Define the visual language — colors, typography, spacing, and iconography — that creates a consistent, beautiful, and functional experience.

---

## Color Palette

### Dark Theme (Primary)

Design dark mode first. The app lives in a cold, outdoor, high-contrast world — the palette should feel like mountain twilight.

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0D1117` | Page background |
| `bg-card` | `#161B22` | Card/section backgrounds |
| `bg-elevated` | `#1C2128` | Elevated cards, modals |
| `border-subtle` | `#30363D` | Card borders, dividers |
| `text-primary` | `#E6EDF3` | Primary text (WCAG AA: 13.5:1 on bg-primary) |
| `text-secondary` | `#8B949E` | Secondary text, labels (WCAG AA: 5.2:1) |
| `text-muted` | `#484F58` | Disabled, timestamps |

### Accent Colors

| Token | Hex | Usage |
|-------|-----|-------|
| `snow-blue` | `#58A6FF` | Snow amounts, primary accent |
| `snow-heavy` | `#79C0FF` | Heavy snowfall highlights |
| `alert-green` | `#3FB950` | Good conditions, "Go" signals |
| `alert-yellow` | `#D29922` | Moderate conditions, watch |
| `alert-orange` | `#DB6D28` | Significant storms |
| `alert-red` | `#F85149` | Chase alerts, critical |
| `pass-epic` | `#1E88E5` | Epic pass badge |
| `pass-ikon` | `#FF6B35` | Ikon pass badge |
| `pass-indy` | `#8B5CF6` | Indy pass badge |
| `pass-none` | `#8B949E` | No pass / walk-up |

### Semantic Colors

| Token | Usage |
|-------|-------|
| `condition-powder` | `snow-blue` — fresh powder |
| `condition-groomed` | `alert-green` — groomed/good |
| `condition-icy` | `alert-yellow` — icy/variable |
| `condition-closed` | `text-muted` — closed terrain |
| `rank-1` | `#FFD700` — gold (🥇) |
| `rank-2` | `#C0C0C0` — silver (🥈) |
| `rank-3` | `#CD7F32` — bronze (🥉) |

### Light Theme (Secondary)

For users who prefer light mode, or for outdoor glare situations:

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#FFFFFF` | Page background |
| `bg-card` | `#F6F8FA` | Card backgrounds |
| `border-subtle` | `#D0D7DE` | Borders |
| `text-primary` | `#1F2328` | Primary text |
| `text-secondary` | `#656D76` | Secondary text |

Accent colors remain the same (adjust brightness for contrast compliance).

---

## Typography

### Font Stack

```
Primary: Inter (or SF Pro on iOS, Roboto on Android)
Monospace: JetBrains Mono (for data values)
```

Inter is clean, highly legible at small sizes, has excellent number rendering, and works beautifully on screens. It's the right choice for a data-dense app.

### Type Scale

| Token | Size | Weight | Line Height | Usage |
|-------|------|--------|-------------|-------|
| `display` | 32sp | Bold | 1.2 | Hero numbers (snow total on detail) |
| `headline` | 24sp | Bold | 1.3 | Section titles on detail screens |
| `title` | 18sp | Semibold | 1.3 | Resort names |
| `data-value` | 18sp | Bold, Mono | 1.0 | Snow amounts, base depth, temps |
| `body` | 16sp | Regular | 1.5 | Expert commentary, descriptions |
| `label` | 13sp | Medium, Uppercase | 1.2 | Column headers, section labels |
| `caption` | 12sp | Regular | 1.4 | Timestamps, attributions |
| `badge` | 11sp | Bold | 1.0 | Pass badges, status indicators |

### Key Decision: Monospace for Data

Snow amounts, temperatures, and percentages use monospace (`JetBrains Mono` or `SF Mono`). This ensures:
- Numbers align vertically in the table (8" lines up with 12")
- The eye can scan columns quickly
- Data feels precise and trustworthy

```
Good:   8"   37"   60%   1h40
        12"  47"   85%   10m

Bad:    8"   37"   60%  1h40
        12"  47"   85%  10m
```

---

## Spacing System

Base unit: **4px**. All spacing is a multiple of 4.

| Token | Value | Usage |
|-------|-------|-------|
| `space-xs` | 4px | Inline spacing, icon-to-text gaps |
| `space-sm` | 8px | Between related elements |
| `space-md` | 12px | Between cards, section gaps |
| `space-lg` | 16px | Card internal padding |
| `space-xl` | 24px | Between major sections |
| `space-2xl` | 32px | Screen-level padding |

### Card Metrics

| Property | Value |
|----------|-------|
| Border radius | 12px |
| Internal padding | 16px |
| Between cards | 12px |
| Border width | 1px (border-subtle) |

---

## Iconography

### Snow & Weather

Use a consistent icon set for weather conditions. Recommend **Weather Icons** (open source) or custom set:

| Condition | Icon | Color |
|-----------|------|-------|
| Heavy snow | ❄️ (solid snowflake) | `snow-heavy` |
| Light snow | ❄️ (outline snowflake) | `snow-blue` |
| Clear/Sunny | ☀️ | `alert-yellow` |
| Partly cloudy | ⛅ | `text-secondary` |
| Cloudy | ☁️ | `text-secondary` |
| Wind | 💨 | `text-secondary` |
| Rain | 🌧️ | `alert-yellow` (bad for skiing) |

### Status & Navigation

| Purpose | Icon | Notes |
|---------|------|-------|
| Powder day | ❄️ or custom snowflake | Used in recommendation bar |
| Good conditions | 🟢 circle | Groomed/open |
| Caution | 🟡 circle | Variable/watch |
| Alert | 🔴 circle | Chase alert/critical |
| Drive time | 🚗 or clock | Subtle, secondary |
| Flight | ✈️ | Chase trip mode |
| Pass badge | Colored dot + text | "Epic" in pass-epic color |
| Expand/detail | → chevron | Right side of row |

### Icon Sizing

| Context | Size |
|---------|------|
| In-line with text | 16px |
| Resort row leading | 20px |
| Section header | 16px |
| Status indicator | 12px (dot) |
| Detail screen hero | 32px |

---

## Motion & Animation

### Principles
- Motion is **functional**, not decorative
- Animations are fast: 200-300ms for transitions
- Use easing: `ease-out` for entrances, `ease-in` for exits
- Reduce motion must be respected (prefers-reduced-motion)

### Specific Animations

| Interaction | Animation | Duration |
|-------------|-----------|----------|
| Table re-rank (time switch) | Rows slide to new positions | 250ms |
| Resort detail open | Bottom sheet slides up | 300ms |
| Resort detail close | Bottom sheet slides down | 200ms |
| Pull to refresh | Spinner, then rows fade-refresh | 300ms |
| Storm tracker expand | Bar expands to card | 300ms |
| Worth Knowing appear | Fade in + slide down | 250ms |
| Notification badge | Scale pulse (1.0 → 1.2 → 1.0) | 400ms |

### Micro-interactions
- Snow amounts animate when they change (old number → new number, counting transition)
- Ranking medal (🥇🥈🥉) has a subtle shimmer when the ranking changes
- Pull-to-refresh shows a snowflake spinner instead of a generic spinner

---

## Data Visualization

### The Snow Forecast Bar Chart

The most important visual in the app. Adapts OpenSnow's 15-day chart but optimized for comparison.

```
        Past          Now         Future
  ┌─────────────────┬───┬─────────────────┐
  │ ░░░ ███ ░░░ ░░░ │ █ │ ░░░ ███ ███ ░░░│
  │  0   8   2   0  │ 1 │  0   4   3   2  │
  └─────────────────┴───┴─────────────────┘
```

**Design:**
- Dark blue bars for snowfall amounts
- "Now" column highlighted (brighter, slightly wider)
- Past bars are dimmer than future bars (past is reference, future is decision)
- X-axis: dates with day-of-week abbreviations
- Y-axis: implied by bar height (no gridlines needed — keep it clean)
- Tap a bar → tooltip shows exact amount and date

### Condition Indicators

Simple colored dots/pills for surface conditions:

```
[● Powder]  [● Groomed]  [● Packed]  [● Icy]  [● Closed]
  blue       green        neutral     yellow     grey
```

---

## Accessibility

### WCAG AA Compliance (Minimum)

| Check | Requirement | Our Implementation |
|-------|------------|-------------------|
| Text contrast | 4.5:1 (normal), 3:1 (large) | All text meets AA on both themes |
| Touch targets | 44x44pt minimum (Apple), 48x48dp (Material) | 48dp minimum for all interactive elements |
| Screen reader | All data readable | Semantic HTML, ARIA labels on charts |
| Color independence | Don't rely on color alone | Numbers + color. Icons + labels. |
| Motion sensitivity | Respect prefers-reduced-motion | All animations disabled when set |
| Text scaling | Support dynamic type (iOS) / font scaling (Android) | Layout doesn't break at 200% text |

### Screen Reader Experience

The resort table reads as:
> "Your Resorts. Vail, ranked number 1. 10 inches in the last 24 hours. 9 to 12 inches forecast next 5 days. 37 inch base. 60 percent open. 1 hour 40 minutes drive."

Charts provide text alternatives:
> "Snow forecast for Vail. Past 5 days: 1 inch. Next 5 days: 0 inches. Next 6 to 10 days: 9 inches."

---

## Platform-Specific Guidance

### iOS
- Follow Apple Human Interface Guidelines for navigation patterns
- Use SF Pro as the primary font (falls back to Inter for web)
- Bottom sheet style: `.medium` detent for resort detail, `.large` for chase trip
- Use SF Symbols where possible for system consistency
- Support Dynamic Type
- Support haptic feedback (UIImpactFeedbackGenerator)

### Android
- Follow Material Design 3 guidelines
- Use Roboto as the primary font (falls back to Inter for web)
- Bottom sheet: Material BottomSheet with peek/expand
- Use Material You dynamic color where appropriate
- Support predictive back gesture (Android 14+)

### Web (PWA)
- Responsive: phone-first, tablet-adaptive, desktop-enhanced
- Use Inter as the primary font
- Service worker for offline access to last-known conditions
- Push notifications via Web Push API
- Install prompt for PWA add-to-home-screen
