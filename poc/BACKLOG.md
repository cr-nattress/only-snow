# POC Backlog

Organized by epic. Each epic maps to a POC directory and represents a testable UI surface. Stories within each epic are ordered by priority. Measurement criteria are defined per-epic so each POC can be evaluated independently.

---

## Epic 1: Onboarding — "3 Questions to Your Ski Life"

**POC Directory**: `01-onboarding/`
**Goal**: Validate that a 30-second setup flow captures enough information to power the entire product.
**Source**: [PRODUCT_SPEC.md](../docs/PRODUCT_SPEC.md) — "The Setup (30 seconds)"

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 1.1 | Location input — autocomplete for city/zip with map confirmation | P0 | Must feel fast, not like a form |
| 1.2 | Pass selection — Epic / Ikon / Indy / Multi / None with visual pass cards | P0 | Multi-pass needs sub-selection UI |
| 1.3 | Drive radius — slider or button group (1hr / 2hr / 3hr) | P0 | Show map radius overlay as user selects |
| 1.4 | Chase willingness — "Will you travel for a big storm?" (Anywhere / Within driving / No) | P1 | Only shown if pass selection is not "None" |
| 1.5 | Confirmation screen — "Here's what we found" showing auto-detected resorts on a map | P1 | User can add/remove before proceeding |
| 1.6 | Transition animation — setup to main screen with personalized results loading | P2 | Sets the tone for the product |

### Measurement

| Metric | Target |
|--------|--------|
| Time to complete setup | < 30 seconds |
| Questions asked | Exactly 3 (+ 1 optional chase question) |
| User understands what resorts were auto-detected | Yes / No (user test) |
| Setup feels lightweight, not like a registration form | Qualitative (user test) |

---

## Epic 2: Main Decision Screen — "One Screen, Three Sections"

**POC Directory**: `02-main-screen/`
**Goal**: Validate the core product surface — Your Resorts + Worth Knowing + Storm Tracker on a single scrollable screen. This is the most critical POC.
**Source**: [PRODUCT_SPEC.md](../docs/PRODUCT_SPEC.md) — "The Single Screen", [CORE_DATA_ANALYSIS.md](../research/CORE_DATA_ANALYSIS.md), [OPENSNOW_VS_US.md](../research/OPENSNOW_VS_US.md)

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 2.1 | Your Resorts table — ranked by snow forecast, columns: 24hr / Next 5d / Base / Open / Drive time | P0 | Dynamic ranking — order changes with data. Reference: product spec "storm day" example |
| 2.2 | Three data states — dry day (groomed, no snow), storm day (powder alert), incoming storm (forecast ranges) | P0 | Each state must feel distinct without layout changes |
| 2.3 | One-line recommendation — "Best pick: Breckenridge (most terrain open)" below the table | P0 | Context-aware: changes reason based on conditions |
| 2.4 | Worth Knowing section — appears/disappears based on data. Shows non-followed resort with pass status, price, drive time, and 1-2 line explanation | P0 | Must feel like a helpful nudge, not an ad. Reference: CORE_DATA_ANALYSIS "Worth Knowing" triggers |
| 2.5 | Storm Tracker bar — persistent bottom bar with 4 states: quiet (grey), moderate (yellow), significant (orange), chase-worthy (red) | P0 | One line of text + color. Tappable when active |
| 2.6 | Header — "YOUR RESORTS - Epic - From Denver" with pass icon and location | P1 | Establishes context immediately |
| 2.7 | Empty Worth Knowing state — section cleanly absent, no placeholder, no "nothing to show" | P1 | Most days this section should not exist |
| 2.8 | Multiple Worth Knowing resorts (max 2) — stacked with distinct explanations | P2 | Rare case but needs to work |

### Data Scenarios to Build

| Scenario | Source Example |
|----------|---------------|
| Denver Epic, dry weekend | [DENVER_EPIC_WEEKENDER.md](../examples/DENVER_EPIC_WEEKENDER.md) — "This Weekend" section |
| Denver Epic, storm incoming | [DENVER_EPIC_WEEKENDER.md](../examples/DENVER_EPIC_WEEKENDER.md) — "Next Weekend" section |
| Avon Epic, powder day + road trip alert | [AVON_ROAD_TRIP.md](../examples/AVON_ROAD_TRIP.md) — storm delivered state |
| PA Ikon, quiet week + chase brewing | [PA_CHASE_TRIP.md](../examples/PA_CHASE_TRIP.md) — normal week |
| Low snowpack / honest context | Denver example — "55% of normal, record low" |

### Measurement

