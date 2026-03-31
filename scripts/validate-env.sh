#!/usr/bin/env bash
# validate-env.sh — Validate that all required environment variables are set.
# Used by pre-deploy checks and local development verification.
set -euo pipefail

REQUIRED_VARS=(
  "GOOGLE_CLIENT_ID"
  "GOOGLE_CLIENT_SECRET"
  "GOOGLE_REDIRECT_URI"
  "ANTHROPIC_API_KEY"
  "DATABASE_URL"
  "SUPABASE_URL"
  "SUPABASE_SERVICE_ROLE_KEY"
  "SUPABASE_ANON_KEY"
  "SESSION_SECRET"
  "VITE_SUPABASE_URL"
  "VITE_SUPABASE_ANON_KEY"
)

MISSING=()

for VAR in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!VAR:-}" ]; then
    MISSING+=("$VAR")
  fi
done

if [ ${#MISSING[@]} -gt 0 ]; then
  echo "ERROR: Missing required environment variables:"
  for VAR in "${MISSING[@]}"; do
    echo "  - $VAR"
  done
  echo ""
  echo "Copy .env.example to .env.local and fill in all values."
  exit 1
fi

echo "✓ All required environment variables are set."
