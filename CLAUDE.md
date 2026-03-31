# CON-CORE — Consolidated Operations Core
A retro sci-fi CRT terminal for batch life-admin operations (email triage, calendar, bookmarks, subscriptions, passwords, contacts, files, tasks).
Open source under Coquí Labs. Solo engineer: Justin.

## Stack
Frontend: React + Vite + TypeScript | Backend: Vercel Serverless Functions | DB: Supabase PostgreSQL
Auth: Google OAuth2 (googleapis SDK) | AI: Claude API (claude-sonnet-4-20250514) | Testing: Vitest + RTL + Playwright
Commands: `npm run dev` | `npm run build` | `npm run test` | `npm run lint` | `npm run format`

## References (load on demand)
See @references/architecture.md for stack decisions and dependency log
See @references/schema.md for Supabase table definitions and data model
See @references/api-contracts.md for all API route specs ({data, error, meta} shape)
See @references/crt-design-system.md for CRT aesthetic: colors, typography, borders, scanlines, components

## Action Loop
### PRIME (never skip)
1. Read this file + check .claude/handoff.md (incorporate and delete if exists)
2. Read target request file from requests/ + referenced files from references/
3. Verify app is working: run tests. State understanding, files to touch, app status.
4. Write ZERO code until priming is complete.

### PLAN
1. Break request into atomic steps. Identify tests to write (TDD default, tests-after for visual).
2. Flag dependencies, new packages (justify each), reference doc updates needed.
3. Check references/ first — never reinvent existing work. If crosses concerns, split.

### EXECUTE
1. Write tests first (business logic, API, utils, terminal commands). Tests-after for visual components.
2. Implement until tests pass. Follow coding standards (.claude/skills/coding-standards/).
3. No commented-out code, no console.logs, no orphan TODOs.

### VALIDATE
1. Run `scripts/validate.sh` — this is the same script CI runs. Nothing should fail in CI that wasn't caught here.
2. Smoke test feature end-to-end. Fix failures or generate fix request.
3. Commit with `[phase-X.Y] description`. Update audits/debt.md if shortcuts taken.
4. If last request in phase → run /phase-complete.

## Top 5 Standards
1. ALL UI labels/headings/buttons UPPERCASE. Monospace only. CRT palette only (#33ff33/#22aa22/#1a661a/#0a1a0a/#ff5555/#ffaa00).
2. Every station GUI action must have a matching Terminal command (enforced by tests).
3. Password/security data: React state only. NEVER persisted. Cleared on unmount.
4. API responses: always `{ data, error, meta }`. Claude responses: strip markdown fences before JSON.parse.
5. Cache Claude API results in Supabase. AbortController timeout (15s) on all external calls.

## Testing Protocol
**Tests first**: business logic, API routes, utils, terminal commands, parsers.
**Tests after**: CRT visuals, animations, layout chrome — but tests written before request is done.
**Never optional**: no request is complete without tests. Terminal parity tests required for every station action.

## Git Workflow
Branch per phase: `phase-N-name`. Commit per request: `[phase-X.Y] description`. Main always stable.
Merge to main only after phase-end audits pass (/phase-complete).

## Compaction Instructions
When compacting, preserve: current phase, current request, files modified this session,
test status (passing/failing + which), and any blocking audit findings.

## Commit Format & Definition of Done
Format: `[phase-X.Y] description` (e.g., `[phase-1.3] add homepage station grid`)
Done = tests pass + validate.sh passes + feature works end-to-end + no Critical audit findings + reference docs updated if needed.
