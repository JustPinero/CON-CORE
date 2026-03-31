# CON-CORE Deployment Landmines

Known gotchas, footguns, and non-obvious requirements for the stack. Read this before deploying.

---

## Vercel

### SPA Rewrite Rule

Vercel serves static files by default. Without a rewrite rule, refreshing any client-side route (e.g., `/inbox`) returns a 404. Add this to `vercel.json` at the project root:

```json
{
  "rewrites": [
    { "source": "/((?!api).*)", "destination": "/index.html" }
  ]
}
```

This rewrites all non-`/api` paths to `index.html`, letting React Router handle them. The negative lookahead `(?!api)` ensures serverless function routes are not intercepted.

### VITE_* Env Vars Are Build-Time Only

Variables prefixed with `VITE_` are replaced with their values at build time by Vite and baked directly into the JS bundle. They are visible to anyone who inspects your client-side code.

- NEVER put API keys, secrets, or service role keys in `VITE_*` variables
- Changing a `VITE_*` var requires a new build/deploy to take effect
- Server-side secrets must use non-prefixed variable names (accessed only in `/api` functions)

### Set Env Vars for ALL Environments

Vercel has three environments: **Production**, **Preview**, and **Development**. When adding env vars in the Vercel dashboard, check all three boxes. Forgetting Preview means branch deploys break silently.

### Serverless Function Constraints

- **Timeout:** 10 seconds by default on free tier. Can be extended to 60 seconds by adding `maxDuration` to the function config. Claude API calls may need this.
- **Path params:** Vercel serverless functions do not natively support `/api/users/:id` style routes. Use query parameters (`/api/users?id=xxx`) or file-based dynamic routes (`/api/users/[id].ts`).
- **Directory:** Functions MUST live in the `/api` directory at the project root. Nested directories are fine (e.g., `/api/gmail/senders.ts`).
- **Bundle size:** Each function is bundled independently. Watch for large dependencies inflating cold start times.

### Cold Starts

After a period of inactivity (varies, typically minutes), the first invocation of a serverless function takes 1-3 seconds to initialize. Subsequent invocations within the warm window are fast. This is noticeable on first app load after idle.

---

## Supabase

### Row Level Security (RLS)

RLS is enabled by default on all new tables. For a single-user app, you have two options:

1. **Disable RLS per table** (simpler): `ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;`
2. **Create permissive policies** (more defensive): Create a policy that allows all operations when using the service role key.

If you forget to handle RLS, all queries from the Supabase client will return empty results with no error — an extremely confusing silent failure.

### Connection Pooling for Serverless

Serverless functions open and close database connections on every invocation. Use the connection string with PgBouncer enabled:

```
postgresql://postgres:[password]@[host]:6543/postgres?pgbouncer=true
```

Note port `6543` (PgBouncer) vs `5432` (direct). Using the direct connection from serverless functions will exhaust the connection pool quickly.

### Service Role Key vs Anon Key

- **Server-side (`/api` functions):** Use `SUPABASE_SERVICE_ROLE_KEY`. This bypasses RLS and has full admin access.
- **Client-side (if ever needed):** Use the anon key. It respects RLS policies.
- Never expose the service role key in client-side code.

### Free Tier Limits

- 500 MB database storage
- 2 GB bandwidth per month
- 50,000 monthly active users
- 500 MB file storage
- Pauses after 1 week of inactivity (can be resumed from dashboard)

The inactivity pause is the sneakiest issue — if you do not use the app for a week, the database goes to sleep and API calls fail until you manually unpause it in the Supabase dashboard.

---

## Claude API

### Server-Side Only

The Anthropic API key (`sk-ant-*`) must NEVER be in client-side code. All Claude interactions go through the `/api/claude/*` proxy routes. The frontend calls your Vercel functions, which call Claude.

### Strip Markdown Code Fences from Responses

Claude frequently wraps JSON responses in markdown code fences even when asked not to:

````
```json
{"category": "promotions"}
```
````

Always strip these before parsing:

```typescript
function parseClaudeJson(text: string): unknown {
  const stripped = text.replace(/^```(?:json)?\n?/gm, '').replace(/\n?```$/gm, '');
  return JSON.parse(stripped.trim());
}
```

Failing to handle this will cause intermittent `JSON.parse` errors that are hard to reproduce.

### Request Timeouts

Claude API calls can take 5-30 seconds depending on prompt complexity. Always use an `AbortController` with a timeout:

```typescript
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 15000); // 15s default

try {
  const response = await anthropic.messages.create(
    { /* params */ },
    { signal: controller.signal }
  );
} finally {
  clearTimeout(timeout);
}
```

Also ensure the Vercel function timeout is set high enough (see Vercel section above).

### Rate Limiting

Implement two layers:
1. **Per-IP rate limit** — prevent abuse (e.g., 10 requests/minute per IP)
2. **Global daily cap** — prevent cost overruns (e.g., 200 calls/day total via `RATE_LIMIT_DAILY_CAP`)

Track call counts in Supabase or use Vercel KV if available.

### Cache Analysis Results

Claude analysis for the same sender/bookmark set will produce near-identical results. Cache successful responses in Supabase (e.g., in the `dossier_summary` and `category_breakdown` columns) and check the cache before making a new API call. Use `last_analyzed` timestamps to decide when to refresh.

### Model Selection

Use `claude-sonnet-4-20250514` for all analysis tasks. It is cost-effective for bulk categorization and summarization workloads. Do not use Opus for high-volume batch operations.

---

## General

### Validate Env Vars at Startup

Use Zod to validate all required environment variables at the top of each serverless function (or in a shared validation module). Exit immediately with a clear error message if any are missing:

```typescript
import { z } from 'zod';

const envSchema = z.object({
  SUPABASE_URL: z.string().url(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  ANTHROPIC_API_KEY: z.string().startsWith('sk-ant-'),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.string().url(),
  TOKEN_ENCRYPTION_KEY: z.string().length(64),
});

export const env = envSchema.parse(process.env);
```

### .env.example

Commit a `.env.example` file with all required variable names and no values. This serves as documentation and lets new setups identify missing variables immediately.

### Health Check

The `/api/health` endpoint should verify:
- Supabase connectivity (run a simple query)
- Environment variables are loaded
- Return `200 OK` with status and timestamp

Use this for uptime monitoring and deployment verification.

### Git Secrets Prevention

Before committing, check for accidentally staged secrets. Add a pre-commit check or manually grep:

```bash
# Check for common secret patterns in staged files
git diff --cached --name-only | xargs grep -l -E '(sk-ant-|sk-|ghp_|AKIA|supabase.*service_role|eyJhbGciOi)' || true
```

Consider using `git-secrets` or a `.pre-commit-config.yaml` hook to automate this.
