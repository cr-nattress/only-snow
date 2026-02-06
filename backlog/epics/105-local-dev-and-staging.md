# Epic 105: Local Dev & Staging Environment

**Status:** Not started
**Priority:** High — team productivity depends on reliable local setup
**Phase:** B (Core product)

## Context

The monorepo has all the pieces but no documented end-to-end local setup flow. A developer needs to: set up Supabase (local or hosted), configure Redis (local or Upstash), seed the database, run pipelines to populate data, then start both apps. This epic makes that smooth and repeatable.

## Goal

A new developer can go from `git clone` to a fully running local environment in under 10 minutes with a single setup script.

## User Stories

### 105.1 — Local development script
- Create `scripts/setup-local.sh` that:
  - Checks prerequisites (node 20+, pnpm)
  - Copies `.env.example` → `.env` if not present
  - Copies `apps/frontend/.env.local.example` → `apps/frontend/.env.local` if not present
  - Runs `pnpm install`
  - Builds packages (`pnpm build --filter @onlysnow/types --filter @onlysnow/api-client`)
  - Optionally seeds database
- Update `SETUP.md` with clear step-by-step instructions

### 105.2 — Database seeding command
- Add root script: `pnpm db:seed` that runs `packages/db/src/seed.ts`
- Ensure seed is idempotent (upsert, not fail on duplicate)
- Add `pnpm db:reset` for clean slate (drop + re-seed)

### 105.3 — Pipeline manual run commands
- Add per-pipeline run scripts: `pnpm pipeline:forecast`, `pnpm pipeline:conditions`, etc.
- These call the pipeline entry points directly (not via Cloud Functions)
- Useful for local data population without GCP infrastructure

### 105.4 — Staging environment
- Document Supabase project setup for staging
- Document Upstash Redis setup for staging
- Create `apps/web/.env.staging.example` with staging URLs
- Frontend Vercel deployment config for staging

### 105.5 — Docker Compose for local services (optional)
- Postgres + Redis via Docker Compose for fully local development
- No external service dependencies for basic development
- `docker compose up -d` → local Postgres on 5432, Redis on 6379

## Verification

- [ ] Fresh clone → run setup script → `pnpm dev` → both apps load
- [ ] `pnpm db:seed` populates database with 50+ resorts, 13 regions, 20+ SNOTEL stations
- [ ] `pnpm pipeline:forecast` populates forecast data for all resorts
- [ ] Frontend shows real data from locally running backend
- [ ] SETUP.md is accurate and complete

## Dependencies

- Epic 100 (frontend needs to be able to consume backend API)
