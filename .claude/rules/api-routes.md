---
paths:
  - "api/**/*.ts"
---
# API Route Rules (Vercel Serverless)

- One route per file in `/api`; dynamic segments via `[param].ts` files or query params — Vercel does not support `:id` style paths.
- Validate the request method (GET/POST) at the top of every handler.
- Parse and validate request bodies with Zod schemas; validate required env vars via the shared `api/_utils/env.ts` Zod schema.
- Every response uses the envelope `{ data, error, meta }` (see `references/api-contracts.md`). Never throw unhandled — try/catch and return a structured error.
- Set CORS headers via `api/_utils/cors.ts`.
- All external calls (Gmail, Calendar, Claude) use `AbortController` with a 15s timeout; set `maxDuration` on functions that call Claude.
- Claude responses: strip markdown code fences before `JSON.parse` (use `src/utils/strip-code-fences.ts` pattern).
- Cache Claude analysis results in Supabase; check cache (`last_analyzed`) before re-analyzing unchanged data.
- Gmail batch operations: respect 250 quota units/second with exponential backoff.
- Auth required on all routes except `/api/auth/login`, `/api/auth/callback`, `/api/health`.