| Metric | Target |
|--------|--------|
| Time to answer "where should I ski this weekend?" | < 5 seconds of looking at the screen |
| User can identify best resort without reading every cell | Yes (eye-tracking or user test) |
| Worth Knowing feels helpful, not noisy | Qualitative |
| Storm Tracker is noticed but not distracting on quiet days | Qualitative |
| Screen works on iPhone SE (smallest common screen) | Yes — no horizontal scroll, all text readable |

---

## Epic 3: Resort Detail View — "Tap for the Data"

**POC Directory**: `03-resort-detail/`
**Goal**: Validate the drill-down experience when a user taps a resort from the main screen. This is where power users go for detailed forecasts.
**Source**: [PRODUCT_SPEC.md](../docs/PRODUCT_SPEC.md) — "Tap a resort -> Detail view", [CORE_DATA_ANALYSIS.md](../research/CORE_DATA_ANALYSIS.md) — Tier 1/2/3 data hierarchy

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 3.1 | 10-day snow forecast bar chart — past 5 days + next 10 days in a single visual | P0 | Similar to OpenSnow's 15-day chart but with our ranking context |
| 3.2 | Daily breakdown — day-by-day forecast: snow, temp high/low, wind, conditions icon | P0 | Scannable rows, not a dense table |
| 3.3 | Resort status bar — "Open 60% - 166 of 277 trails - 20 of 33 lifts" in one compact row | P0 | The quick status check |
| 3.4 | Expert take — 1 paragraph human interpretation with author attribution | P1 | "Joel Gratz, OpenSnow" — the trust signal |
| 3.5 | Webcam preview — 1-2 images, tap to expand | P1 | Trust verification — "what does it actually look like?" |
| 3.6 | Context banner — "Why this resort is #1 today: Got 10" overnight, Back Bowls loaded" | P1 | Carries context from the main screen ranking |
| 3.7 | Worth Knowing detail — if tapped from Worth Knowing, show "Why we're showing this" header with differential explanation | P1 | Reference: product spec "Tap Worth Knowing resort" |
| 3.8 | Add to My Resorts CTA — for Worth Knowing resorts, offer to add to saved list | P2 | Smooth transition from discovery to tracking |

### Measurement

| Metric | Target |
|--------|--------|
| Answers "what's the detailed forecast?" in < 10 seconds | Yes |
| Power user (OpenSnow user) finds the data they expect | Yes (user test with OpenSnow users) |
| Casual user is not overwhelmed | Yes — Tier 1 data visible without scrolling |
| Back navigation to main screen preserves scroll position | Yes |

---

## Epic 4: Storm Chase Mode — "National Radar to Trip Plan"

**POC Directory**: `04-storm-chase/`
**Goal**: Validate the full chase flow: national storm overview → regional zoom → trip builder with flights/hotels/cost. Highest revenue potential.
**Source**: [DESTINATION_TRAVELER.md](../research/DESTINATION_TRAVELER.md), [PA_CHASE_TRIP.md](../examples/PA_CHASE_TRIP.md), [AVON_ROAD_TRIP.md](../examples/AVON_ROAD_TRIP.md)

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 4.1 | National Storm Radar — map or list of US ski regions with color-coded storm severity (quiet/moderate/significant/chase-worthy) | P0 | 11 regions from DESTINATION_TRAVELER. Most are grey/quiet. 1-2 lit up |
| 4.2 | Region Zoom — tap a region to see resort-level forecast ranking with pass compatibility | P0 | Reference: "Step 2: Region Zoom" in DESTINATION_TRAVELER |
| 4.3 | Trip Builder — flights + lodging + rental car + lift tickets + ski plan + total cost estimate | P0 | The money screen. Reference: PA_CHASE_TRIP trip plan section |
| 4.4 | Escalating alert timeline — show how the same storm evolves from "heads up" (7 days) to "book now" (4 days) to "storm arriving" (1 day) | P1 | Reference: DESTINATION_TRAVELER "The escalation timeline" |
| 4.5 | Road Trip Alert — for local users, show when a distant pass resort has 2x the snow + driving options (drive tonight / early AM / ski local today + drive tonight) | P1 | Reference: AVON_ROAD_TRIP — the CB 20" scenario |
| 4.6 | Flight price badge — real-time-ish price shown inline with storm alert. "$289 RT" right in the storm bar | P1 | Creates urgency + actionability in one glance |
| 4.7 | Road conditions widget — for road trip alerts, show pass status (open/chain law/closed) and route options | P2 | Reference: CORE_DATA_ANALYSIS road conditions section |
| 4.8 | Decision deadline callout — "Book by Saturday. Prices jump Sunday when forecast firms up." | P2 | Creates appropriate urgency without being pushy |

### Data Scenarios to Build

| Scenario | Source |
|----------|--------|
| PA → Telluride chase trip | [PA_CHASE_TRIP.md](../examples/PA_CHASE_TRIP.md) |
| Avon → Crested Butte road trip | [AVON_ROAD_TRIP.md](../examples/AVON_ROAD_TRIP.md) |
| Quiet national map (no storms) | Baseline state |
| Multi-region event (CO + UT both active) | Derived from DESTINATION_TRAVELER region table |

