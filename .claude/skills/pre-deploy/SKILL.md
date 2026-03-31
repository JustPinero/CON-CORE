---
name: pre-deploy
description: "Run before deploying to any environment. Validates env vars, deployment config, and stack-specific checklist."
---

# Pre-Deploy Skill

## Procedure
Run each check in order. Report PASS/FAIL per check.

### 1. Reference Check
- Read `references/deployment-landmines.md`
- Verify all documented landmines are addressed in current code

### 2. Environment Variables
- Run `scripts/validate-env.sh`
- Verify all vars in `.env.example` are set in target environment
- Verify no secrets in VITE_* variables

### 3. Vercel Configuration
- `vercel.json` has SPA rewrite rule for client-side routing
- No secrets in build-time env vars (VITE_*)
- Serverless functions in `/api` directory
- Check function timeout settings

### 4. Supabase Configuration
- Connection string uses `?pgbouncer=true` for serverless pooling
- RLS policies configured (or explicitly disabled for single-user)
- Migration files up to date with `references/schema.md`

### 5. Claude API Security
- API key only referenced in serverless functions (never in `src/`)
- All Claude API calls have AbortController timeout
- Response parsing strips markdown fences before JSON.parse
- Rate limiting implemented on proxy routes

### 6. Secret Scan
- Grep staged/committed files for: `sk-`, `ghp_`, `AKIA`, `supabase`, `service_role`, password patterns
- Verify `.env.local` is in `.gitignore`
- Verify no `.env` files are tracked by git

### 7. Validation Suite
- Run `scripts/validate.sh`
- All tests pass
- No lint errors
- No type errors
- Build succeeds

### 8. Health Check
- `/api/health` endpoint exists and returns 200

## Output
```
PRE-DEPLOY CHECK — [environment]
================================
[ PASS ] Environment variables validated
[ PASS ] Vercel config: SPA rewrite present
[ PASS ] Vercel config: No secrets in VITE_*
[ PASS ] Supabase: connection pooling configured
[ PASS ] Claude API: keys server-side only
[ PASS ] Claude API: timeouts on all calls
[ PASS ] Secret scan: no secrets in code
[ PASS ] Validation suite: all checks pass
[ PASS ] Health check: endpoint exists
================================
RESULT: CLEAR FOR DEPLOY / BLOCKED (N issues)
```
