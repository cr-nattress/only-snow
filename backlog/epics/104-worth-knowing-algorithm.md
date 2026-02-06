# Epic 104: Worth Knowing Algorithm

**Status:** Not started
**Priority:** High — key differentiator vs. OpenSnow ("the blind spot problem")
**Phase:** B (Core product)

## Context

The "Worth Knowing" section surfaces non-pass resorts that are meaningfully outperforming the user's pass resorts. The UI exists (`WorthKnowing.tsx`) and renders beautifully in mock scenarios. But the logic to detect these opportunities doesn't exist — the entries are hardcoded per scenario.

The product spec defines clear rules: show when a non-followed resort has >4" more snow than the user's best, is within drive radius, and include pass status + walk-up price.

## Goal

Worth Knowing entries are dynamically generated from real data, appearing only when genuinely relevant.

## User Stories

### 104.1 — Define Worth Knowing scoring rules
- Create `apps/frontend/src/lib/worth-knowing.ts` (or backend route)
- Inputs: user's pass type, user's resort list with forecasts, all resorts in region
- Rules from product spec:
  - Non-pass resort has ≥4" more snow (selected time window) than user's best pass resort
  - Resort is within user's drive radius
  - Resort has ≥50% more forecasted snow than user's best
- Output: ranked list of `WorthKnowingEntry` with reason text

### 104.2 — Generate contextual reason text
- Templates based on trigger:
  - Snow differential: "{resort} is getting {diff}" more than your best pass resort"
  - On-route: "{resort} is on your way to {destination}"
  - Value: "{resort} at ${price} walk-up — {ratio}x the snow of {user_best}"
- Include walk-up price when available (backend doesn't have this yet — use placeholder)

### 104.3 — Backend route for Worth Knowing (optional)
- Could be computed client-side from resort list + user preferences
- Or new `GET /api/worth-knowing?passType=epic&lat=...&lng=...&radius=...` endpoint
- Benefit of server-side: access to all resorts efficiently, cacheable

### 104.4 — Conditional display
- Hide Worth Knowing section entirely when no entries qualify
- Show at most 3 entries
- Show section header "WORTH KNOWING" only when visible

## Verification

- [ ] With real data: when a non-pass resort has significantly more snow, it appears
- [ ] With real data: when all resorts are similar, section is hidden
- [ ] Reason text is contextual and accurate
- [ ] Entries respect user's drive radius
- [ ] Works in both mock and API modes
- [ ] `pnpm build` and `pnpm typecheck` pass

## Dependencies

- Epic 100 (frontend-backend connection)
- Epic 101 (user preferences — need pass type and drive radius)
- Backend must have conditions data for non-pass resorts in the region
