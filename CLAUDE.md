# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**OnlySnow** is a ski decision engine that monitors all resorts within a user's drive radius and tells them where to ski and when. Unlike OpenSnow which is resort-first, OnlySnow is region-first — it answers "Where's the best snow I can reach?" not "How's Vail?"

**Tagline:** "Tell us where you live and what pass you have. We'll tell you where to ski and when."

## Monorepo Structure

```
only-snow/
├── apps/
│   ├── frontend/          # Next.js 16 consumer-facing app (port 3001)
│   └── web/               # Next.js backend API app (port 3000)
├── packages/
│   ├── types/             # @onlysnow/types — shared TypeScript types
│   ├── api-client/        # @onlysnow/api-client — typed API client + mock
│   ├── db/                # @onlysnow/db — Supabase database client
│   ├── redis/             # @onlysnow/redis — Upstash Redis cache
│   └── pipeline-core/     # @onlysnow/pipeline-core — shared pipeline utilities
├── pipelines/             # Data ingestion pipelines (forecast, conditions, snotel, avalanche, roads)
├── infra/                 # Terraform infrastructure
├── supabase/              # Supabase migrations and config
├── docs/                  # Product specs
├── research/              # User personas, competitive analysis, UI/UX research
├── examples/              # Hypothetical response examples
├── images/                # Design assets
├── backlog/               # Feature backlog
└── references/            # External reference material
```

## Development Commands

```bash
pnpm install               # Install all dependencies
pnpm dev                   # Start all apps in dev mode (Turborepo)
pnpm build                 # Build all packages and apps
pnpm typecheck             # Type-check all workspaces
pnpm lint                  # Lint all workspaces
pnpm test                  # Run all tests
pnpm format                # Format with Prettier

# Per-app commands
pnpm --filter frontend dev           # Frontend only (port 3001)
pnpm --filter web dev                # Backend API only (port 3000)
pnpm --filter @onlysnow/types build  # Build types package
```

## Tech Stack

### Frontend (`apps/frontend/`)
- **Framework:** Next.js 16 (App Router) with React 19
- **Styling:** Tailwind CSS 4 with dark mode (`dark:` variants)
- **Auth:** NextAuth.js with Google OAuth
- **Maps:** react-leaflet with OpenTopoMap (light) / CartoDB dark tiles
- **State:** React Context (PersonaContext for user persona)

### Backend (`apps/web/`)
- **Framework:** Next.js (API routes)
- **Database:** Supabase (PostgreSQL)
- **Cache:** Upstash Redis
- **AI:** Anthropic Claude API

### Shared Packages
- **@onlysnow/types:** Shared TypeScript types (resort, forecast, persona, storm severity)
- **@onlysnow/api-client:** Typed HTTP client + MockApiClient for testing
- **@onlysnow/db:** Supabase client wrapper
- **@onlysnow/redis:** Redis cache wrapper
- **@onlysnow/pipeline-core:** Shared pipeline utilities

## Type System Architecture

### Shared types (`packages/types/`)
API-level types used by both frontend and backend: `ResortSummary`, `ResortDetail`, `DailyForecast`, `RegionSummary`, `ChaseAlert`, `TripEstimate`, `UserPreferences`, etc.

Also includes:
- `PassType` — `'epic' | 'ikon' | 'indy' | 'independent'`
- `PersonaLegacy` — original 5-persona system (powder-hunter, family-planner, weekend-warrior, destination-traveler, beginner)
- `PersonaType` — new 9-persona system (core-local, storm-chaser, family-planner, weekend-warrior, resort-loyalist, learning-curve, social-skier, luxury-seeker, budget-maximizer)
- `StormSeverity` — unified superset: `'none' | 'quiet' | 'light' | 'moderate' | 'significant' | 'heavy' | 'epic' | 'chase'`
- Onboarding signal types: `SkiFrequency`, `GroupType`, `DecisionTrigger`, `ExperienceLevel`, `OnboardingSignals`, `UserPersona`

### Frontend-only types (`apps/frontend/src/data/types.ts`)
UI-specific types: `Scenario`, `Resort`, `ResortConditions`, `WorthKnowingEntry`, `StormTrackerState`, `ChaseRegion`, `TripPlan`, `TimeWindow`, `ResortForecasts`

The frontend re-exports `PersonaLegacy as Persona` for backward compatibility.

## Key Patterns

- **Workspace imports:** Use `@onlysnow/types` and `@onlysnow/api-client` — never relative paths across package boundaries
- **Mock data toggle:** Set `NEXT_PUBLIC_DATA_SOURCE=mock` (default) or `api` in `apps/frontend/.env.local`
- **Scenario-based mock data:** Frontend data flows through `Scenario` objects in `src/data/scenarios.ts`
- **Persona system:** Two systems coexist — legacy 5-persona and new 9-persona. `PersonaContext` provides persona globally
- **Dark mode:** Tailwind `dark:` variants, system preference detected via `prefers-color-scheme`
- **Turborepo caching:** Build outputs cached via `.turbo/`. Types and api-client must build before dependents

## Environment Variables

### Frontend (`apps/frontend/.env.local`)
```
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3001
NEXT_PUBLIC_DATA_SOURCE=mock
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000
```

### Backend (root `.env`)
```
SUPABASE_URL=...
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=...
UPSTASH_REDIS_REST_URL=...
UPSTASH_REDIS_REST_TOKEN=...
GOOGLE_MAPS_API_KEY=...
ANTHROPIC_API_KEY=...
```

## Frontend Architecture

### Directory Structure
```
apps/frontend/src/
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

### Three-Section Layout
The main decision screen has three sections:
1. **Your Resorts** — Ranked table of pass resorts by snow forecast
2. **Worth Knowing** — Contextual discovery (appears only when relevant)
3. **Storm Tracker** — Persistent bar for incoming storms
