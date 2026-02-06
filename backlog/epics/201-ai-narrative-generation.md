# Epic 201: AI Narrative Generation

**Status:** Not started
**Priority:** Medium — differentiator but not blocking MVP
**Phase:** C (Intelligence layer)

## Context

The frontend has "AI Analysis" sections on the dashboard and resort detail pages that display long-form contextual commentary (e.g., "The NW flow pattern is the setup you want in Colorado..."). These are currently hardcoded strings in the mock scenarios. The backend Terraform already provisions an `ANTHROPIC_API_KEY` variable but no Claude API calls exist.

## Goal

AI-generated, context-aware narratives that help users interpret weather data and make ski decisions. Cached and refreshed with forecast updates.

## User Stories

### 201.1 — Narrative generation service
- Create `packages/narrative/` or add to `apps/web/src/lib/narrative.ts`
- Input: resort conditions, forecasts, regional context, user persona
- Output: 2-3 paragraph analysis in natural language
- Use Claude API (Anthropic SDK)
- System prompt encodes OnlySnow's voice: direct, actionable, snow-focused

### 201.2 — Dashboard narrative
- Generated per region/user context, not per resort
- Answers: "What's the story this week?"
- Examples from spec:
  - "NW flow arriving Tuesday. CB and Telluride in the bullseye. Your I-70 resorts get 4-6" but the real action is south."
  - "High pressure dome. No storms in 10-day window. Focus on groomed runs and spring conditions."
- Refresh with forecast pipeline (every 6h)

### 201.3 — Resort detail narrative
- Generated per resort
- Answers: "What should I know about this mountain right now?"
- Incorporates: recent snowfall, forecast, snowpack vs. average, avalanche rating, surface conditions
- Refresh with conditions pipeline (every 2h)

### 201.4 — Cache narratives
- Store generated narratives in Redis or database
- TTL: Match pipeline refresh cycle (6h for forecast, 2h for conditions)
- Don't regenerate if underlying data hasn't changed significantly

### 201.5 — Persona-aware tone (when Epic 301 is complete)
- Adjust language based on user persona:
  - Powder Hunter: technical, stoked, snow-focused
  - Family Planner: practical, safety-conscious, amenity-aware
  - Beginner: simple, encouraging, weather-focused
- Persona passed as parameter to generation prompt

## Verification

- [ ] Dashboard shows AI-generated analysis based on current conditions
- [ ] Resort detail shows resort-specific AI narrative
- [ ] Narrative updates when forecast data refreshes
- [ ] Cached narratives don't cause redundant API calls
- [ ] Fallback to "Analysis unavailable" if Claude API fails
- [ ] `pnpm build` and `pnpm typecheck` pass

## Notes

- Claude API cost: ~$0.01–0.03 per narrative generation
- 50 resorts × 4 refreshes/day = 200 calls = ~$2–6/day
- Regional narratives (13 regions × 4/day) = 52 calls = ~$0.50–1.50/day
- Total: ~$3–8/day during ski season
- Consider using Haiku for cost optimization on high-frequency resort narratives
