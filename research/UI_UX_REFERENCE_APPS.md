# UI/UX Reference Apps

**Purpose**: Apps that solve similar problems well. Learn from what works, avoid what doesn't.

---

## Weather & Conditions

### Apple Weather
**What to steal:**
- Glanceable hero card (temp + conditions + high/low in one block)
- Hourly forecast as a horizontal scroll strip
- 10-day forecast as a compact vertical list
- Beautiful use of color gradients to convey conditions
- Progressive disclosure: summary → detail → maps

**What to avoid:**
- No comparison capability (one location at a time)
- Aesthetic over function in some cases (UV index graph is pretty but confusing)

### OpenSnow
**What to steal:**
- The 15-day snow bar chart is the best single visualization in ski weather
- Expert commentary alongside data (human + machine)
- The favorites page concept (multiple resorts, one view)
- Snow stake webcams (visual verification)

**What to avoid:**
- 9 tabs per resort (too much fragmentation)
- No ranking or recommendation layer
- Equal visual weight for all data (moon phase vs. snowfall)
- No comparison between resorts on the same screen

### Windy
**What to steal:**
- Beautiful data visualization on maps
- Layer-based approach (toggle what data you see)
- Scrubbing timeline to see future conditions
- Dark theme done right

**What to avoid:**
- Too complex for casual users
- Steep learning curve
- Power tool, not a decision tool

---

## Comparison & Ranking

### Google Flights
**What to steal:**
- The price calendar (grid of dates × prices, color-coded)
- "Cheapest" and "Best" tabs that pre-sort results
- Inline comparison without leaving the page
- Price tracking alerts

**What to avoid:**
- Information overload on the results page
- Too many filters for casual users

### Kayak
**What to steal:**
- Price forecast (confidence indicator: "Prices are likely to increase")
- Explore feature (map-based discovery of cheap flights)
- Notification-driven alerts when prices drop

**What to avoid:**
- Ad-heavy interface
- Dark patterns in sorting (sponsored results mixed in)

---

## Sports & Activity

### Strava
**What to steal:**
- Feed-based social engagement around activities
- Personal records and comparative stats
- Clean data visualization of performance metrics
- "Relative effort" — a single number that summarizes a complex dataset

**What to avoid:**
- Feature creep over the years
- Premium gates on basic features

### Carv (Ski Analytics)
**What to steal:**
- Ski-specific UI patterns and terminology
- Session summary as a single card
- Progressive detail: summary → run breakdown → technical metrics
- Dark mode ski aesthetic

**Relevant because:** Chris uses Carv. The visual language should feel complementary.

---

## Notification-Driven

### Robinhood
**What to steal:**
- Price alerts that are simple to set and useful when they fire
- Glanceable portfolio view (ranked list of holdings with +/- colors)
- News feed with context ("AAPL is up 3% because...")
- Minimal chrome, maximum data density

**What to avoid:**
- Gamification elements (confetti, etc.)
- Oversimplification that hides important information

### Dark Sky (now Apple Weather)
**What to steal:**
- "Rain starting in 15 minutes" — hyper-local, hyper-specific notifications
- Time-based notifications (not just threshold-based)
- Notification carries full context (no need to open app)

**What to avoid:**
- Limited to current conditions (no planning mode)

---

## Travel & Logistics

### Flighty
**What to steal:**
- Best-in-class flight tracking notifications
- Beautiful, information-dense timeline view
- Predictive delays before airlines announce them
- Trust through transparency ("We detected this 12 minutes before the airline")

**What to avoid:**
- Narrow use case (flight tracking only)

### Airbnb
**What to steal:**
- Wishlists (curated collections of saved items)
- Map + list hybrid view
- Photo-first browsing with data overlay
- Smooth transitions between list and detail views

**What to avoid:**
- Complex booking flow
- Information hidden behind "Show more" that should be visible

---

## Design Systems to Reference

### Tailwind UI
- Component patterns for cards, lists, tables
- Dark mode patterns
- Responsive layout approaches
- [tailwindui.com](https://tailwindui.com)

### Shadcn/ui
- Modern React component library
- Beautiful dark mode defaults
- Card, table, badge, and alert components
- [ui.shadcn.com](https://ui.shadcn.com)

### Radix UI
- Accessible primitives (dialogs, popovers, tooltips)
- Headless — we control the styling
- [radix-ui.com](https://www.radix-ui.com)

---

## Key Takeaways

| Lesson | Source | Application |
|--------|--------|-------------|
| Glanceable hero card | Apple Weather | Our recommendation bar |
| Horizontal scroll for time data | Apple Weather, Carv | Day-by-day forecast cards |
| 15-day snow bar chart | OpenSnow | Resort detail view hero |
| Ranked list with color coding | Robinhood, Google Flights | Resort table with ranking |
| Price in notification | Google Flights, Kayak | Chase alert: "✈️ $289 RT" |
| Confidence indicators | Kayak, Dark Sky | "Models agree" vs "uncertain" |
| Progressive disclosure | Instagram, Photoshop | Three-level depth model |
| Notification-first | Dark Sky, Flighty | Storm alerts as primary UX |
| Trust through source attribution | Flighty | "Reported by resort" badges |
| Map + list hybrid | Airbnb, Windy | Regional overview mode |
