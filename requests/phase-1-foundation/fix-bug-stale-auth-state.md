# Fix: Always run network auth check, don't skip when locally flagged (BUG-4)

**Severity:** Warning
**File:** `src/hooks/useAuth.ts` lines 32–37

## Problem
When `sessionStorage` has `con-core-auth=1`, the hook short-circuits and never contacts the API. If server-side tokens have expired or been revoked, the client stays stuck showing an authenticated UI while every API call fails with 401.

## Required Changes

### `src/hooks/useAuth.ts`

Change the `useEffect` logic so the network check always runs, but the initial state is optimistically set from `checkLocal()`:

```ts
useEffect(() => {
  let cancelled = false

  async function check() {
    const params = new URLSearchParams(window.location.search)
    if (params.has('auth') && params.get('auth') === 'success') {
      setAuthenticated(true)
      setLoading(false)
      return
    }

    const result = await checkAuthStatus()
    if (!cancelled) {
      setAuthenticated(result)
      setLoading(false)
    }
  }

  check() // always run — optimistic state already set from useState initialiser

  return () => {
    cancelled = true
  }
}, [])
```

The `useState` initialiser `useState<boolean>(checkLocal())` already provides the optimistic value, so `loading` can remain `true` until the network check completes.

## Acceptance Criteria
- [ ] Network check always fires on mount regardless of local flag
- [ ] If `/api/health` returns `authenticated: false`, local state and sessionStorage are updated
- [ ] `loading` resolves correctly after the network check
