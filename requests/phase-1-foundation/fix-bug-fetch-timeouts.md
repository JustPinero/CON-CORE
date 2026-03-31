# Fix: Add AbortController timeouts to auth fetch calls (BUG-3)

**Severity:** Warning
**File:** `src/services/auth.ts`

## Problem
`checkAuthStatus()` and `refreshToken()` call `fetch()` without a timeout. On a slow or dead network the UI hangs with `loading: true` indefinitely.

## Required Changes

### `src/services/auth.ts`

Wrap both fetch calls with a timeout:

```ts
export async function checkAuthStatus(): Promise<boolean> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch('/api/health', { signal: controller.signal })
    if (!res.ok) return false
    const json = await res.json()
    const authenticated = json.data?.authenticated === true
    setAuthenticated(authenticated)
    return authenticated
  } catch {
    return false
  } finally {
    clearTimeout(id)
  }
}

export async function refreshToken(): Promise<boolean> {
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), 8000)
  try {
    const res = await fetch('/api/auth/refresh', { method: 'POST', signal: controller.signal })
    return res.ok
  } catch {
    return false
  } finally {
    clearTimeout(id)
  }
}
```

## Acceptance Criteria
- [ ] Both fetch calls have an 8-second AbortController timeout
- [ ] `loading` is set to `false` within 8 seconds even if the server is unreachable
