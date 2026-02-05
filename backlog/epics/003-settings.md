# Epic 003: Settings & Preferences

## Summary

Build the settings page where users manage their profile, saved resorts, pass, location, and notification preferences. This is the configuration hub that powers personalization across the app.

## Current State

No settings page exists. User preferences (location, pass, drive radius, chase willingness) are captured in onboarding but there's no way to modify them afterward.

## Goal

Create a settings page accessible from the header profile button that allows users to:
1. View and edit their location and drive radius
2. Change their pass
3. Manage saved resorts (add/remove)
4. Configure chase preferences (if enabled)
5. Manage notification preferences

---

## User Stories

### 1. Settings page shell and navigation

**As a** user,
**I want** to tap my profile icon to access settings,
**so that** I can modify my preferences.

#### Acceptance Criteria
- Profile button in header navigates to `/settings`
- Settings page has back navigation to dashboard
- Page header shows "Settings" with user initials
- Responsive layout consistent with other pages

---

### 2. Profile section — location and drive radius

**As a** user,
**I want** to view and edit my home location and drive radius,
**so that** I can update my preferences if I move or change my habits.

#### Acceptance Criteria
- Show current location (e.g., "Denver, CO")
- Show current drive radius (e.g., "2 hours")
- Tap to edit each field (modal or inline)
- Changes reflect immediately in the UI (mock — no persistence needed for POC)

---

### 3. Pass management

**As a** user,
**I want** to change my pass or add a second pass,
**so that** I can keep my pass information current.

#### Acceptance Criteria
- Show current pass with visual badge (Epic/Ikon/Indy/etc.)
- Tap to change pass — shows same pass selector as onboarding
- Support "Multiple" selection with sub-selection UI
- Pass change updates the display immediately

---

### 4. My Resorts management

**As a** user,
**I want** to see and manage my saved resorts,
**so that** I can add new resorts or remove ones I no longer visit.

#### Acceptance Criteria
- List all saved resorts with pass badge and drive time
- Swipe-to-remove or tap X to remove a resort
- "Add Resort" button shows searchable list of available resorts
- Resorts show pass compatibility (on pass / not on pass)

---

### 5. Chase preferences (conditional)

**As a** user who enabled chase mode,
**I want** to configure my chase preferences,
**so that** I get relevant chase alerts.

#### Acceptance Criteria
- Section only visible if user enabled chase in onboarding
- Show chase willingness setting (Anywhere / Within driving / No)
- Home airports selection (multi-select, suggested from location)
- Budget preference (optional)
- Trip length preference (optional)

---

### 6. Notification preferences

**As a** user,
**I want** to control which notifications I receive,
**so that** I only get alerts I care about.

#### Acceptance Criteria
- Toggle for each notification type:
  - Powder alerts
  - Storm incoming
  - Weekend outlook
  - Chase alerts (if chase enabled)
  - Worth knowing
  - Price drops (if chase enabled)
- Show preview/example of each notification type
- Default all to ON

---

## Implementation Notes

- This is a POC — no backend persistence needed
- Use React state or localStorage for preference changes
- Reuse pass selector component from onboarding
- Reuse notification preview cards from notifications page

## Files to Create/Modify

- `src/app/settings/page.tsx` — New settings page
- `src/app/layout.tsx` — Make profile button link to settings
- `src/components/PassSelector.tsx` — Extract from onboarding for reuse (optional)

## Verification

- Navigate to settings from header
- View all sections
- Mock edit location, pass, resorts
- Toggle notification preferences
- `npm run build` passes
