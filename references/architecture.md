# CON-CORE Architecture & Stack Decisions

## Frontend

- **Framework:** React + Vite + TypeScript
- **Rendering:** Single Page Application (SPA) — no SSR or SEO requirements
- **Styling:** CSS custom properties for CRT design system tokens, no CSS framework
- **State:** React state + context (no external state library unless complexity demands it)

## Backend

- **Runtime:** Vercel Serverless Functions
- **Structure:** API routes live in `/api` directory at project root
- **Language:** TypeScript (shared types with frontend)
- **Pattern:** Each function is a standalone serverless handler; no shared server process

## Database

- **Provider:** Supabase (PostgreSQL) — free tier
- **Why Supabase was chosen:**
  - Persistent storage compatible with serverless architecture (no connection state issues)
  - Secure storage for encrypted OAuth tokens
  - Native JSONB column support for category breakdowns and structured data
  - Simple JavaScript client (`@supabase/supabase-js`) with typed queries
  - Built-in connection pooling via PgBouncer
  - Free tier sufficient for single-user life-admin app

## Auth

- **Provider:** Google OAuth2 — direct integration via `googleapis` SDK
- **Flow:** Authorization code flow handled by `/api/auth/login` and `/api/auth/callback`
- **Token storage:** Access and refresh tokens stored encrypted in Supabase `auth_tokens` table
- **Scope:** Gmail read/modify, Calendar read/write

## Hosting

- **Platform:** Vercel — free tier
- **Domain:** Default Vercel subdomain (custom domain optional later)
- **Environments:** Production + Preview (per-branch deploys)

## Testing

- **Unit / Integration:** Vitest
- **Component Testing:** React Testing Library
- **End-to-End:** Playwright
- **Strategy:** Test critical paths (auth flow, batch operations, Claude parsing) first; visual CRT styling tested via e2e screenshots

## Key Integrations

| Integration | Purpose | Model / Version |
|---|---|---|
| Gmail API | Read, delete, archive emails; detect senders; unsubscribe | v1 |
| Google Calendar API | Read events, batch-create from templates, conflict detection | v3 |
| Anthropic Claude API | AI analysis for categorization, deduplication, briefings | claude-sonnet-4-20250514 |
| Chrome Bookmarks | Import bookmarks via JSON file export (client-side parsing) | N/A (file import) |

## Decisions Log

<!-- Record architectural decisions here as they arise. Format: -->
<!-- ### YYYY-MM-DD — Decision Title -->
<!-- **Context:** Why the decision was needed -->
<!-- **Decision:** What was decided -->
<!-- **Consequences:** What changes as a result -->
