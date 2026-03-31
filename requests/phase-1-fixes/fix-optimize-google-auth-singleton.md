# Fix: OAuth2Client singleton in `api/_utils/google-auth.ts`

## Problem
`getOAuth2Client()` constructs a new `OAuth2Client` on every call, allocating objects and re-reading env vars for every API request.

## Change
Add a module-level singleton for the base client configuration. Note: `refresh.ts` calls `client.setCredentials()` which mutates the client, so callers that need to set credentials should do so on the returned instance each time (which is fine — `setCredentials` only assigns to an in-memory field).

```ts
import { OAuth2Client } from 'google-auth-library'

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.modify',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/contacts.readonly',
]

let _client: OAuth2Client | null = null

export function getOAuth2Client(): OAuth2Client {
  if (!_client) {
    const clientId = process.env.GOOGLE_CLIENT_ID
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET
    const redirectUri = process.env.GOOGLE_REDIRECT_URI
    if (!clientId || !clientSecret || !redirectUri) {
      throw new Error('Missing Google OAuth environment variables')
    }
    _client = new OAuth2Client(clientId, clientSecret, redirectUri)
  }
  return _client
}

export { SCOPES }
```

## Files
- `api/_utils/google-auth.ts` — replace with singleton pattern above

## Caveats
- Vercel serverless functions are stateless between cold starts, so the singleton lives only for the duration of a warm instance. This is the intended behavior.
- `refresh.ts` sets credentials on the returned client before use. This is safe because each request is sequential within its function invocation.
