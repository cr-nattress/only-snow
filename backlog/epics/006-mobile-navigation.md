# Epic 006: Mobile & Tablet Navigation

## Summary

Add proper mobile and tablet navigation with a sticky header and bottom tab bar for easy thumb-reach navigation on smaller screens.

## Current State

The header is basic and doesn't adapt well to mobile usage patterns. There's no bottom navigation, which is the standard for mobile apps. Users have to scroll to the top to navigate.

## Goal

1. Create a sticky header optimized for mobile/tablet
2. Add a bottom tab bar for primary navigation on mobile
3. Hide bottom nav on desktop (use header only)
4. Ensure smooth transitions and proper safe areas

---

## User Stories

### 1. Sticky mobile header

**As a** mobile user,
**I want** a compact sticky header that stays visible as I scroll,
**so that** I always have access to branding and key actions.

#### Acceptance Criteria
- Header sticks to top on scroll
- Compact height on mobile (48-56px)
- Logo, persona badge, and profile remain accessible
- Slight shadow/blur effect when scrolled

---

### 2. Bottom tab bar for mobile

**As a** mobile user,
**I want** a bottom navigation bar with key destinations,
**so that** I can navigate with my thumb easily.

#### Acceptance Criteria
- Fixed to bottom of screen
- 4-5 tabs: Home/Dashboard, Chase, Notifications, Settings
- Active tab highlighted
- Safe area padding for notched phones
- Hidden on desktop (lg: breakpoint and up)

---

### 3. Tab bar icons and labels

**As a** user,
**I want** clear icons and labels on the tab bar,
**so that** I know what each tab does.

#### Acceptance Criteria
- Icon + label for each tab
- Active state: filled icon + colored label
- Inactive state: outline icon + muted label
- Smooth transition between states

---

### 4. Hide redundant navigation on desktop

**As a** desktop user,
**I want** navigation only in the header,
**so that** the interface isn't cluttered with duplicate nav.

#### Acceptance Criteria
- Bottom tab bar hidden on lg: screens and up
- Header can optionally show more nav items on desktop
- Clean transition when resizing browser

---

### 5. Safe area handling

**As a** user with a notched phone,
**I want** the UI to respect safe areas,
**so that** content isn't hidden behind the notch or home indicator.

#### Acceptance Criteria
- Bottom tab bar has padding for home indicator
- Header respects top safe area (status bar)
- Use `env(safe-area-inset-*)` CSS

---

## Implementation Notes

- Use Tailwind's `fixed`, `sticky`, `bottom-0` utilities
- Safe areas via `pb-[env(safe-area-inset-bottom)]`
- Hide bottom nav on desktop: `lg:hidden`
- Consider using a simple icon set (emoji or Heroicons)

## Files to Create/Modify

- `src/components/Header.tsx` — Make sticky, add scroll detection
- `src/components/BottomNav.tsx` — New bottom tab bar component
- `src/app/layout.tsx` — Include BottomNav, adjust body padding
- `src/app/globals.css` — Safe area utilities if needed

## Verification

- Mobile: bottom nav visible, header sticky
- Tablet: same as mobile
- Desktop: no bottom nav, header only
- Safe areas work on iPhone with notch
- `npm run build` passes
