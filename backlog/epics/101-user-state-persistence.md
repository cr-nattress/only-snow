# Epic 101: User State Persistence

**Status:** Not started
**Priority:** Critical — without this, every session starts from zero
**Phase:** A (Foundation)

## Context

The frontend onboarding flow collects location, pass type, drive radius, persona, and chase willingness through a sophisticated 10-step flow with weighted persona classification. The settings page lets users edit all of these. But everything is stored in `useState` — gone on refresh.

The backend already has `GET/PUT /api/user/preferences` with a `users` table that stores all of these fields, plus a flexible JSONB `preferences` column.

## Goal

User preferences persist across sessions. Onboarding results are saved to the backend. Settings changes are saved immediately. Returning users see their configured dashboard.

## User Stories

### 101.1 — Save onboarding results to backend
- On onboarding completion, `PUT /api/user/preferences` with collected data
- Map onboarding fields to backend schema:
  - `location` → `location`
  - `pass` → `passType`
  - `driveRadius` → `driveRadius`
  - `chaseWillingness` → `chaseWillingness`
  - `persona` (legacy) → `persona`
  - `userPersona` (V2 signals + classification) → `preferences` JSONB
- Redirect to dashboard after save succeeds
- Show error toast if save fails (but still allow proceeding)

### 101.2 — Load preferences on app start
- On dashboard mount, `GET /api/user/preferences`
- Populate `PersonaContext` with saved persona
- Use saved location/pass/radius to filter resort display
- If no preferences exist (new user), redirect to onboarding

### 101.3 — Persist settings changes
- Each settings section saves on change (debounced or on blur)
- Location, drive radius, pass type → `PUT /api/user/preferences`
- Persona change → update both `persona` and `preferences.userPersona`
- Chase willingness toggle → `chaseWillingness`
- Show save confirmation (subtle, non-blocking)

### 101.4 — Handle unauthenticated users
- Without auth, use `localStorage` as fallback
- Prompt to sign in to sync across devices
- On sign-in, migrate localStorage preferences to backend

## Verification

- [ ] Complete onboarding → refresh page → dashboard shows your resorts (not default)
- [ ] Change pass type in settings → refresh → change persists
- [ ] New user (no preferences) → redirected to onboarding
- [ ] Works without auth (localStorage fallback)
- [ ] `pnpm build` and `pnpm typecheck` pass

## Dependencies

- Epic 100 (data provider) — needs API client wiring
- Backend `/api/user/preferences` route — already implemented
- Auth (Epic 007 / existing NextAuth) — nice to have but not blocking (localStorage fallback)

## Notes

- The backend auth uses Supabase JWT (Bearer token). The frontend uses NextAuth with Google OAuth. These are different auth systems. For now, the user preferences route may need to accept NextAuth session tokens, or we add a user sync mechanism. This is a design decision to resolve during implementation.
