# Epic 005: Polish & Refinement

## Summary

Add animations, transitions, micro-interactions, and additional data scenarios to elevate the POC from functional to polished. This epic focuses on the details that make the product feel professional and delightful.

## Goal

1. Add meaningful animations that communicate state changes
2. Create smooth transitions between views
3. Add micro-interactions for feedback
4. Expand mock data with more realistic scenarios
5. Implement dark mode support

---

## User Stories

### 1. Resort re-ranking animation

**As a** user switching time windows,
**I want** to see resorts animate to their new positions,
**so that** I understand the ranking changed.

#### Acceptance Criteria
- Resorts smoothly slide to new positions when time window changes
- Animation duration ~300ms with ease-out curve
- No layout jump or flash during transition

---

### 2. Section appear/disappear transitions

**As a** user,
**I want** Worth Knowing and other conditional sections to fade in/out smoothly,
**so that** the UI doesn't feel jarring.

#### Acceptance Criteria
- Worth Knowing fades in when it appears
- Smooth height animation when sections expand/collapse
- Storm Tracker state changes animate color smoothly

---

### 3. Button and interactive element feedback

**As a** user,
**I want** buttons and interactive elements to respond to my touch,
**so that** I know my input was registered.

#### Acceptance Criteria
- Buttons have subtle scale/opacity change on press
- Toggle switches animate smoothly
- Cards have hover states on desktop

---

### 4. Loading and skeleton states

**As a** user,
**I want** to see loading indicators while data loads,
**so that** I know the app is working.

#### Acceptance Criteria
- Skeleton loaders for resort rows
- Subtle pulse animation on loading states
- Smooth transition from skeleton to content

---

### 5. Page transitions

**As a** user navigating between pages,
**I want** smooth transitions,
**so that** navigation feels fluid.

#### Acceptance Criteria
- Fade transition between pages
- Resort detail slides in from right
- Back navigation reverses the animation

---

### 6. Additional mock data scenarios

**As a** tester,
**I want** more realistic data scenarios,
**so that** I can evaluate different conditions.

#### Acceptance Criteria
- Add "Powder Day" scenario (fresh overnight snow)
- Add "Dry Week" scenario (no snow, groomed conditions)
- Add "Multi-Region Storm" scenario for chase mode
- Scenarios cover edge cases (all resorts equal, one clear winner)

---

### 7. Dark mode support

**As a** user,
**I want** a dark color scheme option,
**so that** I can use the app comfortably at night.

#### Acceptance Criteria
- Dark mode follows system preference
- All components have dark variants
- Proper contrast ratios maintained
- Map tiles switch to dark variant

---

### 8. Map interaction improvements

**As a** user,
**I want** the map to feel more interactive,
**so that** I can explore resort locations.

#### Acceptance Criteria
- Tap marker to see resort tooltip
- Markers pulse briefly when data updates
- Smooth zoom animation when switching scenarios

---

## Implementation Notes

- Use Tailwind's `transition` utilities for CSS animations
- Use `framer-motion` for complex animations (optional)
- Dark mode via Tailwind's `dark:` variant
- Skeleton components can be simple div placeholders with animation

## Files to Create/Modify

- `src/app/globals.css` — Add dark mode CSS variables
- `src/components/*.tsx` — Add transition classes and dark variants
- `src/data/scenarios.ts` — Add new scenario data
- `tailwind.config.ts` — Enable dark mode

## Verification

- All animations feel smooth (60fps)
- Dark mode works across all pages
- New scenarios appear in scenario switcher
- `npm run build` passes
