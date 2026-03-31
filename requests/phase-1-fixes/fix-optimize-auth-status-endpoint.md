# Fix: Auth status check is broken — `/api/health` returns no `authenticated` field

## Problem
`src/services/auth.ts` `checkAuthStatus()` fetches `/api/health` and reads `json.data?.authenticated`. The health endpoint returns `{ data: { status: 'ok' }, error: null, meta: { timestamp: ... } }`. There is no `authenticated` field, so `json.data?.authenticated` is always `undefined`, meaning `authenticated` is always `false`.

This means `useAuth` will never detect a previously authenticated user via the network check. The local sessionStorage flag (`con-core-auth`) is set on OAuth callback success (redirect back to `/?auth=success`), so first-session auth works only because of the URL param branch in `useAuth`. Any session where sessionStorage is cleared will be silently treated as unauthenticated even if a valid token exists in Supabase.

## Change

### 1. Create `api/auth/status.ts`
New GET endpoint that reads the `auth_tokens` row and returns `{ authenticated: boolean, tokenExpiry: string | null }`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node'
import { handleCors } from '../_utils/cors'
import { success, error, methodNotAllowed } from '../_utils/response'
import { getSupabaseAdmin } from '../_utils/supabase'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  if (req.method !== 'GET') return methodNotAllowed(res, ['GET'])

  try {
    const supabase = getSupabaseAdmin()
    const { data: tokenRow } = await supabase
      .from('auth_tokens')
      .select('token_expiry')
      .eq('id', 'primary')
      .single()

    const authenticated = !!tokenRow
    const tokenExpiry = tokenRow?.token_expiry ?? null

    return success(res, { authenticated, tokenExpiry })
  } catch {
    return error(res, 500, 'Failed to check auth status')
  }
}
```

### 2. Update `src/services/auth.ts` `checkAuthStatus()`
Change fetch target from `/api/health` to `/api/auth/status`:

```ts
export async function checkAuthStatus(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/status')
    if (!res.ok) return false
    const json = await res.json()
    const authenticated = json.data?.authenticated === true
    setAuthenticated(authenticated)
    return authenticated
  } catch {
    return false
  }
}
```

### 3. Optional: Add in-flight deduplication
Prevent concurrent calls from firing multiple requests:

```ts
let _inFlight: Promise<boolean> | null = null

export async function checkAuthStatus(): Promise<boolean> {
  if (_inFlight) return _inFlight
  _inFlight = _doCheck().finally(() => { _inFlight = null })
  return _inFlight
}

async function _doCheck(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/status')
    if (!res.ok) return false
    const json = await res.json()
    const authenticated = json.data?.authenticated === true
    setAuthenticated(authenticated)
    return authenticated
  } catch {
    return false
  }
}
```

## Files
- `api/auth/status.ts` — new file
- `src/services/auth.ts` — update `checkAuthStatus()` fetch URL + optional deduplication
