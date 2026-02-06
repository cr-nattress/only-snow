# OnlySnow Setup Guide

## Quick Start

```bash
git clone <repo-url> only-snow
cd only-snow
./scripts/setup-local.sh
```

The setup script checks prerequisites, copies env files, installs deps, and builds.

## Prerequisites

- Node.js 20+ (`nvm use` from repo root)
- pnpm 9+ (`npm install -g pnpm`)

### For backend API (optional for frontend-only development):
- Supabase account (https://supabase.com) or local Postgres
- Upstash account (https://upstash.com) or local Redis

### For pipelines / deployment:
- GCP account with billing enabled
- Terraform 1.5+ (`brew install terraform`)

## Project Structure

```
only-snow/
  apps/
    web/          # Backend API (Next.js, port 3000)
    frontend/     # Frontend (Next.js, port 3001)
  packages/
    types/        # Shared TypeScript types
    api-client/   # Typed API client
    db/           # Drizzle ORM schema + client
    redis/        # Cache keys + client
    pipeline-core/# Shared pipeline utilities
  pipelines/
    forecast-refresh/     # Weather forecast pipeline
    conditions-refresh/   # Resort conditions pipeline
    snotel-daily/         # Snowpack data pipeline
    avalanche-daily/      # Avalanche danger pipeline
    road-conditions/      # Road conditions pipeline
    drive-times/          # Drive time pipeline
```

## 1. Environment Setup

```bash
cp .env.example .env                                    # Backend
cp apps/frontend/.env.local.example apps/frontend/.env.local  # Frontend
```

**Backend `.env`** — fill in:
- `DATABASE_URL` — Supabase or local Postgres connection string
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis cache
- `ANTHROPIC_API_KEY` — for AI narrative generation

**Frontend `.env.local`** — defaults work for mock mode:
- `NEXT_PUBLIC_DATA_SOURCE=mock` — uses hardcoded scenario data (no backend needed)
- `NEXT_PUBLIC_DATA_SOURCE=api` — connects to backend at `NEXT_PUBLIC_API_BASE_URL`

## 2. Install and Build

```bash
pnpm install
pnpm build
pnpm typecheck   # verify everything compiles
```

## 3. Development

### Frontend only (mock mode — no backend needed):
```bash
pnpm dev:frontend
# Open http://localhost:3001
```

### Full stack:
```bash
pnpm dev
# Backend: http://localhost:3000
# Frontend: http://localhost:3001
```

### Individual apps:
```bash
pnpm dev:web        # Backend API only
pnpm dev:frontend   # Frontend only
```

## 4. Database Setup (for API mode)

### With Supabase:
1. Create a project at https://supabase.com/dashboard
2. Run in SQL Editor: `CREATE EXTENSION IF NOT EXISTS postgis;`
3. Get credentials from Settings > API and Settings > Database

### With local Docker:
```bash
docker compose up -d
# Postgres at localhost:5432, Redis at localhost:6379
# DATABASE_URL=postgresql://postgres:postgres@localhost:5432/onlysnow
```

### Push schema and seed:
```bash
pnpm db:push    # Push Drizzle schema to database
pnpm db:seed    # Seed with resorts, regions, SNOTEL stations
```

## 5. Populate Data (optional)

Run pipelines locally to populate forecast/conditions data:

```bash
pnpm pipeline:forecast       # Fetch weather forecasts
pnpm pipeline:conditions     # Fetch resort conditions
pnpm pipeline:snotel         # Fetch snowpack data
pnpm pipeline:avalanche      # Fetch avalanche danger
pnpm pipeline:road-conditions # Fetch road conditions
pnpm pipeline:drive-times    # Compute drive times (requires GOOGLE_MAPS_API_KEY)
```

## 6. Deployment

### Frontend (Vercel):
1. Connect repo to Vercel
2. Set root directory to `apps/frontend`
3. Add env vars: `NEXT_PUBLIC_DATA_SOURCE=api`, `NEXT_PUBLIC_API_BASE_URL`

### Backend (Vercel):
1. Set root directory to `apps/web`
2. Add env vars: `DATABASE_URL`, `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`

### Pipelines (GCP Cloud Functions):
See `infra/` for Terraform configuration.

## Development Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all apps |
| `pnpm dev:web` | Backend API (port 3000) |
| `pnpm dev:frontend` | Frontend (port 3001) |
| `pnpm build` | Build all packages |
| `pnpm typecheck` | Type check everything |
| `pnpm db:push` | Push schema to database |
| `pnpm db:seed` | Seed database |
| `pnpm db:studio` | Open Drizzle Studio (DB browser) |
| `pnpm db:generate` | Generate migration SQL |
| `pnpm pipeline:*` | Run a pipeline locally |
| `pnpm setup` | Run setup script |
