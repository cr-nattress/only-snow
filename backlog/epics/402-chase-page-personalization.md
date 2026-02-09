# Epic 402: Chase Page — Personalized Filtering & Pass Awareness

**Status:** Complete
**Priority:** P1 — Core UX improvement for primary user flow
**Phase:** Production UX
**Source:** User testing feedback, Feb 8 2026

---

## Context

The chase page displayed **all ~54 regions** in a flat list. A Denver Epic pass holder saw Tennessee (0"), Ohio (0"), Missouri (0"), and Rhode Island (0") alongside Colorado storm alerts — pure noise. The page needed to show ~10-15 relevant cards, personalized by user's pass type and location, with a "show all" escape hatch.

### Root Problems
1. **No filtering**: 0" snowfall regions shown alongside significant storms
2. **No pass awareness**: An Epic pass holder sees Ikon-only regions with equal weight
3. **"Within Reach" too generous**: 10-hour drive radius included most of the country
4. **No relevance scoring**: Regions sorted only by snowfall, ignoring proximity and pass match

---

## Story 402.1: Add passTypes to RegionSummary (Backend)

**Status:** Complete

Add `passTypes: string[]` to the `RegionSummary` shared type and collect unique pass types from each region's resorts in the `/api/regions` route.

### Files Changed
- `packages/types/src/index.ts` — Added `passTypes: string[]` to `RegionSummary`
- `apps/web/src/app/api/regions/route.ts` — Collect unique `passType` values from `regionResorts`

### Acceptance Criteria
- [x] `RegionSummary` includes `passTypes: string[]`
- [x] Backend populates from resort data already loaded in the region loop
- [x] No new database queries needed

---

## Story 402.2: Extend ChaseRegion Type (Frontend)

**Status:** Complete

Add pass and snowfall fields to `ChaseRegion` for filtering and display.

### Files Changed
- `apps/frontend/src/data/types.ts` — Added `passTypes: string[]`, `hasUserPass: boolean`, `snowfallNumeric: number`
- `apps/frontend/src/data/scenarios.ts` — Mock chase regions updated with new required fields

### Acceptance Criteria
- [x] `ChaseRegion` has `passTypes`, `hasUserPass`, `snowfallNumeric`
- [x] Mock data in `scenarios.ts` includes new fields with realistic values
- [x] No breaking changes to existing chase page consumers

---

## Story 402.3: Pass-Aware Adapter (Frontend)

**Status:** Complete

Update `toChaseRegions()` to accept optional `userPassType` and compute pass matching.

### Files Changed
- `apps/frontend/src/lib/adapters.ts` — `toChaseRegions()` accepts `userPassType`, added `passMatchesRegion()` helper

### Pass Matching Logic
| User Pass | Matches Region With |
|-----------|-------------------|
| `'epic'` | `'epic'` or `'both'` |
| `'ikon'` | `'ikon'` or `'both'` |
| `'indy'` | `'indy'` or `'both'` |
| `'multi'` | Any non-`'independent'` pass |
| `'none'` | Nothing (no bonus applied) |

### Acceptance Criteria
- [x] `hasUserPass` correctly computed for all pass type combinations
- [x] `snowfallNumeric` populated from `totalSnowfall5Day`
- [x] `passTypes` passed through from `RegionSummary`

---

## Story 402.4: Smart Filtering Engine (Frontend)

**Status:** Complete

Replace flat list with a relevance-scored, capped, tiered display system.

### Files Changed
- `apps/frontend/src/lib/data-provider.ts` — New filtering engine, scoring function, tightened thresholds

### Key Constants
| Constant | Old | New | Rationale |
|----------|-----|-----|-----------|
| `WITHIN_REACH_MAX_MINUTES` | 600 (10h) | 360 (6h) | 10h included most of the country |
| `WORTH_THE_TRIP_MIN_SNOWFALL` | 6 | 6 | Unchanged — 6" minimum for Tier 2 |
| `MAX_VISIBLE_REGIONS` | — | 15 | Cap visible cards |
| `MIN_SNOWFALL_VISIBLE` | — | 1 | Hide 0" regions by default |

### Relevance Scoring Formula
```
score = snowfallNumeric * 2       // Snow is king
      + (hasUserPass ? 20 : 0)    // Big bonus for user's pass
      + max(0, 10 - driveHours)   // Proximity bonus (up to 10 pts)
      + chaseScore                 // Existing chase score as tiebreaker
```

### Filtering Behavior
- **With drive data (tiered):**
  - Tier 1 "Within Reach" (≤6h): Filter out 0" unless user's pass, sort by score
  - Tier 2 "Worth The Trip" (>6h, ≥6"): Sort pass-holders first, then by snowfall
  - Hidden: 1-5" far regions behind "show all"
- **Without drive data (flat):**
  - Remove 0" regions, score all remaining, cap at 15 visible
  - Remainder available via "show all"

### New Return Shape
```typescript
interface ChasePageData {
  withinReach: ChaseRegion[];
  worthTheTrip: ChaseRegion[];
  regions: ChaseRegion[];         // visible regions (filtered + ranked)
  hiddenRegions: ChaseRegion[];   // behind "show all" toggle
  hiddenQuietCount: number;       // count of 0" regions hidden
  totalRegionCount: number;       // total before filtering
}
```

### Acceptance Criteria
- [x] Denver Epic user sees ~10-15 cards, Colorado/Utah prominent
- [x] 0" regions hidden by default
- [x] Pass-bearing regions ranked higher
- [x] Nearby regions preferred over distant ones
- [x] No-location user gets flat list capped at 15

---

## Story 402.5: Chase Page UI — Show/Hide Toggle & Pass Badges

**Status:** Complete

Update `ApiChasePage` with personalized display, pass badges, and expandable hidden regions.

### Files Changed
- `apps/frontend/src/app/chase/ApiChasePage.tsx` — Full UI update

### UI Changes
- **"YOUR PASS" badge**: Green badge on `RegionCard` when `hasUserPass` is true
- **Subtitle**: "Showing X of Y regions" (e.g. "Showing 12 of 54 regions")
- **"Show all" button**: Below visible cards — "Show all X regions (Y with no snow hidden)"
- **Expanded section**: Hidden regions rendered in "MORE REGIONS" section when toggled
- **Empty state**: "No significant storms in the forecast" when flat list filters to 0

### Acceptance Criteria
- [x] Pass badge visible on matching regions
- [x] Show/hide toggle works
- [x] Hidden regions render correctly when expanded
- [x] `chaseWillingness='no'` still shows disabled message
- [x] Region detail view still loads when clicking a card

---

## Verification

- [x] `pnpm typecheck` passes (17/17 tasks)
- [x] All mock data updated with new required fields
- [x] No breaking changes to region detail view or mock chase page
