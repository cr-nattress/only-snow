#!/usr/bin/env bash
set -euo pipefail

# OnlySnow local development setup script
# Usage: ./scripts/setup-local.sh

BOLD='\033[1m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
RED='\033[0;31m'
NC='\033[0m'

info() { echo -e "${GREEN}[OK]${NC} $1"; }
warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
fail() { echo -e "${RED}[FAIL]${NC} $1"; exit 1; }
step() { echo -e "\n${BOLD}$1${NC}"; }

# ── Prerequisites ────────────────────────────────────────────────────

step "1/6 Checking prerequisites..."

# Node.js
if ! command -v node &>/dev/null; then
  fail "Node.js is not installed. Install v20+ from https://nodejs.org"
fi
NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
  fail "Node.js $NODE_VERSION found, but 20+ is required. Run: nvm install 20"
fi
info "Node.js $(node -v)"

# pnpm
if ! command -v pnpm &>/dev/null; then
  fail "pnpm is not installed. Run: npm install -g pnpm"
fi
info "pnpm $(pnpm -v)"

# ── Environment files ────────────────────────────────────────────────

step "2/6 Setting up environment files..."

if [ ! -f .env ]; then
  cp .env.example .env
  info "Created .env from .env.example"
  warn "Edit .env with your Supabase and Redis credentials"
else
  info ".env already exists"
fi

if [ ! -f apps/frontend/.env.local ]; then
  cp apps/frontend/.env.local.example apps/frontend/.env.local
  info "Created apps/frontend/.env.local from .env.local.example"
else
  info "apps/frontend/.env.local already exists"
fi

# ── Install dependencies ─────────────────────────────────────────────

step "3/6 Installing dependencies..."
pnpm install
info "Dependencies installed"

# ── Build packages ───────────────────────────────────────────────────

step "4/6 Building shared packages..."
pnpm build
info "All packages built"

# ── Type check ───────────────────────────────────────────────────────

step "5/6 Running type check..."
pnpm typecheck
info "Type check passed"

# ── Summary ──────────────────────────────────────────────────────────

step "6/6 Setup complete!"

echo ""
echo "Next steps:"
echo "  1. Edit .env with your Supabase and Redis credentials"
echo "  2. Push database schema:  pnpm db:push"
echo "  3. Seed the database:     pnpm db:seed"
echo "  4. Start development:"
echo "     - Backend API:  pnpm dev:web      (http://localhost:3000)"
echo "     - Frontend:     pnpm dev:frontend  (http://localhost:3001)"
echo "     - Both:         pnpm dev"
echo ""
echo "  Or start in mock mode (no backend needed):"
echo "     pnpm dev:frontend"
echo ""
