# Fix: Add OAuth state parameter to prevent CSRF (BUG-1)

**Severity:** Critical
**Files:** `api/auth/login.ts`, `api/auth/callback.ts`

## Problem
The OAuth flow has no `state` nonce. An attacker can trick a victim's browser into completing a CSRF-initiated login with a stolen authorization code, storing the attacker's tokens under the victim's session.

## Required Changes

### `api/auth/login.ts`
1. Generate a cryptographically random state value: `randomBytes(16).toString('hex')`
2. Store it in a short-lived HttpOnly, SameSite=Lax cookie (e.g. `oauth_state`, max-age 600 seconds)
3. Pass `state` to `client.generateAuthUrl({ …, state })`

### `api/auth/callback.ts`
1. Read `req.query.state` and the `oauth_state` cookie value
2. If either is missing or they do not match, return `error(res, 400, 'Invalid OAuth state')`
3. Clear the `oauth_state` cookie on success

## Acceptance Criteria
- [ ] Login handler sets `oauth_state` cookie with a random nonce
- [ ] Callback handler rejects requests where `req.query.state !== cookie`
- [ ] Callback clears the state cookie after validation
- [ ] Manually hitting `/api/auth/callback?code=foo` without a cookie returns 400
