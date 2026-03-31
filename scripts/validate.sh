#!/usr/bin/env bash
# validate.sh — Shared validation script for local development and CI.
# Run this before every commit. CI runs the same script.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "=== CON-CORE VALIDATION ==="
echo ""

# 1. TypeScript type checking
echo "[1/5] Type checking..."
npx tsc --noEmit
echo "  ✓ Types OK"

# 2. Linting
echo "[2/5] Linting..."
npx eslint src/ api/ --ext .ts,.tsx --max-warnings 0
echo "  ✓ Lint OK"

# 3. Formatting check
echo "[3/5] Format check..."
npx prettier --check "src/**/*.{ts,tsx,css}" "api/**/*.ts"
echo "  ✓ Format OK"

# 4. Tests
echo "[4/5] Running tests..."
npx vitest run
echo "  ✓ Tests OK"

# 5. Build
echo "[5/5] Building..."
npx vite build
echo "  ✓ Build OK"

echo ""
echo "=== ALL CHECKS PASSED ==="
