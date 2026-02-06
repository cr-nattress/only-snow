# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OnlySnow** is a ski decision engine that monitors all resorts within a user's drive radius and tells them where to ski and when. Unlike OpenSnow which is resort-first, OnlySnow is region-first — it answers "Where's the best snow I can reach?" not "How's Vail?"

**Tagline:** "Tell us where you live and what pass you have. We'll tell you where to ski and when."

## Development Commands

All commands run from `poc/app/`:

```bash
npm run dev      # Start development server (http://localhost:3000)
npm run build    # Production build
npm run lint     # Run ESLint
npm run start    # Start production server
```

## Tech Stack

- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 4 with dark mode (`dark:` variants)
- **Auth:** NextAuth.js with Google OAuth
- **Maps:** react-leaflet with OpenTopoMap (light) / CartoDB dark tiles
- **State:** React Context (PersonaContext for user persona)

## Architecture

### Directory Structure

```
poc/app/src/
├── app/                    # Next.js App Router pages
│   ├── dashboard/          # Main decision screen
│   ├── chase/              # Storm chase mode (national view → trip planner)
│   ├── notifications/      # Notification types preview
│   ├── settings/           # User profile & preferences
│   ├── resort/[id]/        # Resort detail page
│   ├── auth/signin/        # Google OAuth sign-in
│   └── api/auth/           # NextAuth API routes
├── components/             # Reusable UI components
├── context/                # React Context providers
├── data/                   # Types, mock data, scenarios
└── hooks/                  # Custom React hooks
```

### Core Data Model

Key types in `src/data/types.ts`:

- **Scenario**: A complete snapshot (user location, resorts, forecasts, storm tracker)
- **ResortConditions**: Resort with current conditions and forecasts
- **WorthKnowingEntry**: Non-pass resort worth considering
- **StormTrackerState**: Storm severity and chase alert info
- **Persona**: User type (powder-hunter, family-planner, weekend-warrior, destination-traveler, beginner)

### Key Design Patterns

1. **Scenario-based mock data**: All data flows through `Scenario` objects in `src/data/scenarios.ts`. Switch scenarios to see different user contexts.

2. **Time window toggling**: Forecasts have `5day` and `10day` variants. The UI currently shows 10-day only.

3. **Persona-adaptive**: PersonaContext provides user persona globally. Components can adapt recommendations based on persona.

4. **Dark mode**: Uses Tailwind's `dark:` variants. System preference detected via `prefers-color-scheme`. Map tiles switch automatically.

### Three-Section Layout

The main decision screen has three sections:
1. **Your Resorts** — Ranked table of pass resorts by snow forecast
2. **Worth Knowing** — Contextual discovery (appears only when relevant)
3. **Storm Tracker** — Persistent bar for incoming storms

## Environment Variables

Copy `poc/app/.env.local.example` to `poc/app/.env.local`:

```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...          # Generate with: openssl rand -base64 32
NEXTAUTH_URL=http://localhost:3000
```

## Documentation

- `docs/PRODUCT_SPEC.md` — Full product specification
- `research/` — User personas, competitive analysis, UI/UX research
- `examples/` — Hypothetical response examples for different user types