### Measurement

| Metric | Target |
|--------|--------|
| User understands "is anything worth chasing?" in < 3 seconds | Yes — color coding on national view |
| Trip plan provides enough info to actually book | Yes — flights, lodging, car, lift tix, total cost |
| User feels urgency to act without feeling manipulated | Qualitative — "book today" with reason, not countdown timers |
| Road trip alert clearly communicates the trade-off (local good vs. distant great) | Qualitative |

---

## Epic 5: Notification Design — "The Right Push at the Right Time"

**POC Directory**: `05-notifications/`
**Goal**: Design and validate notification content, timing, and hierarchy. The product's long-term engagement depends on notifications being valuable, not annoying.
**Source**: [PRODUCT_SPEC.md](../docs/PRODUCT_SPEC.md) — "Notification Strategy"

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 5.1 | Powder alert notification — "Vail got 8" overnight" with snow emoji, resort name, tap to open | P0 | Morning push, 6-7 AM |
| 5.2 | Storm incoming notification — "9-12" hitting Vail Tuesday" | P0 | 3-5 days out |
| 5.3 | Weekend outlook notification — "This weekend: Breck is your best bet" (Thursday evening) | P0 | The weekly ritual notification |
| 5.4 | Chase alert notification — "Telluride: 18-24" next week. EWR→MTJ $289" | P1 | Destination traveler trigger |
| 5.5 | Worth Knowing notification — "Loveland got 6" — 2x your resorts, $89" | P1 | Only when differential is large |
| 5.6 | Price drop notification — "MTJ flights dropped to $249" for active chase | P2 | Only if user has viewed a chase trip |
| 5.7 | Notification settings preview — show which notifications are on/off with example previews | P2 | In-app settings screen |

### Rules to Validate

- Never send on a dry, uneventful day
- Every notification must be actionable
- Chase alerts escalate over time (heads up → book now)
- No more than 2 notifications per day, ever
- Weekend outlook: exactly once per week (Thursday PM)

### Measurement

| Metric | Target |
|--------|--------|
| Each notification answers "should I do something?" | Yes — actionable or don't send |
| User can distinguish urgency level at a glance | Yes — emoji + color coding |
| Notification leads to app open > 50% of the time | Benchmark to measure |
| User does not mute notifications after 2 weeks | Retention signal |

---

## Epic 6: Time Toggle — "Shift the Window"

**POC Directory**: `06-time-toggle/`
**Goal**: Validate the time-window selector that re-ranks resorts based on different planning horizons.
**Source**: [PRODUCT_SPEC.md](../docs/PRODUCT_SPEC.md) — "Swipe between time windows"

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 6.1 | Four time modes — Today / This Weekend / Next 5 Days / Next 10 Days as tab bar or segmented control | P0 | Above the resort table |
| 6.2 | Dynamic re-ranking — resorts reorder with animation when time window changes | P0 | The "aha" moment — Vail is #3 today but #1 next week |
| 6.3 | Column adaptation — "Today" shows 24hr snowfall, "Next 5 Days" shows forecast range | P1 | Same table structure, different data emphasis |
| 6.4 | Recommendation updates — "Best pick" line changes per time window | P1 | "Today: Breck. This weekend: Vail. Next week: Wait for the storm" |
| 6.5 | Weekend mode intelligence — for "This Weekend", show Sat + Sun separately if forecasts differ | P2 | "Saturday: groomer day. Sunday: post-storm powder" |

### Measurement

| Metric | Target |
|--------|--------|
| User discovers time toggle without instruction | Yes (first-use test) |
| Re-ranking animation communicates "the order changed" clearly | Yes |
| User understands why resorts reordered | Yes — column data changes explain it |
| Switching time windows feels instant (< 200ms) | Yes |

---

## Epic 7: Persona-Adaptive Views — "Same Data, Different Lens"

