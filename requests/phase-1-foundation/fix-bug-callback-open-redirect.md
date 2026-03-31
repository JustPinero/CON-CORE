# Fix: Harden post-OAuth redirect URL (BUG-2)

**Severity:** Critical
**File:** `api/auth/callback.ts` line 47

## Problem
The post-auth redirect target is derived by string-replacing `/api/auth/callback` out of `GOOGLE_REDIRECT_URI`. If the env var doesn't contain that substring the full URI is used verbatim, producing a broken or potentially open redirect.

## Required Changes

### `api/_utils/env.ts`
Add `APP_BASE_URL` to the Zod schema:
```ts
APP_BASE_URL: z.string().url(),
```

### `api/auth/callback.ts`
Replace:
```ts
const redirectUrl = process.env.GOOGLE_REDIRECT_URI?.replace('/api/auth/callback', '') || '/'
```
With:
```ts
const redirectUrl = process.env.APP_BASE_URL || '/'
```

## Acceptance Criteria
- [ ] `APP_BASE_URL` is in the env schema and validated at startup
- [ ] Callback always redirects to `APP_BASE_URL`, not a derived value
- [ ] `.env.example` documents `APP_BASE_URL`
