# Epic 301: Persona-Adaptive Recommendations

**Status:** Not started
**Priority:** Medium — persona classification works, but nothing adapts to it
**Phase:** C (Intelligence layer)

## Context

The persona system is well-built: a 10-step onboarding flow classifies users into 9 personas using a weighted scoring algorithm. The `PersonaContext` provides persona state globally. But the dashboard, recommendations, and resort cards are identical for every persona. The product spec describes detailed per-persona adaptations.

## Goal

The dashboard, recommendations, and resort display adapt based on the user's persona — showing different metrics, language, and priorities.

## User Stories

### 301.1 — Persona-aware recommendation text
- Recommendation component already shows "ON YOUR PASS / BEST SNOW / BEST VALUE"
- Adapt text per persona:
  - **Core Local / Storm Chaser**: Lead with snowfall totals and storm timing
  - **Family Planner**: Lead with grooming, crowds, kid-friendly terrain
  - **Weekend Warrior**: Lead with drive time, value per hour
  - **Budget Maximizer**: Lead with walk-up prices, deals, pass value
  - **Learning Curve**: Lead with beginner terrain %, weather comfort
- In API mode: pass persona to AI narrative generation (Epic 201)

### 301.2 — Persona-aware resort row emphasis
- Highlight different columns based on persona:
  - Powder Hunter: snowfall column bold, forecast numbers prominent
  - Family Planner: open % prominent, conditions text visible
  - Weekend Warrior: drive time visible (when Epic 200 complete)
  - Budget Maximizer: show cost/value indicator
- Subtle visual change, not a completely different layout

### 301.3 — Persona-aware Worth Knowing triggers
- Adjust Worth Knowing thresholds per persona:
  - Storm Chaser: lower snow threshold (show distant opportunities sooner)
  - Family Planner: surface family-friendly resorts even with less snow
  - Budget Maximizer: surface discounted resorts, deal days
  - Learning Curve: surface beginner-friendly resorts with good weather

### 301.4 — Persona-aware storm tracker
- Storm tracker urgency and language per persona:
  - Storm Chaser: aggressive chase prompts, flight prices early
  - Family Planner: "Good family day ahead" when grooming + mild weather
  - Weekend Warrior: weekend-specific storm timing
  - Beginner: "Great learning conditions" on groomed, sunny days

### 301.5 — Persona badge and identity
- Show persona emoji + label in header (already partially in `Header.tsx`)
- Tapping opens persona settings
- "Viewing as: Core Local 🎿" indicator
- Quick-switch between personas (debug/comparison mode)

## Verification

- [ ] Powder Hunter sees snowfall-forward recommendations
- [ ] Family Planner sees grooming/crowd-forward recommendations
- [ ] Weekend Warrior sees drive-time-aware suggestions
- [ ] Beginner sees simplified, encouraging language
- [ ] Changing persona in settings immediately changes dashboard
- [ ] Works in both mock and API modes
- [ ] `pnpm build` and `pnpm typecheck` pass

## Dependencies

- Epic 100 (frontend-backend connection)
- Epic 101 (persona persisted in user preferences)
- Epic 104 (Worth Knowing algorithm — for persona-aware triggers)
- Epic 201 (AI narratives — for persona-aware tone, optional)
