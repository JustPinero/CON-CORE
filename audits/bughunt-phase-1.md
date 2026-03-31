# BugHunt — Phase 1 Foundation

**Date:** 2026-03-31
**Scope:** All Phase 1 source files (src/, api/)
**Status:** 2 Critical · 4 Warning · 4 Info

---

## Critical

### BUG-1 · CSRF — OAuth callback accepts any `code` with no state parameter
**File:** `api/auth/callback.ts` lines 1–52
**Category:** Security / CSRF

The `/api/auth/callback` handler exchanges the `code` query param for tokens but never validates an OAuth `state` parameter. Any page that can force the browser to hit `/api/auth/callback?code=<victim_code>` can hijack the OAuth flow and store stolen tokens. Google's OAuth 2.0 spec requires a `state` nonce generated at login time and verified on callback.

**Suggested fix:**
1. In `api/auth/login.ts`, generate a cryptographically random `state` value, store it in a short-lived HttpOnly session cookie, and pass it to `generateAuthUrl({ …, state })`.
2. In `api/auth/callback.ts`, read `req.query.state`, compare it to the cookie value, and return `error(res, 400, 'Invalid state')` on mismatch before calling `client.getToken()`.

---

### BUG-2 · Open redirect — callback redirect URL is attacker-controllable
**File:** `api/auth/callback.ts` line 47
**Category:** Security / Open Redirect

```ts
const redirectUrl = process.env.GOOGLE_REDIRECT_URI?.replace('/api/auth/callback', '') || '/'
```

`GOOGLE_REDIRECT_URI` is an env var, so in practice it is fixed — but the logic is fragile. If `GOOGLE_REDIRECT_URI` is ever set to a value where `/api/auth/callback` does not appear (e.g. a bare domain with a trailing slash), `.replace()` is a no-op and the full URI — including `/api/auth/callback` — is used as the redirect destination, which is a harmless but broken redirect. More importantly, this pattern becomes exploitable if the value is ever sourced from user input elsewhere. The redirect target should be hardcoded or validated against an allow-list.

**Suggested fix:** Replace the string manipulation with a hardcoded constant (e.g. `process.env.APP_BASE_URL || '/'`) that is validated by `env.ts`.

---

## Warning

### BUG-3 · No timeout on any fetch call — `checkAuthStatus` and `refreshToken` can hang forever
**File:** `src/services/auth.ts` lines 24–43
**Category:** API misuse / Missing timeout

Neither `checkAuthStatus` nor `refreshToken` pass an `AbortController` / `signal` with a timeout. On a slow or unreachable network the UI will spin in the `loading: true` state indefinitely because `setLoading(false)` is only called inside the async callback, which never resolves.

**Suggested fix:** Wrap both fetches with a timeout signal:
```ts
const controller = new AbortController()
const id = setTimeout(() => controller.abort(), 8000)
try {
  const res = await fetch('/api/health', { signal: controller.signal })
  …
} finally {
  clearTimeout(id)
}
```

---

### BUG-4 · `useAuth` skips the network check when already locally flagged — stale auth state
**File:** `src/hooks/useAuth.ts` lines 32–37
**Category:** Logic error / Stale state

```ts
if (checkLocal()) {
  setLoading(false)
} else {
  check()
}
```

Once `sessionStorage` has `con-core-auth=1` the hook never contacts `/api/health`. If the server-side session has expired or tokens have been revoked, the UI shows the user as authenticated and station nav works — but every API call will silently fail with a 401. The local flag should only be used to set the initial optimistic value; the network check should always run.

**Suggested fix:** Always call `check()`, but initialise `authenticated` from `checkLocal()` so the UI is optimistic while the network check is in-flight.

---

### BUG-5 · `api/auth/refresh.ts` — failed Supabase update is silently ignored
**File:** `api/auth/refresh.ts` lines 40–45
**Category:** Unhandled error / Data integrity

```ts
await supabase
  .from('auth_tokens')
  .update({ … })
  .eq('id', 'primary')
```

The return value (which contains `{ error }`) is not captured. If the update fails, the function still returns `success(res, { tokenExpiry: expiry })`, so the caller believes the token was persisted when it was not. Subsequent requests will continue to use the stale encrypted token.

**Suggested fix:** Destructure `{ error: updateError }` from the `await` result and `return error(res, 500, …)` if it is non-null.

---

### BUG-6 · CORS wildcard on `/api/health` — overly permissive in a credentialed context
**File:** `api/_utils/cors.ts` lines 3–6, `api/health.ts`
**Category:** Security / CORS misconfiguration

`Access-Control-Allow-Origin: *` is set globally. While `health.ts` is a low-sensitivity endpoint today, the same `cors.ts` utility will be imported by future sensitive API routes. A wildcard origin is incompatible with `credentials: 'include'` (cookies) — the browser will refuse credentialed cross-origin requests — and it allows any third-party site to read health-check data. This should be an explicit allow-list.

**Suggested fix:** Replace the wildcard with the value of `process.env.APP_BASE_URL` (validated in `env.ts`) and add it to the env schema now.

---

## Info

### BUG-7 · `SESSION_KEY` is not exported from `BootSequence.tsx` via the barrel — named export only at bottom
**File:** `src/components/BootSequence.tsx` line 101, `src/App.tsx` line 6
**Category:** Info / Code style

`SESSION_KEY` is exported as a named export at the bottom of the file after the default export. This works but is unconventional; consumers importing from BootSequence may expect all exports to be at the top or via a barrel. Low risk, but worth normalising.

---

### BUG-8 · `getSupabaseAdmin()` creates a new client on every call — no singleton
**File:** `api/_utils/supabase.ts`
**Category:** Info / Performance

Every API handler that calls `getSupabaseAdmin()` instantiates a new Supabase client. For Vercel serverless this is usually acceptable (cold-start per request), but if the module is ever shared between concurrent calls within a warm instance it wastes connections. A module-level singleton is the standard pattern.

---

### BUG-9 · `validateEnv()` is defined but never called in any API handler
**File:** `api/_utils/env.ts`, `api/auth/login.ts`, `api/auth/callback.ts`, `api/auth/refresh.ts`, `api/health.ts`
**Category:** Info / Operational

`validateEnv()` performs Zod validation of all required env vars and will throw a clear error on misconfiguration. None of the handlers call it, so a misconfigured deployment will produce cryptic downstream errors (e.g. "Missing Google OAuth environment variables") instead of a single upfront failure. Should be called at the top of each handler or in a shared entry point.

---

### BUG-10 · `encrypt()` key derivation truncates `SESSION_SECRET` to first 32 bytes
**File:** `api/_utils/crypto.ts` lines 5–10
**Category:** Info / Weak key derivation

```ts
return Buffer.from(secret.slice(0, 32), 'utf-8')
```

If `SESSION_SECRET` is longer than 32 characters the extra entropy is silently discarded. For AES-256 the key must be exactly 32 bytes, but using a raw UTF-8 slice (rather than HKDF or SHA-256) means the effective key space is limited to printable ASCII in the first 32 characters. Not currently exploitable, but should be replaced with proper key derivation:
```ts
import { createHash } from 'crypto'
return createHash('sha256').update(secret).digest()
```
