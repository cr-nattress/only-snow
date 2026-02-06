# OnlySnow Setup Guide

## Prerequisites

- Node.js 20+ (`nvm use` from repo root)
- pnpm 9+ (`npm install -g pnpm`)
- Supabase account (https://supabase.com)
- Upstash account (https://upstash.com)
- GCP account with billing enabled
- Terraform 1.5+ (`brew install terraform`)

## 1. Clone and Install

```bash
git clone <repo-url> only-snow-core
cd only-snow-core
pnpm install
pnpm turbo build  # verify everything compiles
```

## 2. Supabase Setup

1. Create a new Supabase project at https://supabase.com/dashboard
2. Enable PostGIS:
   - Go to SQL Editor, run: `CREATE EXTENSION IF NOT EXISTS postgis;`
   - Also run: `CREATE EXTENSION IF NOT EXISTS pg_trgm;`
3. Get your credentials from Settings > API:
   - Project URL
   - `anon` public key
   - `service_role` secret key
4. Get the direct database connection string from Settings > Database > Connection string > URI

## 3. Upstash Redis Setup

1. Create a Redis database at https://console.upstash.com
2. Choose a region close to your Vercel deployment (e.g., `us-east-1`)
3. Copy the REST URL and REST Token

## 4. Environment Variables

```bash
cp .env.example .env.local
```

Fill in your credentials:

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
DATABASE_URL=postgresql://postgres:password@db.your-project.supabase.co:5432/postgres

UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your-redis-token

ANTHROPIC_API_KEY=your-anthropic-key
```

## 5. Run Database Migrations

```bash
# Generate migration SQL from Drizzle schema
pnpm --filter @onlysnow/db db:generate

# Push schema to Supabase
pnpm --filter @onlysnow/db db:push
```

## 6. Seed the Database

```bash
# Requires DATABASE_URL in .env.local or environment
pnpm --filter @onlysnow/db db:seed
```

This seeds:
- 11 chase regions (CO, UT, NM, WY, MT)
- 46 ski resorts across all 5 states
- 19 SNOTEL weather stations mapped to nearby resorts

## 7. GCP Setup (for Pipelines)

```bash
# Create GCP project
gcloud projects create onlysnow-prod
gcloud config set project onlysnow-prod

# Enable billing (via console)

# Initialize Terraform
cd infra
terraform init

# Create terraform.tfvars (gitignored)
cat > terraform.tfvars <<EOF
gcp_project_id    = "onlysnow-prod"
gcp_region        = "us-central1"
database_url      = "your-database-url"
upstash_redis_url = "your-redis-url"
upstash_redis_token = "your-redis-token"
anthropic_api_key = "your-anthropic-key"
EOF

# Plan and apply
terraform plan
terraform apply
```

## 8. Deploy Pipeline to GCP

```bash
# Deploy forecast-refresh Cloud Function
gcloud functions deploy onlysnow-forecast-refresh \
  --gen2 \
  --runtime=nodejs20 \
  --region=us-central1 \
  --source=pipelines/forecast-refresh \
  --entry-point=forecastRefresh \
  --trigger-topic=onlysnow-forecast-refresh \
  --timeout=540s \
  --memory=512Mi \
  --set-env-vars="DATABASE_URL=$DATABASE_URL,UPSTASH_REDIS_REST_URL=$UPSTASH_REDIS_REST_URL,UPSTASH_REDIS_REST_TOKEN=$UPSTASH_REDIS_REST_TOKEN"
```

## 9. Start the Web App

```bash
pnpm --filter web dev
```

Open http://localhost:3000

## 10. Vercel Deployment

1. Connect your GitHub repo to Vercel
2. Set root directory to `apps/web`
3. Add environment variables in Vercel dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `UPSTASH_REDIS_REST_URL`
   - `UPSTASH_REDIS_REST_TOKEN`
4. Deploy

## Development Commands

```bash
pnpm turbo build          # Build all packages
pnpm turbo typecheck      # Type check everything
pnpm --filter web dev     # Run Next.js dev server
pnpm --filter @onlysnow/db db:studio  # Open Drizzle Studio (DB browser)
```
