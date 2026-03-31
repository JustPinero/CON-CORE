# Fix: Supabase client singleton in `api/_utils/supabase.ts`

## Problem
`getSupabaseAdmin()` calls `createClient()` unconditionally on every invocation. Every API request that touches Supabase allocates a fresh client, re-parses config, and wastes memory.

## Change
Refactor `api/_utils/supabase.ts` to use a module-level singleton with lazy initialization:

```ts
import { createClient } from '@supabase/supabase-js'

let _client: ReturnType<typeof createClient> | null = null

export function getSupabaseAdmin() {
  if (!_client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) {
      throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    }
    _client = createClient(url, key)
  }
  return _client
}
```

## Files
- `api/_utils/supabase.ts` — replace entire file with singleton pattern above

## Testing
- `api/auth/callback.ts` and `api/auth/refresh.ts` must continue to work end-to-end
- No functional change to callers; only the allocation behavior changes
