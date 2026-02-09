# Epic 400: Production Stability & UX Fixes

**Status:** Not started
**Priority:** P0/P1 — Critical production issues blocking all users
**Phase:** Production hotfix
**Source:** User testing feedback, Feb 8 2026

---

## Context

User testing uncovered a critical production issue: the deployed frontend is calling `api.onlysnow.com` (which doesn't exist) instead of the correct backend URL. This breaks the entire dashboard, chase page, and onboarding. Beyond the blocker, testers flagged four UX improvements and called out several things working well.

### What's Genuinely Great (preserve these)
- Onboarding copy reads like it was written by a skier, not a product manager
- Adaptive flow (kids age question, storm travel skip) is smart and well-executed
- The skier type reveal creates a personality-test moment — inherently shareable
- AI analysis text is the killer feature — specific dates, comparisons, actionable

---

## Bug: API Server Down (P0)

### Root Cause Analysis

The frontend API base URL is configured via `NEXT_PUBLIC_API_BASE_URL` in `apps/frontend/.env.local`. Currently set to `https://only-snow-web.vercel.app`.

**File:** `apps/frontend/src/lib/api-config.ts` (created in commit `099ae07`)
```typescript
function resolveApiBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (explicit) return explicit;
  if (process.env.NODE_ENV === 'development') return 'http://localhost:3000';
  return ''; // relative URLs in production
}
```

**The problem:** The `.env.local` file is not committed to git (correctly). But Vercel environment variables must be set separately in the Vercel dashboard for each project. If the env var is missing in production, the fallback is `''` (relative URLs), meaning the frontend calls `onlysnow.app/api/resorts` — but the API lives on a separate Vercel project (`only-snow-web`), not the frontend project.

**Affected endpoints (all broken):**
- `GET /api/resorts`
- `GET /api/chase/alerts`
- `GET /api/rankings/snow`
- `GET /api/regions`
- `POST /api/onboarding/recommendations`

### 400.1 — Fix production API URL

**Tasks:**
- [ ] Set `NEXT_PUBLIC_API_BASE_URL` in Vercel dashboard for frontend project
- [ ] Value should be the backend project's production URL (e.g., `https://only-snow-web.vercel.app`)
- [ ] Redeploy frontend after setting env var
- [ ] Verify all 5 endpoints return data in production
- [ ] Add env var to Vercel project README / deployment docs

**Verification:**
- Dashboard loads resort data (not stuck on spinner)
- Chase page shows regions
- Onboarding recommendations load

---

## UX Fix 1: Loading Timeouts (P1)

### Current State

**Zero timeout mechanisms exist.** All loading states use simple boolean flags:

| Page | Loading Text | Timeout | Fallback |
|------|-------------|---------|----------|
| `ApiDashboard.tsx` | "Loading your resorts..." | None | Infinite spinner |
| `ApiChasePage.tsx` | "Loading storm data..." | None | Infinite spinner |
| `onboarding/page.tsx` | "Analyzing resorts for you..." | None | Infinite spinner (has "Try again" on error) |

If the API is unreachable (like right now), users see a spinner forever.

### 400.2 — Add loading timeouts with fallback UI

**Tasks:**
- [ ] Create shared `useLoadingTimeout(ms)` hook that returns `{ isTimedOut: boolean }`
- [ ] Dashboard: After 10 seconds, show "Having trouble loading. Check your connection or try again." with retry button
- [ ] Chase page: Same 10-second timeout with retry
- [ ] Onboarding confirm: Already has error state — add 8-second timeout that triggers `setRecsError(true)`
- [ ] Add `AbortSignal.timeout(10000)` to all `fetch()` calls in `data-provider.ts`
- [ ] Show last-loaded data if available (cache in localStorage)

**Files to modify:**
- `apps/frontend/src/hooks/useLoadingTimeout.ts` (new)
- `apps/frontend/src/app/dashboard/ApiDashboard.tsx` — lines 68-77
- `apps/frontend/src/app/chase/ApiChasePage.tsx` — lines 80-89
- `apps/frontend/src/app/onboarding/page.tsx` — lines 137-187
- `apps/frontend/src/lib/data-provider.ts` — all fetch calls

**Verification:**
- Kill backend → dashboard shows error message within 10s (not infinite spinner)
- Retry button works when API comes back
- `pnpm typecheck` passes

---

## UX Fix 2: Kill Recommendations Preview Step (P1)

### Current State

The onboarding "confirm" step (`step === "confirm"`) calls `POST /api/onboarding/recommendations` to show personalized resort matches. In API mode, this fails whenever the backend is down, which is most of the time right now.

**File:** `apps/frontend/src/app/onboarding/page.tsx`
- Lines 137-187: `fetchRecommendations()` — calls API or uses mock data
- Lines 189-193: Triggers fetch when step changes to "confirm"
- Lines 700-776: Renders loading/success/error states

In mock mode, it works instantly (filters local resort data). In API mode, it's unreliable.

### 400.3 — Simplify onboarding completion

**Option A (recommended): Skip to dashboard immediately**
- After persona confirmation, save preferences and redirect to `/dashboard`
- Remove the "confirm" step entirely
- Dashboard itself will show the personalized view (it already does this)
- Faster onboarding, fewer failure points

**Option B: Keep preview but make it non-blocking**
- Show a summary card ("We found X resorts within Y hours of Z")
- Calculate locally from resort data (like mock mode already does)
- Don't call the API at all — just count matching resorts
- "Continue to Dashboard" button always visible, not gated on API response

**Tasks (Option A):**
- [ ] Remove `"confirm"` from step sequence
- [ ] After `"personaConfirm"` → save preferences → `router.push("/dashboard")`
- [ ] Remove `fetchRecommendations`, `loadingRecs`, `recsError`, `recommendations` state
- [ ] Remove confirm step rendering (lines 700-776)

**Tasks (Option B):**
- [ ] Replace API call with local resort count (reuse mock mode logic)
- [ ] Always show "Continue to Dashboard" button (not gated on loading)
- [ ] Remove API dependency from onboarding entirely

**Verification:**
- Complete onboarding with backend down → lands on dashboard without errors
- Preferences correctly saved to localStorage
- `pnpm typecheck` passes

---

## UX Fix 3: Desktop Layout (P2)

### Current State

Root layout constrains all content to `max-w-5xl` (1024px):

```tsx
// apps/frontend/src/app/layout.tsx line 32
<div className="mx-auto max-w-md md:max-w-2xl lg:max-w-5xl">
```

**On a 1920px monitor:** 1024px content + ~450px whitespace on each side.

No `xl:` (1280px) or `2xl:` (1536px) breakpoints are used anywhere in the codebase. All responsive styles stop at `lg:` (1024px).

### 400.4 — Widen desktop layout

**Tasks:**
- [ ] Change root layout max-width: `max-w-md md:max-w-2xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl`
- [ ] Update content padding: add `xl:px-10 2xl:px-12` to main content areas
- [ ] Dashboard: Consider 2-column layout on xl+ (map + resort table side by side)
- [ ] Chase page: `lg:grid-cols-3 xl:grid-cols-4` for region cards
- [ ] Notifications: Already uses `lg:grid-cols-2` — add `xl:grid-cols-3`
- [ ] Resort map: Increase height on large screens `xl:h-96`
- [ ] Test at 1440px, 1920px, and 2560px

**Files to modify:**
- `apps/frontend/src/app/layout.tsx` — line 32 (root constraint)
- All page components that use `lg:` padding/grid classes

**Verification:**
- Content fills more of the screen on 1440px+ monitors
- No horizontal scroll at any breakpoint
- Mobile layout unchanged
- `pnpm build` passes

---

## UX Fix 4: Strengthen Button Selected States (P2)

### Current State

All selection buttons use the same pattern:

```tsx
// Selected:
"border-blue-500 bg-blue-50 dark:bg-blue-900/30"

// Unselected:
"border-gray-200 dark:border-slate-600 hover:border-gray-300"
```

The feedback says `border-blue-500` is too subtle — it's a 2px blue border on a light blue background. On some monitors and in bright lighting, the difference between selected and unselected is hard to see.

### 400.5 — Improve selection affordance

**Tasks:**
- [ ] Selected state: Add `ring-2 ring-blue-500/30` for a glow effect around the border
- [ ] Selected state: Make background slightly stronger: `bg-blue-100 dark:bg-blue-900/40`
- [ ] Selected state: Add checkmark icon or filled radio indicator
- [ ] Consider adding `shadow-sm` to selected cards (like TimeToggle already does)
- [ ] Dark mode: Ensure selected state is equally visible (`ring-blue-400/30`)
- [ ] Test with color blindness simulation (blue-500 alone is not sufficient)

**Consistent pattern to adopt across all files:**
```tsx
// Selected (strengthened):
"border-blue-500 bg-blue-100 dark:bg-blue-900/40 ring-2 ring-blue-500/20 shadow-sm"

// Unselected (unchanged):
"border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500"
```

**Files to modify (all use identical pattern):**
- `apps/frontend/src/app/onboarding/page.tsx` — lines 400, 462, 490, 577, 672
- `apps/frontend/src/app/settings/page.tsx` — lines 261, 332, 443
- `apps/frontend/src/components/TimeToggle.tsx` — line 23

**Verification:**
- Selected buttons are immediately distinguishable from unselected
- Works in both light and dark mode
- Visible on low-contrast monitors
- `pnpm build` passes

---

## Story Priority & Sequencing

| Story | Priority | Effort | Blocked By |
|-------|----------|--------|------------|
| **400.1** Fix production API URL | P0 | 15 min | Nothing (env var change) |
| **400.2** Loading timeouts | P1 | 2-3 hours | Nothing |
| **400.3** Kill recommendations preview | P1 | 1-2 hours | Nothing |
| **400.4** Desktop layout | P2 | 3-4 hours | Nothing |
| **400.5** Button selected states | P2 | 1-2 hours | Nothing |

**Total estimated effort:** 1-2 days

**Deploy order:**
1. 400.1 first (unblocks everything)
2. 400.2 + 400.3 together (loading resilience)
3. 400.4 + 400.5 together (visual polish)

---

## Relationship to Existing Epics

- **Epic 108** (Error Handling, Loading States & Observability) — 400.2 is a focused subset of 108.2 and 108.3. Epic 108 covers the full production-readiness story; 400.2 is the minimum viable fix.
- **Epic 005** (Polish & Refinement) — 400.4 and 400.5 overlap with polish goals. Epic 005 is broader; these are specific, scoped fixes.
- **Epic 001** (Responsive Layout) — 400.4 extends the responsive layout to xl/2xl breakpoints.

---

## Verification (Full Epic)

- [ ] Dashboard loads on production (not stuck on spinner)
- [ ] All API endpoints respond in production
- [ ] Loading timeout fires within 10s on API failure
- [ ] Onboarding completes without API dependency
- [ ] Desktop layout uses more screen width on 1440px+ monitors
- [ ] Selected buttons are clearly distinguishable from unselected
- [ ] `pnpm build` and `pnpm typecheck` pass
- [ ] No regressions on mobile layout
