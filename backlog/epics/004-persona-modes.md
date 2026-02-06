# Epic 004: Persona-Adaptive Views

## Summary

Adapt the dashboard and resort information based on the user's skier persona. Different skiers care about different data — a Powder Hunter wants snowfall totals while a Family Planner cares about grooming and ski school.

## Current State

The dashboard shows the same information to all users. There's no way to customize the view based on skier type.

## Goal

1. Add persona selection to onboarding
2. Store persona preference
3. Adapt dashboard display based on persona:
   - Highlight different metrics
   - Change recommendation language
   - Show persona-relevant details

---

## Personas

Based on research, we support 5 personas:

| Persona | Focus | Key Metrics |
|---------|-------|-------------|
| **Powder Hunter** | Fresh snow, powder days | Snowfall totals, storm timing, terrain status |
| **Family Planner** | Logistics, kid-friendly | Grooming, crowds, beginner terrain, amenities |
| **Weekend Warrior** | Efficiency, quick trips | Drive time, value, conditions per hour |
| **Destination Traveler** | Chase trips, big storms | National storms, flight prices, 10-day outlook |
| **Beginner** | Learning, comfort | Beginner-friendly resorts, weather conditions |

---

## User Stories

### 1. Add persona selection to onboarding

**As a** new user,
**I want** to tell the app what kind of skier I am,
**so that** I get information relevant to my skiing style.

#### Acceptance Criteria
- Add a 4th step to onboarding after chase preference
- Show 5 persona options with icons and descriptions
- Store selection in state (mock — no persistence)
- Persona appears in settings for later modification

---

### 2. Store and display persona in settings

**As a** user,
**I want** to see and change my skier persona in settings,
**so that** I can update it if my preferences change.

#### Acceptance Criteria
- New section in settings: "Skier Type"
- Show current persona with description
- Tap to change shows same selector as onboarding

---

### 3. Adapt dashboard header/recommendation

**As a** user,
**I want** the recommendation to reflect my skier type,
**so that** advice feels personalized.

#### Acceptance Criteria
- Powder Hunter: Focus on powder conditions ("Fresh pow at Vail!")
- Family Planner: Focus on convenience ("Great family day at Beaver Creek")
- Weekend Warrior: Focus on efficiency ("Best value: Keystone today")
- Destination Traveler: Focus on storms ("Storm dropping 18" in Utah this week")
- Beginner: Focus on comfort ("Perfect learning conditions at Keystone")

---

### 4. Adapt resort row display

**As a** user,
**I want** resort cards to highlight what matters to me,
**so that** I can quickly compare resorts.

#### Acceptance Criteria
- Powder Hunter: Emphasize snowfall numbers, show storm icons
- Family Planner: Show grooming status, crowd level indicator
- Weekend Warrior: Show value score, drive time prominently
- Destination Traveler: Show extended forecast, flight indicator
- Beginner: Show beginner terrain %, hide advanced metrics

---

### 5. Add persona badge to UI

**As a** user,
**I want** to see my persona reflected in the interface,
**so that** I know the app understands my needs.

#### Acceptance Criteria
- Small persona badge/icon somewhere on dashboard
- Clicking badge goes to settings to change persona
- Badge matches persona (snowflake for Powder Hunter, family icon for Family Planner, etc.)

---

## Implementation Notes

- Persona stored in React state/context for POC
- Create `usePersona` hook for accessing persona across components
- Recommendation component already exists — add persona-aware variants
- Resort row can show/hide columns based on persona

## Files to Create/Modify

- `src/data/types.ts` — Add Persona type
- `src/context/PersonaContext.tsx` — Context for persona state
- `src/app/onboarding/page.tsx` — Add persona step
- `src/app/settings/page.tsx` — Add persona section
- `src/app/dashboard/page.tsx` — Wire up persona context
- `src/components/Recommendation.tsx` — Persona-aware messaging
- `src/components/ResortRow.tsx` — Persona-aware display

## Verification

- Complete onboarding with persona selection
- See persona-specific recommendation on dashboard
- Change persona in settings
- Dashboard updates to reflect new persona
- `npm run build` passes
