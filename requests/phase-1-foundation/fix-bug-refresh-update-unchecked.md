# Fix: Check return value of Supabase update in refresh handler (BUG-5)

**Severity:** Warning
**File:** `api/auth/refresh.ts` lines 40–45

## Problem
The Supabase `.update()` call's return value is discarded with `await` but no destructuring. If the DB write fails, the endpoint still returns 200 with a token expiry, so the client believes the refresh succeeded when the new access token was never persisted.

## Required Changes

### `api/auth/refresh.ts`

Replace:
```ts
await supabase
  .from('auth_tokens')
  .update({ … })
  .eq('id', 'primary')
```

With:
```ts
const { error: updateError } = await supabase
  .from('auth_tokens')
  .update({
    access_token_encrypted: encryptedAccess,
    token_expiry: expiry,
    updated_at: new Date().toISOString(),
  })
  .eq('id', 'primary')

if (updateError) {
  return error(res, 500, `Failed to persist refreshed token: ${updateError.message}`)
}
```

## Acceptance Criteria
- [ ] Supabase update error is captured and causes a 500 response
- [ ] Client does not receive a success response when the token write failed
