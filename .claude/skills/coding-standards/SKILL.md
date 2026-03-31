---
name: coding-standards
description: "Full coding standards reference. Load when writing or reviewing code."
---

# Coding Standards

## Universal Standards
- Explicit over implicit. Name things clearly.
- One concern per function. If it does two things, split it.
- All async code handles errors explicitly (try/catch or .catch).
- Validate all external data (API responses, user input) before DB writes or business logic.
- Consistent API response shape: `{ data, error, meta }` on all routes.
- No magic numbers or strings. Constants get names.
- Every new dependency must be justified and logged in `references/architecture.md`.
- Accessibility: native HTML elements first, keyboard nav, aria attributes where needed.
- Soft deletes on user data. Use `deleted_at` timestamp, never hard delete.
- All timestamps in UTC (use `new Date().toISOString()`).
- No commented-out code in commits.
- No `console.log` in committed code (use structured logging if needed).
- No placeholder TODOs without a corresponding entry in `audits/debt.md`.

## TypeScript Standards
- Strict mode enabled (`"strict": true` in tsconfig).
- Prefer `interface` over `type` for object shapes (unless union/intersection needed).
- No `any` — use `unknown` and narrow, or define the type.
- Use `as const` for literal objects and string unions.
- Exhaustive switch statements with `never` default.
- Prefer named exports over default exports.
- Barrel exports (`index.ts`) only at module boundaries, not within modules.

## React Standards
- Functional components only. No class components.
- Custom hooks for shared stateful logic (prefix with `use`).
- Props interfaces named `[Component]Props`.
- Avoid prop drilling beyond 2 levels — use context or composition.
- `useEffect` dependencies must be exhaustive (lint rule enforced).
- Memoize expensive computations with `useMemo`, callbacks with `useCallback` — but only when there's a measured need.
- Event handlers named `handle[Event]` (e.g., `handleClick`, `handleSubmit`).

## Vercel Serverless Standards
- Each API route is a single file in `/api` directory.
- Always validate request method (GET/POST) at the top.
- Parse and validate request body with Zod schemas.
- Return consistent `{ data, error, meta }` response shape.
- Set appropriate CORS headers.
- Handle errors with try/catch, return structured error responses (never throw unhandled).
- Use `AbortController` with 15s timeout on all external API calls (Gmail, Calendar, Claude).

## Supabase Standards
- Use `@supabase/supabase-js` client.
- Server-side: use service_role key (never expose to client).
- Client-side: use anon key with RLS policies (if needed).
- Always check `.error` on Supabase responses before using `.data`.
- Use parameterized queries (the JS client handles this automatically).
- Connection string must include `?pgbouncer=true` for serverless pooling.

## CON-CORE-Specific Standards
- ALL UI text in labels, headings, buttons, status messages: **UPPERCASE**.
- Body/detail text (email subjects, bookmark titles): mixed case allowed.
- Color palette strictly: `#33ff33` (primary), `#22aa22` (secondary), `#1a661a` (tertiary), `#0a1a0a` (background), `#ff5555` (danger), `#ffaa00` (warning). No other colors.
- All borders: 1-2px solid, no rounded corners anywhere (`border-radius: 0`).
- Typography: Courier New / monospace only. No exceptions.
- Every station component renders inside the shared Shell chrome (header + footer).
- Terminal commands must mirror every GUI action 1:1. If a button exists, a command exists. Enforced by tests.
- Password/security data: React state only. Never in Supabase, localStorage, or cookies. Cleared on component unmount.
- Claude API responses: always strip markdown code fences before `JSON.parse`.
- Gmail batch operations: respect 250 quota units/second with exponential backoff.
- Cache Claude API analysis results in Supabase — never re-analyze unchanged data.
