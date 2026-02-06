# Epic 106: CI/CD & Deployment Pipeline

**Status:** Not started
**Priority:** Medium — needed before any production traffic
**Phase:** D (Revenue & growth)

## Context

No CI/CD exists. No GitHub Actions, no deployment pipeline, no automated checks. The frontend has a `vercel.json` suggesting Vercel deployment. The backend pipelines have Terraform for GCP Cloud Functions. But nothing is automated.

## Goal

Push to `main` → automated checks → deploy to staging. Manual promotion to production.

## User Stories

### 106.1 — GitHub Actions: lint, typecheck, build
- `.github/workflows/ci.yml` triggered on PR and push to main
- Steps: `pnpm install` → `pnpm typecheck` → `pnpm build`
- Cache `node_modules` and `.turbo` for speed
- Fail PR if any step fails

### 106.2 — GitHub Actions: test
- Run `pnpm test` (once tests exist — see Epic 107)
- Separate job for unit tests vs. integration tests
- Integration tests may need database (GitHub Actions service container or test DB)

### 106.3 — Frontend deployment (Vercel)
- Configure Vercel for `apps/frontend/`
- Set root directory to `apps/frontend` in Vercel project settings
- Environment variables in Vercel dashboard
- Preview deployments on PRs
- Production deploy on merge to main

### 106.4 — Backend API deployment (Vercel or GCP)
- Configure deployment for `apps/web/`
- Options: Vercel (simplest), GCP Cloud Run, or Railway
- Environment variables for Supabase + Redis credentials
- Health check endpoint

### 106.5 — Pipeline deployment (Terraform)
- GitHub Actions workflow for `terraform plan` on PR
- `terraform apply` on merge to main (with approval gate)
- Pipeline source code uploaded to GCS bucket
- Cloud Functions deployed from bucket

### 106.6 — Environment promotion
- Staging deploys automatically on merge to main
- Production requires manual approval (GitHub environment protection)
- Database migrations run before app deployment

## Verification

- [ ] PR triggers CI checks (typecheck, build)
- [ ] Merge to main deploys frontend to staging URL
- [ ] Merge to main deploys backend to staging URL
- [ ] Pipeline Terraform plans are visible on PRs
- [ ] Production deploy requires manual approval

## Dependencies

- Epic 105 (staging environment must be defined)
- Epic 107 (tests should exist before adding test CI step)
