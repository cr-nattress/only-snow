# Epic 302: Multi-Pass Support

**Status:** Not started
**Priority:** Low — edge case but mentioned in product spec
**Phase:** D (Revenue & growth)

## Context

The onboarding flow has a "multi" pass option. Some skiers hold both Epic and Ikon passes (or Epic + Indy, etc.). The backend `users.passType` is a single string field. The product currently filters resorts by a single pass type.

## Goal

Users with multiple passes see resorts from all their passes, with clear pass labeling.

## User Stories

### 302.1 — Multi-pass data model
- Change `passType` from single string to array or comma-separated list
- Update backend `users` table or use `preferences` JSONB
- Update `GET /api/resorts` to filter by multiple pass types
- Update frontend onboarding to allow multi-select

### 302.2 — Pass badge in resort rows
- When user has multiple passes, show which pass each resort is on
- Color-coded badges: green (Epic), orange (Ikon), blue (Indy), gray (Independent)
- Already partially implemented in resort rows (pass badge exists)

### 302.3 — Pass-aware recommendations
- "Best on Epic: Vail. Best on Ikon: Copper. Best overall: Copper (2x the snow)."
- Worth Knowing: "Loveland isn't on either of your passes, but it's getting 3x the snow for $89"

### 302.4 — Pass comparison view (stretch)
- Side-by-side: "Your Epic resorts vs. Your Ikon resorts this weekend"
- Helps users decide which pass to use on a given day

## Verification

- [ ] User with Epic + Ikon sees resorts from both passes
- [ ] Each resort row shows correct pass badge
- [ ] Recommendations reference the correct pass for each resort
- [ ] Single-pass users unaffected
- [ ] `pnpm build` and `pnpm typecheck` pass

## Dependencies

- Epic 100 (frontend-backend connection)
- Epic 101 (user preferences — pass type storage)
