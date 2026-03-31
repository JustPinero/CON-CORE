# CON-CORE API Route Contracts

All routes are Vercel Serverless Functions in the `/api` directory. All responses follow the standard envelope:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: { totalSenders?: number; pagesScanned?: number; truncated?: boolean; cached?: boolean };
}
```

Auth is required on all routes except `/api/auth/login`, `/api/auth/callback`, and `/api/health`. Auth is validated by checking for a valid non-expired token in the `auth_tokens` table.

---

## Auth Routes

### GET /api/auth/login

Initiate Google OAuth2 authorization flow.

- **Auth required:** No
- **Request body:** None
- **Query params:** None
- **Response:** `302 Redirect` to Google OAuth consent screen
- **Response body:** None (redirect)

---

### GET /api/auth/callback

Handle OAuth2 callback from Google after user consent.

- **Auth required:** No
- **Request body:** None
- **Query params:**
  - `code` (string) — authorization code from Google
  - `state` (string) — CSRF state token
- **Response:** `302 Redirect` to app root on success, `/error` on failure
- **Side effect:** Stores encrypted tokens in `auth_tokens` table

---

### POST /api/auth/refresh

Refresh the Google OAuth2 access token using the stored refresh token.

- **Auth required:** Yes
- **Request body:** None
- **Response:**
```json
{
  "data": {
    "expiresAt": "2026-04-01T12:00:00Z"
  },
  "error": null
}
```

---

### GET /api/auth/status

Check whether a valid (non-expired) token exists in `auth_tokens`.

- **Auth required:** No
- **Request body:** None
- **Query params:** None
- **Response:**
```json
{
  "data": {
    "authenticated": true,
    "tokenExpired": false
  },
  "error": null
}
```
  - `tokenExpired` is only present when `authenticated` is `true`

---

## Gmail Routes

### GET /api/gmail/senders

List unique senders with message counts, aggregated by scanning inbox pages.

- **Auth required:** Yes
- **Query params:** None
- **Response:**
```json
{
  "data": [
    {
      "senderAddress": "noreply@example.com",
      "senderName": "Example Co",
      "messageCount": 142
    }
  ],
  "error": null,
  "meta": { "totalSenders": 237, "pagesScanned": 4, "truncated": false }
}
```

---

### POST /api/gmail/batch-delete

Batch delete all emails from a given sender.

- **Auth required:** Yes
- **Request body:**
```json
{
  "senderAddress": "noreply@example.com"
}
```
- **Response:**
```json
{
  "data": {
    "deleted": 87,
    "failed": 0
  },
  "error": null
}
```

---

### POST /api/gmail/batch-archive

Batch archive (remove from INBOX) all emails from a given sender.

- **Auth required:** Yes
- **Request body:**
```json
{
  "senderAddress": "noreply@example.com"
}
```
- **Response:**
```json
{
  "data": {
    "archived": 23,
    "failed": 0
  },
  "error": null
}
```

---

### POST /api/gmail/unsubscribe

Check for a `List-Unsubscribe` header on the sender's most recent message, and optionally follow the unsubscribe URL.

- **Auth required:** Yes
- **Request body:**
```json
{
  "senderAddress": "noreply@example.com",
  "action": "execute"
}
```
  - `action` (string, optional) — pass `"execute"` to follow the unsubscribe URL server-side
- **Response:**
```json
{
  "data": {
    "hasUnsubscribe": true,
    "unsubscribeUrl": "https://example.com/unsub?token=abc",
    "executed": true
  },
  "error": null
}
```
  - `executed` is only present when `action: "execute"` was passed

---

## Calendar Routes

### GET /api/calendar/events

List calendar events in a date range.

- **Auth required:** Yes
- **Query params:**
  - `timeMin` (string, ISO 8601, required)
  - `timeMax` (string, ISO 8601, required)
  - `calendarId` (string, optional, default "primary")
- **Response:**
```json
{
  "data": [
    {
      "id": "google-event-id",
      "summary": "Team standup",
      "start": "2026-04-01T09:00:00Z",
      "end": "2026-04-01T09:30:00Z",
      "calendarId": "primary"
    }
  ],
  "error": null,
  "meta": { "count": 12 }
}
```

---

### POST /api/calendar/batch-create

Create multiple calendar events from a schedule template.

- **Auth required:** Yes
- **Request body:**
```json
{
  "events": [
    { "summary": "Deep Work", "start": "2026-04-01T09:00:00Z", "end": "2026-04-01T10:00:00Z", "calendarId": "primary" }
  ]
}
```
  - `events` (array, required) — each item: `summary` (string), `start` (ISO 8601), `end` (ISO 8601), `calendarId` (string, optional)
- **Response:**
```json
{
  "data": {
    "created": 15,
    "failed": 0,
    "total": 15
  },
  "error": null
}
```

---

### POST /api/calendar/conflicts

Check for scheduling conflicts before batch creation.

- **Auth required:** Yes
- **Request body:**
```json
{
  "events": [
    { "summary": "Deep Work", "start": "2026-04-01T09:00:00Z", "end": "2026-04-01T10:00:00Z" }
  ],
  "calendarId": "primary"
}
```
  - `events` (array, required) — each item: `summary` (string), `start` (ISO 8601), `end` (ISO 8601)
  - `calendarId` (string, optional, default "primary")
- **Response:**
```json
{
  "data": {
    "conflicts": [
      {
        "proposed": { "summary": "Deep Work", "start": "2026-04-01T09:00:00Z", "end": "2026-04-01T10:00:00Z" },
        "existing": { "summary": "Team standup", "start": "2026-04-01T09:00:00Z", "end": "2026-04-01T09:30:00Z" }
      }
    ],
    "hasConflicts": true
  },
  "error": null
}
```

---

## Claude Routes

### POST /api/claude/analyze-sender

Fetch a sample of a sender's email subjects, send them to Claude for categorization, and cache the result. Returns from cache if analyzed within the last 7 days.

- **Auth required:** Yes
- **Request body:**
```json
{
  "senderAddress": "noreply@example.com",
  "forceRefresh": false
}
```
  - `forceRefresh` (boolean, optional) — bypass the 7-day cache and re-analyze
- **Response:**
```json
{
  "data": {
    "senderAddress": "noreply@example.com",
    "categoryBreakdown": {
      "promo": 70,
      "transactional": 20,
      "work": 0,
      "personal": 0,
      "newsletter": 10,
      "system": 0
    },
    "dossier": "RETAIL ELECTRONICS PROMOTIONS — WEEKLY DEALS",
    "sampledMessages": 20
  },
  "error": null,
  "meta": { "cached": true }
}
```
  - `meta.cached` is only present (and `true`) when the result was served from cache

---

### POST /api/claude/categorize-bookmarks

Use Claude to categorize a list of bookmarks.

- **Auth required:** Yes
- **Request body:**
```json
{
  "bookmarks": [
    { "url": "https://example.com/article", "title": "How to do X" },
    { "url": "https://example.com/tool", "title": "Cool dev tool" }
  ]
}
```
- **Response:**
```json
{
  "data": [
    {
      "name": "tutorials",
      "bookmarks": [
        { "id": 1, "url": "https://example.com/article", "title": "How to do X", "vault": "tutorials", "status": "alive", "dupeCount": 0 }
      ]
    },
    {
      "name": "dev-tools",
      "bookmarks": [
        { "id": 2, "url": "https://example.com/tool", "title": "Cool dev tool", "vault": "dev-tools", "status": "alive", "dupeCount": 0 }
      ]
    }
  ],
  "error": null,
  "meta": { "totalBookmarks": 2, "vaultCount": 2, "chunksProcessed": 1 }
}
```

---

### POST /api/claude/detect-subscriptions

Use Claude to find recurring subscriptions in email receipts.

- **Auth required:** Yes
- **Request body:** `{}` (empty — server fetches receipt emails from Gmail directly)
- **Response:**
```json
{
  "data": [
    {
      "serviceName": "Netflix",
      "monthlyCost": 15.49,
      "category": "streaming",
      "detectedSince": "2026-01-01",
      "lastCharge": "2026-03-01"
    }
  ],
  "error": null
}
```

---

### POST /api/claude/audit-passwords

Analyze a password CSV for reuse, weakness, and age. Response only — results are NEVER stored in the database.

- **Auth required:** Yes
- **Request body:**
```json
{
  "entries": [
    { "site": "example.com", "username": "user@email.com", "passwordHash": "sha256-of-password", "lastChanged": "2024-01-01" }
  ]
}
```
- **Response:**
```json
{
  "data": {
    "totalEntries": 150,
    "reuseGroups": [
      { "sites": ["example.com", "another.com"], "riskLevel": "critical" }
    ],
    "weakPasswords": [
      { "site": "example.com", "reason": "common-pattern" }
    ],
    "stalePasswords": [
      { "site": "example.com", "lastChanged": "2024-01-01", "ageDays": 820 }
    ],
    "overallScore": 42
  },
  "error": null
}
```

**Security note:** Raw passwords never leave the client. The client hashes passwords before sending. Results exist only in the API response and React state — never persisted.

---

### POST /api/claude/briefing

Generate a daily inbox briefing summary.

- **Auth required:** Yes
- **Request body:**
```json
{
  "recentSenders": [
    { "senderAddress": "boss@work.com", "senderName": "Boss", "messageCount": 3, "category": "work" }
  ],
  "unreadCount": 47,
  "topCategories": { "promo": 20, "work": 15, "newsletter": 12 }
}
```
- **Response:**
```json
{
  "data": {
    "briefing": "INCOMING TRANSMISSION...\n\n47 unread messages detected...",
    "highlights": [
      { "senderName": "Boss", "messageCount": 3, "urgency": "high" }
    ],
    "recommendedActions": [
      { "action": "batch-archive", "target": "promo", "count": 20 }
    ]
  },
  "error": null
}
```

---

### POST /api/claude/detect-contacts-dupes

Use Claude to find duplicate contacts across sources.

- **Auth required:** Yes
- **Request body:**
```json
{
  "contacts": [
    { "id": "uuid-1", "name": "John Smith", "email": "john@example.com", "phone": "555-0100", "source": "gmail" },
    { "id": "uuid-2", "name": "J. Smith", "email": "john.smith@work.com", "phone": "555-0100", "source": "phone" }
  ]
}
```
- **Response:**
```json
{
  "data": {
    "duplicateGroups": [
      {
        "groupId": "uuid",
        "contacts": ["uuid-1", "uuid-2"],
        "confidence": 0.92,
        "matchReasons": ["same-phone", "similar-name"]
      }
    ],
    "totalGroups": 1
  },
  "error": null
}
```

---

## Health

### GET /api/health

Health check endpoint. No auth required.

- **Auth required:** No
- **Request body:** None
- **Response:**
```json
{
  "data": {
    "status": "ok"
  },
  "error": null,
  "meta": {
    "timestamp": "2026-03-31T12:00:00Z"
  }
}
```
