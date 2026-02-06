# OnlySnow Core

Backend data platform powering [onlysnow.app](https://onlysnow.app) — a ski decision engine that answers: **When** should I ski? **Where** should I ski? **How much** will it cost?

This repo provides all data ingestion, storage, caching, API routes, and AI functionality. The frontend at onlysnow.app consumes these APIs.

---

## Architecture

```
                    ┌──────────────┐
                    │  onlysnow.app│  (Next.js on Vercel)
                    │   Frontend   │
                    └──────┬───────┘
                           │ fetch
                    ┌──────▼───────┐
                    │  apps/web/   │  API Routes (Next.js)
                    │  10 endpoints│  ──► Vercel
                    └──┬───────┬───┘
                       │       │
              ┌────────▼─┐  ┌──▼────────┐
              │ Supabase │  │  Upstash  │
              │ Postgres │  │   Redis   │
              └────▲─────┘  └───▲───────┘
                   │            │
            ┌──────┴────────────┴──────┐
            │     GCP Cloud Functions  │
            │     5 Data Pipelines     │
            └──────────────────────────┘
                   ▲
         ┌─────────┼─────────┐
    Open-Meteo  SnoCountry  SNOTEL  avalanche.org  CDOT
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Monorepo | Turborepo + pnpm workspaces |
| Framework | Next.js 15 (App Router) |
| ORM | Drizzle ORM + PostgreSQL |
| Database | Supabase (PostGIS enabled) |
| Cache | Upstash Redis |
| Pipelines | GCP Cloud Functions Gen2 + Cloud Scheduler |
| AI | Claude (Anthropic) |
| IaC | Terraform |
| Deploy | Vercel (web) + GCP (pipelines) |

## Project Structure

```
only-snow-core/
├── apps/web/                     # Next.js 15 → Vercel (API routes + future SSR pages)
├── packages/
│   ├── db/                       # Drizzle schema (10 tables), migrations, client
│   ├── types/                    # Shared TypeScript types (20+ interfaces)
│   ├── redis/                    # Upstash client, cache keys, TTLs, cache-aside helpers
│   └── pipeline-core/            # Logger, validation, errors, batch utils
├── pipelines/
│   ├── forecast-refresh/         # Open-Meteo → forecasts table (every 6hrs)
│   ├── conditions-refresh/       # SnoCountry → resort_conditions (every 2hrs in season)
│   ├── snotel-daily/             # USDA AWDB → snotel_readings (daily 1am MT)
│   ├── avalanche-daily/          # avalanche.org → avalanche_zones (daily 3pm MT)
│   └── road-conditions/          # CDOT COtrip → Redis (4x daily in season)
├── infra/                        # Terraform (Cloud Scheduler, Pub/Sub, Functions, IAM)
├── supabase/seed/                # Seed data: 46 resorts, 11 regions, 19 SNOTEL stations
└── turbo.json
```

## API Routes

All routes are in `apps/web/src/app/api/`:

| Endpoint | Method | Description | Cache |
|----------|--------|-------------|-------|
| `/api/resorts` | GET | List/filter resorts (region, pass, lat/lng/radius) | CDN 1hr |
| `/api/resorts/[id]` | GET | Full detail + conditions + forecast + snowpack + avalanche | Redis 30min |
| `/api/resorts/[id]/forecast` | GET | Daily + hourly forecast | Redis 3hr |
| `/api/regions` | GET | All chase regions with aggregated snow totals | Redis 1hr |
| `/api/regions/[id]/compare` | GET | Side-by-side resort comparison by 5-day snowfall | Redis 1hr |
| `/api/rankings/snow` | GET | Snow rankings (24h/48h/72h/7d) | Redis 1hr |
| `/api/chase/alerts` | GET | Regions with 6+ inches in next 7 days | Redis 30min |
| `/api/chase/[region]/trip` | GET | Trip cost estimate with affiliate links | None |
| `/api/road-conditions/[route]` | GET | Road status (I-70, canyon roads, Teton Pass) | Redis 5min |
| `/api/user/preferences` | GET/PUT | User pass type, persona, location (JWT auth) | None |

## Database Schema

10 tables in `packages/db/src/schema/`:

| Table | Purpose |
|-------|---------|
| `resorts` | 46 ski resorts (CO, UT, NM, WY, MT) with coordinates, elevation, pass type, terrain |
| `resort_conditions` | Live snowfall, base depth, lifts/trails open, surface condition |
| `forecasts` | Daily forecasts per resort (snowfall, temp, wind, conditions, AI narrative) |
| `forecast_hourly` | Hourly forecast detail |
| `chase_regions` | 11 geographic regions for "chase mode" |
| `snotel_stations` | 19 SNOTEL weather stations mapped to nearby resorts |
| `snotel_readings` | Daily SWE, snow depth, precipitation from SNOTEL |
| `avalanche_zones` | Avalanche danger ratings by zone |
| `users` | User profiles with pass type, persona, preferences |
| `saved_trips` | User-saved trip plans with cost snapshots |

---

## What's Built (Complete)

- **Phase 0** — Monorepo scaffolding, all packages, Next.js app, configs
- **Phase 1** — Database schema (10 tables), seed data (46 resorts, 11 regions, 19 stations), Terraform IaC
- **Phase 2** — 10 API routes, 5 data pipelines, Redis caching layer
- Full `pnpm turbo build` passes across all 10 workspace packages

---

## Next Steps

### Step 1: Supabase Setup

Create the database and push the schema.

1. **Create a Supabase project** at [supabase.com/dashboard](https://supabase.com/dashboard)
   - Choose a region close to your users (e.g., `us-east-1`)
   - Note the project URL and API keys from **Settings > API**

2. **Enable required extensions** in the SQL Editor:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;
   ```

3. **Get credentials** from Supabase dashboard:
   | Credential | Where to find it |
   |-----------|-----------------|
   | Project URL | Settings > API > Project URL |
   | Anon Key | Settings > API > `anon` `public` key |
   | Service Role Key | Settings > API > `service_role` `secret` key |
   | Database URL | Settings > Database > Connection string > URI (use "Session mode" for Drizzle) |

4. **Configure environment**:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase credentials:
   ```
   SUPABASE_URL=https://xxxxx.supabase.co
   SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE_KEY=eyJ...
   DATABASE_URL=postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres
   ```

5. **Push the schema** (creates all 10 tables + indexes):
   ```bash
   pnpm --filter @onlysnow/db db:push
   ```

6. **Seed the database**:
   ```bash
   pnpm --filter @onlysnow/db db:seed
   ```
   This inserts 46 resorts, 11 chase regions, and 19 SNOTEL stations.

7. **Verify** with Drizzle Studio:
   ```bash
   pnpm --filter @onlysnow/db db:studio
   ```
   Open the browser to confirm resorts, regions, and stations are populated.

### Step 2: Upstash Redis Setup

Set up the caching layer.

1. **Create a Redis database** at [console.upstash.com](https://console.upstash.com)
   - Choose `us-east-1` (or match your Vercel region)
   - Select the free tier (10K commands/day — plenty for MVP)

2. **Copy credentials** from the Upstash dashboard:
   - REST URL
   - REST Token

3. **Add to `.env.local`**:
   ```
   UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXxx...
   ```

### Step 3: Test Locally

Verify API routes work with real data.

```bash
# Start the dev server
pnpm --filter web dev

# Test endpoints (in another terminal)
curl http://localhost:3000/api/resorts | jq '.[0]'
curl http://localhost:3000/api/resorts/1 | jq '.name, .forecast'
curl http://localhost:3000/api/regions | jq '.[0]'
curl http://localhost:3000/api/rankings/snow?timeframe=48h | jq '.[0]'
```

At this point, resorts and regions return seeded data. Forecasts, conditions, snowpack, and avalanche data will be empty until pipelines run.

### Step 4: Run Forecast Pipeline Locally

Populate forecast data without deploying to GCP.

```bash
# Set DATABASE_URL and Redis env vars in your shell, then:
cd pipelines/forecast-refresh
pnpm dev
```

This starts the Cloud Function locally via the Functions Framework. Trigger it:

```bash
curl http://localhost:8080
```

This will:
- Query all 46 resorts from Supabase
- Fetch 16-day forecasts from Open-Meteo for each (with 200ms delay)
- Upsert daily + hourly forecasts into the database
- Invalidate Redis cache

After it completes (~30 seconds), re-test the API:
```bash
curl http://localhost:3000/api/resorts/1/forecast | jq '.daily[0]'
curl http://localhost:3000/api/chase/alerts | jq '.'
curl http://localhost:3000/api/rankings/snow | jq '.[0:3]'
```

### Step 5: Deploy to Vercel

Ship the API routes so onlysnow.app can consume them.

1. **Connect GitHub repo** to Vercel at [vercel.com/new](https://vercel.com/new)

2. **Configure project settings**:
   - Root directory: `apps/web`
   - Build command: (auto-detected by Vercel)
   - Output directory: (auto-detected)

3. **Add environment variables** in Vercel dashboard > Settings > Environment Variables:
   | Variable | Value |
   |----------|-------|
   | `DATABASE_URL` | Your Supabase connection string |
   | `SUPABASE_URL` | `https://xxxxx.supabase.co` |
   | `SUPABASE_ANON_KEY` | Your anon key |
   | `UPSTASH_REDIS_REST_URL` | Your Upstash REST URL |
   | `UPSTASH_REDIS_REST_TOKEN` | Your Upstash REST token |

4. **Deploy** and verify:
   ```bash
   curl https://your-vercel-url.vercel.app/api/resorts | jq 'length'
   # Should return 46
   ```

5. **Custom domain**: Point `api.onlysnow.app` (or similar) to your Vercel deployment so the frontend can fetch from it.

### Step 6: GCP Pipeline Deployment

Deploy automated data pipelines for continuous data freshness.

1. **Create a GCP project**:
   ```bash
   gcloud projects create onlysnow-prod
   gcloud config set project onlysnow-prod
   ```
   Enable billing at [console.cloud.google.com/billing](https://console.cloud.google.com/billing).

2. **Initialize Terraform**:
   ```bash
   cd infra
   terraform init
   ```

3. **Create `terraform.tfvars`** (gitignored):
   ```hcl
   gcp_project_id      = "onlysnow-prod"
   gcp_region           = "us-central1"
   database_url         = "postgresql://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"
   upstash_redis_url    = "https://xxxxx.upstash.io"
   upstash_redis_token  = "AXxx..."
   anthropic_api_key    = "sk-ant-..."
   ```

4. **Apply infrastructure** (creates Pub/Sub topics, Cloud Scheduler jobs, IAM, storage bucket):
   ```bash
   terraform plan    # review what will be created
   terraform apply   # create resources
   ```

5. **Deploy each pipeline** as a Cloud Function:
   ```bash
   # Forecast refresh (every 6 hours)
   gcloud functions deploy onlysnow-forecast-refresh \
     --gen2 --runtime=nodejs20 --region=us-central1 \
     --source=pipelines/forecast-refresh \
     --entry-point=forecastRefresh \
     --trigger-topic=onlysnow-forecast-refresh \
     --timeout=540s --memory=512Mi \
     --set-env-vars="DATABASE_URL=$DATABASE_URL,UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"

   # Conditions refresh (every 2hrs in season)
   gcloud functions deploy onlysnow-conditions-refresh \
     --gen2 --runtime=nodejs20 --region=us-central1 \
     --source=pipelines/conditions-refresh \
     --entry-point=conditionsRefresh \
     --trigger-topic=onlysnow-conditions-refresh \
     --timeout=540s --memory=512Mi \
     --set-env-vars="DATABASE_URL=$DATABASE_URL,UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"

   # SNOTEL daily (1am MT)
   gcloud functions deploy onlysnow-snotel-daily \
     --gen2 --runtime=nodejs20 --region=us-central1 \
     --source=pipelines/snotel-daily \
     --entry-point=snotelDaily \
     --trigger-topic=onlysnow-snotel-daily \
     --timeout=300s --memory=256Mi \
     --set-env-vars="DATABASE_URL=$DATABASE_URL,UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"

   # Avalanche daily (3pm MT)
   gcloud functions deploy onlysnow-avalanche-daily \
     --gen2 --runtime=nodejs20 --region=us-central1 \
     --source=pipelines/avalanche-daily \
     --entry-point=avalancheDaily \
     --trigger-topic=onlysnow-avalanche-daily \
     --timeout=300s --memory=256Mi \
     --set-env-vars="DATABASE_URL=$DATABASE_URL"

   # Road conditions (4x daily in season)
   gcloud functions deploy onlysnow-road-conditions \
     --gen2 --runtime=nodejs20 --region=us-central1 \
     --source=pipelines/road-conditions \
     --entry-point=roadConditions \
     --trigger-topic=onlysnow-road-conditions \
     --timeout=120s --memory=256Mi \
     --set-env-vars="UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"
   ```

6. **Verify** Cloud Scheduler is running:
   ```bash
   gcloud scheduler jobs list --location=us-central1
   ```

### Step 7: AI Integration (Phase 5)

Add Claude-powered snow narratives and recommendations.

1. **Get an API key** from [console.anthropic.com](https://console.anthropic.com)

2. **Add to `.env.local`**:
   ```
   ANTHROPIC_API_KEY=sk-ant-api03-...
   ```

3. **Snow report narratives**: After each `forecast-refresh` run, call Claude Haiku with structured forecast data to generate a 2-3 sentence expert snow report per resort. Stored in the `forecast_narrative` column. Estimated cost: ~$8-15/mo at MVP scale.

4. **Personalized recommendations**: API endpoint that calls Claude Sonnet with user preferences + available data to generate structured "where to ski this weekend" recommendations. Not a chatbot — a single structured output.

---

## Pipeline Schedule Summary

| Pipeline | Schedule | Source API | Storage |
|----------|----------|-----------|---------|
| forecast-refresh | Every 6 hours | Open-Meteo | `forecasts` + `forecast_hourly` |
| conditions-refresh | Every 2hrs (Nov-Apr) | SnoCountry | `resort_conditions` |
| snotel-daily | Daily 1am MT | USDA AWDB | `snotel_readings` |
| avalanche-daily | Daily 3pm MT | avalanche.org | `avalanche_zones` |
| road-conditions | 4x daily (Nov-Apr) | CDOT COtrip | Redis only |

## Estimated Monthly Cost (MVP, 0-1K users)

| Service | Cost |
|---------|------|
| Supabase | $0 (free tier) |
| Upstash Redis | $0 (free tier) |
| Vercel | $0 (hobby tier) |
| GCP Cloud Functions | $0 (free tier) |
| GCP Cloud Scheduler (6 jobs) | $0.40 |
| Open-Meteo | $0 (free) |
| Anthropic (Claude Haiku/Sonnet) | $8-15 |
| **Total** | **~$10-16/mo** |

## Development Commands

```bash
pnpm install                              # Install all dependencies
pnpm turbo build                          # Build all 10 packages
pnpm turbo typecheck                      # Type check everything
pnpm --filter web dev                     # Run Next.js dev server
pnpm --filter @onlysnow/db db:push        # Push schema to Supabase
pnpm --filter @onlysnow/db db:seed        # Seed the database
pnpm --filter @onlysnow/db db:studio      # Open Drizzle Studio (DB browser)
pnpm --filter @onlysnow/db db:generate    # Generate migration SQL
```