**POC Directory**: `07-persona-modes/`
**Goal**: Validate that the same core screen can adapt to different skier types by changing recommendations, data emphasis, and language.
**Source**: [SKIER_PERSONAS.md](../research/SKIER_PERSONAS.md), [CORE_DATA_ANALYSIS.md](../research/CORE_DATA_ANALYSIS.md) — agent modes (hunter/sherpa/scout)

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 7.1 | Powder Hunter mode — recommendation emphasizes 24hr snow totals, bowl openings, backcountry gates, "leave by 6:30 AM" | P1 | Reference: SKIER_PERSONAS "Powder Hunter" + product spec hunter agent |
| 7.2 | Family Planner mode — recommendation emphasizes grooming, parking, ski school, kid-friendly terrain, "Best for families: Beaver Creek" | P1 | Reference: SKIER_PERSONAS "Chief Family Officer" + sherpa agent |
| 7.3 | Weekend Warrior mode — recommendation emphasizes value, night skiing, "Keystone: day + night for one drive" | P1 | Reference: SKIER_PERSONAS + scout agent |
| 7.4 | Destination Traveler mode — dual scale: local table + national storm tracker always visible | P1 | Reference: DESTINATION_TRAVELER "Two Modes, One User" |
| 7.5 | Persona detection or selection — implicit (behavioral over time) vs. explicit (pick your mode in settings) | P2 | POC can test explicit selection; implicit is a Phase 5 feature |
| 7.6 | Language adaptation — "Snow Groomed" for experts vs. "Smooth, packed snow — easy to ski on" for beginners | P2 | Reference: CORE_DATA_ANALYSIS "beginner translation" gap |

### Measurement

| Metric | Target |
|--------|--------|
| Powder Hunter sees storm/snow data first | Yes — 24hr totals prominent, grooming de-emphasized |
| Family Planner sees logistics first | Yes — parking, ski school, grooming prominent |
| Same underlying data, visually distinct emphasis | Yes — not totally different screens, just different weights |
| User self-identifies with their mode | Qualitative |

---

## Epic 8: Settings & Preferences — "Your Ski Profile"

**POC Directory**: `08-settings/`
**Goal**: Validate the settings surface where users manage their profile, resorts, and notification preferences.
**Source**: [PRODUCT_SPEC.md](../docs/PRODUCT_SPEC.md) — "Settings", [DESTINATION_TRAVELER.md](../research/DESTINATION_TRAVELER.md) — "User settings for destination travelers"

### Stories

| ID | Story | Priority | Notes |
|----|-------|----------|-------|
| 8.1 | My Resorts management — add/remove/reorder saved resorts with pass badges | P1 | Drag-to-reorder, swipe-to-remove |
| 8.2 | Home location + drive radius — map view showing your radius with resort pins | P1 | Visual confirmation of what's "in range" |
| 8.3 | Pass management — switch pass, add second pass (Multi mode) | P1 | Pass changes should immediately update resort filtering |
| 8.4 | Chase preferences — enable/disable, budget, trip length, alert threshold, preferred airports | P1 | Only shown if user said "yes" to travel in onboarding |
| 8.5 | Notification preferences — toggle each notification type with preview of what it looks like | P2 | Reference: Epic 5 notification types |
| 8.6 | Home airports — for chase mode, set departure airports (multi-select) | P2 | Auto-suggested from home location |

### Measurement

| Metric | Target |
|--------|--------|
| User can update their pass in < 10 seconds | Yes |
| Resort management feels like a playlist, not a form | Qualitative |
| Chase preferences are hidden from non-travelers | Yes — clean for simple users |
| Changes propagate immediately to main screen | Yes |

---

## POC Priority Order

Recommended build sequence based on value and dependency:

| Order | Epic | Rationale |
|-------|------|-----------|
| 1st | **Epic 2: Main Decision Screen** | The core product surface. Everything else depends on this working. |
| 2nd | **Epic 1: Onboarding** | You need setup to feed the main screen. Also validates the 3-question premise. |
| 3rd | **Epic 6: Time Toggle** | Small addition to the main screen that dramatically increases utility. Can be built as an extension of Epic 2. |
| 4th | **Epic 3: Resort Detail** | The drill-down from the main screen. Validates the data hierarchy (Tier 1/2/3). |
| 5th | **Epic 4: Storm Chase** | Highest revenue potential. Requires the most UI surfaces (national → regional → trip plan). |
| 6th | **Epic 5: Notifications** | Static designs (no backend needed) but critical for long-term engagement strategy. |
| 7th | **Epic 7: Persona Modes** | Validates adaptive UI. Requires main screen (Epic 2) to be solid first. |
| 8th | **Epic 8: Settings** | Standard settings UI. Lowest risk, build last. |

---

## Cross-Cutting Concerns

These apply to every POC:

| Concern | Approach |
|---------|----------|
| **Mock Data** | Each POC includes JSON fixtures based on the examples in `examples/`. No live APIs. |
| **Mobile-First** | Design at 375px width (iPhone SE), test up to 768px (tablet). |
| **Dark Mode** | Not in POC scope — light mode only for now. |
| **Accessibility** | Basic a11y: readable contrast, semantic HTML, touch targets > 44px. |
| **Animation** | Subtle transitions for resort re-ranking and section appear/disappear. Nothing flashy. |
| **Color System** | Storm severity: grey (quiet), yellow (moderate), orange (significant), red (chase-worthy). Snow indicator: blue. Pass badge: green (on pass) / grey (not on pass). |
