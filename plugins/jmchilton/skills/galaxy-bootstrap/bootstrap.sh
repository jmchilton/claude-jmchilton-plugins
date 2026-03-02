#!/bin/bash
# Bootstrap a Galaxy worktree for development
#
# USAGE:
#   bootstrap_worktree.sh [GALAXY_ROOT]
#
# ARGUMENTS:
#   GALAXY_ROOT  Path to Galaxy root directory (default: current directory)
#
# PRECONDITIONS:
#   - uv must be installed (https://docs.astral.sh/uv/getting-started/installation/)
#   - Node.js must be installed (for corepack/pnpm)
#   - Galaxy source must exist at GALAXY_ROOT
#
# WHAT THIS SCRIPT DOES:
#   1. Creates .venv virtual environment (if not exists)
#   2. Installs Python deps including dev dependencies via uv
#   3. Installs Playwright browsers
#   4. Enables pnpm via corepack (if needed)
#   5. Installs client dependencies via pnpm
#   6. Creates config/galaxy.yml from sample with:
#      - preload: true (enabled)
#      - admin_users: jmchilton@gmail.com
#
set -e

GALAXY_ROOT="${1:-$(pwd)}"
cd "$GALAXY_ROOT"

echo "=== Bootstrapping Galaxy worktree: $GALAXY_ROOT ==="

# Verify uv is available
if ! command -v uv >/dev/null; then
    echo "ERROR: uv is required but not found. Install with: curl -LsSf https://astral.sh/uv/install.sh | sh"
    exit 1
fi

# 1. Create virtual environment if needed
if [ ! -d ".venv" ]; then
    echo "Creating virtual environment..."
    uv venv .venv
fi

# 2. Activate venv
echo "Activating virtual environment..."
source .venv/bin/activate

# 3. Install Python dependencies (including dev deps)
echo "Installing Python dependencies..."
uv pip install -r requirements.txt \
    -r lib/galaxy/dependencies/dev-requirements.txt \
    --extra-index-url https://wheels.galaxyproject.org/simple

# 4. Install Playwright browsers
echo "Installing Playwright browsers..."
playwright install

# 5. Setup pnpm and install client dependencies
echo "Setting up client dependencies..."
if ! command -v pnpm >/dev/null; then
    echo "Enabling pnpm via corepack..."
    corepack enable pnpm
fi

cd client
pnpm install --frozen-lockfile
cd ..

# 6. Copy and configure galaxy.yml
echo "Configuring galaxy.yml..."
if [ ! -f config/galaxy.yml ]; then
    cp config/galaxy.yml.sample config/galaxy.yml
fi

# Enable preload: true (uncomment the line)
sed -i.bak 's/^    # preload: true$/    preload: false/' config/galaxy.yml

# Set admin_users to jmchilton@gmail.com
sed -i.bak 's/^  #admin_users: null$/  admin_users: jmchilton@gmail.com/' config/galaxy.yml

# Clean up backup files
rm -f config/galaxy.yml.bak

echo ""
echo "=== Bootstrap complete ==="
echo ""
echo "To start Galaxy:"
echo "  ./run.sh"
echo ""
echo "To start the Vite dev server (HMR):"
echo "  make client-dev-server"
echo ""
echo "To run tests:"
echo "  . .venv/bin/activate"
echo "  ./run_tests.sh -unit"
