# Epic 300: Push Notifications

**Status:** Not started
**Priority:** Medium — "the app comes to you" is a core product principle
**Phase:** C (Intelligence layer)

## Context

The product spec defines notifications as central to the experience: "Every notification must be actionable." The frontend has a complete notification showcase page (`/notifications`) with 6 notification types designed and styled. But no notification delivery infrastructure exists — it's a design mockup only.

## Notification Types (from product spec)

| Type | Trigger | Example | Frequency |
|------|---------|---------|-----------|
| Powder Alert | 24hr snowfall > 6" | "Vail got 8" overnight" | Real-time |
| Storm Incoming | 5-day forecast > 6" | "9-12" hitting Vail Tuesday" | Daily |
| Worth Knowing | Non-pass resort outperforms | "Loveland got 6" — 2x yours, $89" | Real-time |
| Weekend Outlook | Thursday evening | "This weekend: Breck is your best bet" | Weekly |
| Chase Alert | Major storm at distant resort | "Telluride: 18-24" next week. $289 RT" | 5-7 days out |
| Price Drop | Flight/lodging price decrease | "MTJ flights dropped to $249" | Real-time |

## User Stories

### 300.1 — Notification preferences model
- Add notification preferences to user settings:
  - Toggle per notification type (6 toggles)
  - Quiet hours (e.g., no alerts before 6 AM)
  - Chase alerts enabled/disabled (separate toggle)
- Store in `users.preferences` JSONB field
- Frontend settings page already has toggle UI (Epic 003)

### 300.2 — Push notification infrastructure
- Options:
  - **Web Push API** (free, browser-native, no app store needed)
  - **Firebase Cloud Messaging** (free tier, works cross-platform)
  - **OneSignal** (free tier: 10K subscribers)
- Register service worker for push subscriptions
- Store push tokens in database (new `push_subscriptions` table)

### 300.3 — Notification generation engine
- Background job (Cloud Function or cron) that:
  1. Checks forecast/conditions data after each pipeline run
  2. For each user with notifications enabled:
     - Evaluate trigger rules against their preferences and resort list
     - Generate notification payload (title, body, action URL)
     - Queue for delivery
  3. Batch deliver via push service

### 300.4 — Powder Alert notifications
- Trigger: pipeline run shows resort with 24hr snowfall > 6"
- Filter: only for resorts in user's pass + radius
- Timing: send by 6:30 AM local time
- Action: opens resort detail page

### 300.5 — Storm Incoming notifications
- Trigger: 5-day forecast total > 6" for any user resort
- Filter: user's pass resorts + drive radius
- Timing: daily evening (7 PM) when storm is approaching
- Action: opens dashboard with affected resort highlighted

### 300.6 — Weekend Outlook notification
- Trigger: Thursday 6 PM every week during ski season
- Content: "This weekend: {best_resort} is your best bet — {forecast}"
- Filter: user's pass resorts ranked by weekend forecast
- Action: opens dashboard

### 300.7 — Chase Alert notification
- Trigger: regional 7-day forecast > 18" at a pass-compatible resort
- Escalation pattern (from product spec):
  - 7-10 days out: "Heads up" (advisory)
  - 5-7 days out: "Storm confirmed" (planning)
  - 3-5 days out: "Decision time" (action)
  - 1-2 days out: "Last call" (urgency)
- Include flight price when available (Epic 202)
- Action: opens chase trip planner

## Verification

- [ ] User enables powder alerts → receives push when 6"+ falls at their resort
- [ ] User disables storm notifications → doesn't receive storm alerts
- [ ] Weekend outlook arrives Thursday evening
- [ ] Chase alerts escalate correctly over multi-day window
- [ ] Quiet hours respected
- [ ] Works on mobile browsers (Chrome, Safari)
- [ ] Notification tap opens correct page in app

## Dependencies

- Epic 100 (frontend-backend connection)
- Epic 101 (user preferences persistence)
- Epic 104 (Worth Knowing algorithm — for Worth Knowing notifications)
- Epic 202 (flight prices — for Chase Alert price inclusion)

## Notes

- Start with Web Push API — free, no third-party dependency, works on Chrome/Firefox/Edge
- Safari requires separate Apple Push Notification service setup
- Rate limit: max 3 notifications per day per user (avoid fatigue)
- Product spec rule: "Never send routine dry-day updates or minor forecasts"
