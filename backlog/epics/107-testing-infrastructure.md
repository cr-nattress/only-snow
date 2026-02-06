# Epic 107: Testing Infrastructure

**Status:** Not started
**Priority:** Medium — zero tests exist anywhere in the codebase
**Phase:** E (Quality & polish)

## Context

There are no test files in the entire monorepo. No test runner configured, no test utilities, no mocks. The `turbo.json` has a `test` task defined but no package has a `test` script that does anything.

## Goal

Testing infrastructure exists and key paths have coverage. Not aiming for 100% coverage — focus on the highest-value tests first.

## User Stories

### 107.1 — Configure test runner
- Add Vitest to root devDependencies (fast, TypeScript-native, Turbo-friendly)
- Add `test` script to packages that need testing
- Configure `turbo.json` test task (already exists)
- Add `vitest.config.ts` templates for packages and apps

### 107.2 — Unit tests: @onlysnow/types
- Type assertion tests (ensure exported types are correct)
- Minimal — types package is mostly declarations

### 107.3 — Unit tests: @onlysnow/api-client
- Test `OnlySnowApiClient` with mocked fetch
- Test `MockApiClient` throws for unimplemented methods
- Test `MockApiClient` delegates to provided handlers
- Test error handling (non-200 responses)

### 107.4 — Unit tests: pipeline-core
- Test validation rules (temperature ranges, snowfall ranges)
- Test `batchProcess` utility (success, errors, delays)
- Test logger output format

### 107.5 — Unit tests: frontend data logic
- Test persona classifier (`classifyPersona`) with various signal combinations
- Test Worth Knowing algorithm (when Epic 104 is complete)
- Test type adapters (when Epic 100 is complete)
- Test `useResortRow` hook data transformations

### 107.6 — Integration tests: API routes
- Test `/api/resorts` returns valid JSON with expected shape
- Test `/api/resorts/[id]` returns resort detail
- Test `/api/regions` returns regions with storm severity
- Test `/api/chase/alerts` returns chase alerts
- Requires test database with seeded data

### 107.7 — E2E smoke tests (optional, later)
- Playwright or Cypress
- Test: load dashboard → see resorts → tap resort → see detail
- Test: onboarding flow → completes → reaches dashboard
- Runs against staging URL in CI

## Verification

- [ ] `pnpm test` runs and passes
- [ ] API client tests cover happy path + error cases
- [ ] Pipeline validation tests cover boundary conditions
- [ ] Persona classifier tests cover all 9 persona outcomes
- [ ] CI runs tests on every PR (Epic 106)

## Dependencies

- Some tests depend on Epic 100 (adapters), Epic 104 (Worth Knowing)
- Integration tests depend on Epic 105 (local database setup)
