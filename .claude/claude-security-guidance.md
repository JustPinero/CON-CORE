# CON-CORE Security Guidance

Stack: React + Vite + TS | Vercel Serverless (`/api`) | Supabase PostgreSQL | Google OAuth2 | Claude API.
Human-readable landmines live in `references/deployment-landmines.md` and `references/env-vars.md`.

## Secrets & Env Vars
- `VITE_*` vars are baked into the client bundle at build time — NEVER put secrets in them. Server secrets use unprefixed names, read only in `/api` functions.
- Secrets in this project: `ANTHROPIC_API_KEY` (`sk-ant-*`), `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`. None of these may appear in `src/`, committed files, or logs.
- All required env vars are validated with Zod in `api/_utils/env.ts` — new vars go through that schema and get a row in `references/env-vars.md` plus a key in `.env.example` (names only, no values).

## Auth & Tokens
- Google OAuth tokens are encrypted at rest (AES-256 via `SESSION_SECRET`) in the `auth_tokens` table — encryption lives in `api/_utils/crypto.ts`. Never store or log raw tokens.
- OAuth callback must validate the `state` CSRF token.
- Auth is required on every route except `/api/auth/login`, `/api/auth/callback`, `/api/health`.

## Database
- Service role key bypasses RLS — it is server-only. Client-side Supabase access (if ever added) uses the anon key with RLS policies.
- The Supabase JS client parameterizes queries; never build SQL by string concatenation.

## Client-Side Data
- Password/security station data lives in React state only: never persisted to Supabase, localStorage, or cookies; cleared on unmount.

## Claude API
- All Claude calls go through `/api/claude/*` proxy routes — the key never reaches the browser.
- Rate limiting is a cost-security control: per-IP limit plus global daily cap (`RATE_LIMIT_DAILY_CAP`). Do not remove or bypass when editing these routes.

## Critical Paths (recommend /ultrareview at /phase-complete)
- `api/auth/**` — OAuth flow, token storage
- `api/_utils/crypto.ts` — token encryption
- `api/_utils/env.ts` — env validation
- `api/_utils/supabase.ts` — service-role client
- `api/claude/**` — API-key proxy + rate limiting/cost caps
- `src/stations/security/**` — password/security station, never-persist rule
