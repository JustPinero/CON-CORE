# Fix: Replace CORS wildcard with explicit allow-list (BUG-6)

**Severity:** Warning
**File:** `api/_utils/cors.ts`

## Problem
`Access-Control-Allow-Origin: *` is incompatible with credentialed requests (cookies) and allows any origin to read API responses. As more endpoints are added this will silently break cookie-based auth and expose data to third-party sites.

## Required Changes

### `api/_utils/env.ts`
Add `APP_BASE_URL` to the schema (may already be added by BUG-2 fix):
```ts
APP_BASE_URL: z.string().url(),
```

### `api/_utils/cors.ts`

```ts
export function setCorsHeaders(res: VercelResponse) {
  const origin = process.env.APP_BASE_URL || ''
  res.setHeader('Access-Control-Allow-Origin', origin)
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Vary', 'Origin')
}
```

## Acceptance Criteria
- [ ] `Access-Control-Allow-Origin` is set to `APP_BASE_URL`, not `*`
- [ ] `Access-Control-Allow-Credentials: true` is present
- [ ] Requests from unlisted origins receive no `Access-Control-Allow-Origin` header
