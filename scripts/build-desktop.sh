#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

cd "$PROJECT_DIR"

cleanup() {
  # Always restore API routes, even on failure
  if [ -d ".api_backup" ]; then
    echo "    Restoring app/api"
    mv .api_backup app/api
  fi
}
trap cleanup EXIT

echo "==> Preparing desktop build..."

# Move API routes completely out of app/ (static export can't have route handlers)
if [ -d "app/api" ]; then
  echo "    Moving app/api → .api_backup"
  mv app/api .api_backup
fi

# Build static export
echo "==> Running Next.js static export..."
NEXT_PUBLIC_PLATFORM=desktop npx next build

echo "==> Static export complete → ./out/"
echo "    Run 'npx tauri build' to produce .dmg"
