# CON-CORE API Route Contracts

All routes are Vercel Serverless Functions in the `/api` directory. All responses follow the standard envelope:

```typescript
interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  meta?: { count?: number; page?: number; cached?: boolean };
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

## Gmail Routes

### GET /api/gmail/senders

List unique senders with message counts and category breakdowns.

- **Auth required:** Yes
- **Query params:**
  - `limit` (number, optional, default 50)
  - `offset` (number, optional, default 0)
  - `sort` (string, optional: "count" | "name" | "last_analyzed", default "count")
- **Response:**
```json
{
  "data": [
    {
      "id": "uuid",
      "senderAddress": "noreply@example.com",
      "senderName": "Example Co",
      "messageCount": 142,
      "categoryBreakdown": { "promo": 100, "transactional": 42 },
      "lastAnalyzed": "2026-03-30T10:00:00Z",
      "unsubscribeVector": true,
      "dossierSummary": "E-commerce retailer..."
    }
  ],
  "error": null,
  "meta": { "count": 237 }
}
```

---

### POST /api/gmail/batch-delete

Batch delete emails by sender and optional category filter.

- **Auth required:** Yes
- **Request body:**
```json
{
  "senderAddress": "noreply@example.com",
  "category": "promotions",
  "olderThanDays": 30
}
```
- **Response:**
```json
{
  "data": {
    "deletedCount": 87,
    "senderAddress": "noreply@example.com"
  },
  "error": null
}
```

---

### POST /api/gmail/batch-archive

Batch archive emails by sender and optional category filter.

- **Auth required:** Yes
- **Request body:**
```json
{
  "senderAddress": "noreply@example.com",
  "category": "newsletters",
  "olderThanDays": 7
}
```
- **Response:**
```json
{
  "data": {
    "archivedCount": 23,
    "senderAddress": "noreply@example.com"
  },
  "error": null
}
```

---

### POST /api/gmail/unsubscribe

Execute unsubscribe action for a given sender.

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
    "success": true,
    "method": "list-unsubscribe-header",
    "senderAddress": "noreply@example.com"
  },
  "error": null
}
```

---

## Calendar Routes

### GET /api/calendar/events

List calendar events in a date range.

- **Auth required:** Yes
- **Query params:**
  - `startDate` (string, ISO 8601, required)
  - `endDate` (string, ISO 8601, required)
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
  "templateId": "uuid",
  "dates": ["2026-04-01", "2026-04-02", "2026-04-03"],
  "skipConflicts": true
}
```
- **Response:**
```json
{
  "data": {
    "createdCount": 15,
    "skippedCount": 3,
    "skippedDetails": [
      {
        "date": "2026-04-02",
        "timeBlock": "09:00-10:00",
        "conflictsWith": "Existing meeting"
      }
    ]
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
  "templateId": "uuid",
  "dates": ["2026-04-01", "2026-04-02"]
}
```
- **Response:**
```json
{
  "data": {
    "conflicts": [
      {
        "date": "2026-04-01",
        "timeBlock": { "start_time": "09:00", "end_time": "10:00", "label": "Deep Work" },
        "existingEvent": { "summary": "Team standup", "start": "09:00", "end": "09:30" }
      }
    ],
    "conflictCount": 1
  },
  "error": null
}
```

---

## Claude Routes

### POST /api/claude/analyze-sender

Use Claude to categorize a sender's emails.

- **Auth required:** Yes
- **Request body:**
```json
{
  "senderAddress": "noreply@example.com",
  "sampleSubjects": ["Your order has shipped", "Sale: 50% off today"],
  "sampleCount": 142
}
```
- **Response:**
```json
{
  "data": {
    "senderAddress": "noreply@example.com",
    "categoryBreakdown": { "promo": 100, "transactional": 42 },
    "dossierSummary": "E-commerce retailer sending promotional offers and order confirmations.",
    "unsubscribeVector": true
  },
  "error": null,
  "meta": { "cached": false }
}
```

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
  "data": {
    "categorized": [
      { "url": "https://example.com/article", "title": "How to do X", "category": "tutorials" },
      { "url": "https://example.com/tool", "title": "Cool dev tool", "category": "dev-tools" }
    ],
    "categoryList": ["tutorials", "dev-tools"]
  },
  "error": null
}
```

---

### POST /api/claude/detect-subscriptions

Use Claude to find recurring subscriptions in email receipts.

- **Auth required:** Yes
- **Request body:**
```json
{
  "receiptSubjects": [
    { "subject": "Your Netflix payment", "sender": "info@netflix.com", "date": "2026-03-01" },
    { "subject": "Spotify Premium receipt", "sender": "no-reply@spotify.com", "date": "2026-03-15" }
  ]
}
```
- **Response:**
```json
{
  "data": {
    "subscriptions": [
      {
        "serviceName": "Netflix",
        "monthlyCost": 15.49,
        "category": "streaming",
        "detectedSince": "2026-01-01T00:00:00Z",
        "lastCharge": "2026-03-01T00:00:00Z"
      }
    ]
  },
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
