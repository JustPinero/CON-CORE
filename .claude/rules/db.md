---
paths:
  - "api/**/*.ts"
---
# Supabase Rules

- Server-side only: use `SUPABASE_SERVICE_ROLE_KEY` via `api/_utils/supabase.ts`. Never expose it client-side; never use the anon key for server admin ops.
- Always check `.error` on Supabase responses before using `.data` — RLS misconfiguration returns empty results silently.
- Connection string must include `?pgbouncer=true` (port 6543) for serverless pooling — never the direct 5432 connection from functions.
- Soft deletes on user data: set `deleted_at`, never hard delete.
- All timestamps UTC (`new Date().toISOString()`).
- Schema changes: update `references/schema.md` in the same request.
