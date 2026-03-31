# Optimize Audit — Phase 1 Foundation

**Date:** 2026-03-31
**Scope:** All Phase 1 source files (src/, api/)

---

## HIGH — Major improvement, user-visible impact

### H1 — `getSupabaseAdmin()` creates a new client on every API call
**File:** `api/_utils/supabase.ts`
**Category:** Performance / Caching

`getSupabaseAdmin()` calls `createClient()` unconditionally every time it is invoked. Every request to `/api/auth/callback` and `/api/auth/refresh` instantiates a fresh Supabase client, allocating memory and re-parsing the configuration. Supabase clients are safe to share across invocations in the same serverless function cold-start because they are stateless HTTP wrappers.

**Suggested fix:** Module-level singleton with lazy init:
```ts
let _client: ReturnType<typeof createClient> | null = null
export function getSupabaseAdmin() {
  if (!_client) {
    const url = process.env.SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY')
    _client = createClient(url, key)
  }
  return _client
}
```

---

### H2 — `getOAuth2Client()` creates a new OAuth2Client on every call
**File:** `api/_utils/google-auth.ts`
**Category:** Performance / Caching

Same pattern as H1. `login.ts`, `callback.ts`, and `refresh.ts` each call `getOAuth2Client()` fresh. OAuth2Client construction parses env vars and allocates objects each time.

**Suggested fix:** Module-level singleton, same lazy-init pattern as H1. Note: `refresh.ts` sets credentials on the client (`client.setCredentials`), so the singleton must have credentials reset before use, or a fresh credentials-only copy should be obtained from a shared base client.

---

### H3 — `checkAuthStatus()` uses `/api/health` as auth check — mismatched semantics and no caching
**Files:** `src/services/auth.ts`, `api/health.ts`
**Category:** API efficiency / Caching

`checkAuthStatus()` calls `/api/health`, which returns `{ status: 'ok' }` — it has no `authenticated` field. The client reads `json.data?.authenticated` which will always be `undefined`, so `authenticated` is always `false`. This is a **correctness bug masquerading as a performance issue**: users who have valid tokens stored in Supabase will never be recognized as authenticated via the health check.

Additionally, there is no debounce or in-flight deduplication: if multiple components call `useAuth()` simultaneously a race could fire multiple concurrent health requests.

**Suggested fix:**
1. Add a dedicated `/api/auth/status` endpoint that reads the `auth_tokens` row and returns `{ authenticated: boolean }`.
2. Or extend `/api/health` to include `authenticated` by checking for a valid, non-expired token row.
3. Add an in-flight promise cache in `checkAuthStatus()` to prevent duplicate concurrent requests.

---

### H4 — `crypto.ts` `getKey()` re-reads and slices `SESSION_SECRET` on every encrypt/decrypt call
**File:** `api/_utils/crypto.ts`
**Category:** Performance

`getKey()` is called inside both `encrypt()` and `decrypt()`, executing `Buffer.from(secret.slice(0, 32), 'utf-8')` every invocation. In `callback.ts` this runs twice (once for access token, once for refresh token), and in `refresh.ts` again twice. Allocating a new Buffer per call is unnecessary.

**Suggested fix:** Cache the key Buffer at module level (after first successful resolution):
```ts
let _key: Buffer | null = null
function getKey(): Buffer {
  if (!_key) {
    const secret = process.env.SESSION_SECRET
    if (!secret || secret.length < 32) throw new Error('SESSION_SECRET must be at least 32 characters')
    _key = Buffer.from(secret.slice(0, 32), 'utf-8')
  }
  return _key
}
```

---

## MEDIUM — Notable improvement, worth scheduling

### M1 — `BootSequence` re-renders on every tick via state increment
**File:** `src/components/BootSequence.tsx`
**Category:** Performance / Re-renders

The animation drives via `setVisibleLines(prev => prev + 1)`, causing a full re-render of all previously visible lines on every tick (up to 25 lines × 25 ticks = 625 total element creations). The array slice `BOOT_LINES.slice(0, visibleLines)` is recomputed and a new DOM subtree is diffed each tick.

This is low-stakes since BootSequence renders once per session and is unmounted immediately, but it sets a pattern worth addressing.

**Suggested fix:** Use a `ref` to append new `<div>` elements imperatively, or use `React.memo` on the line component to avoid re-creating the DOM for already-rendered lines.

---

### M2 — `SESSION_KEY` constant is duplicated between `BootSequence.tsx` and `App.tsx` import
**Files:** `src/components/BootSequence.tsx` (line 29 internal), `src/App.tsx` (imports `SESSION_KEY`)
**Category:** Duplication / Coupling

`BootSequence.tsx` defines `SESSION_KEY = 'con-core-booted'` locally and re-exports it. `App.tsx` imports it from `BootSequence`. This creates an odd dependency: the App's boot state logic depends on a constant that logically belongs to the auth/session domain, not the BootSequence UI component.

**Suggested fix:** Move `SESSION_KEY` to `src/services/auth.ts` or a new `src/utils/session.ts` constant. Both `BootSequence` and `App` import from that shared location.

---

### M3 — Inline style objects recreated on every render throughout all components
**Files:** `src/components/Homepage.tsx`, `src/components/Shell.tsx`, `src/components/BootSequence.tsx`, `src/stations/terminal/TerminalOutput.tsx`, `src/stations/terminal/TerminalInput.tsx`
**Category:** Performance / Re-renders

Every component passes inline `style={{ ... }}` objects directly in JSX. These create new object references on every render, bypassing React's shallow-equality bail-out for memoized children. The station grid in `Homepage` creates a new style object per `STATIONS.map` iteration (9 new objects per render).

**Suggested fix:** Extract static style objects to `const` declarations outside the component function. For per-item styles in maps, extract to a named function or a lookup object. This is especially important for `TerminalOutput` where the lines list can grow long.

---

### M4 — `HelpSystem.ts` uses `getAllCommands()` and linear scan for `getCommandHelp`
**File:** `src/stations/terminal/HelpSystem.ts`
**Category:** Performance / Complexity

`getCommandHelp()` calls `getAllCommands()` which returns `Array.from(commands.values())`, then `.find()` is called on the resulting array. Since `CommandRegistry` already stores commands in a `Map`, this is an unnecessary O(n) array scan. The same applies in `TabComplete.ts` which converts the Map to an array on every keypress.

**Suggested fix:** Export `getCommand(name)` directly from `CommandRegistry` and use it in `HelpSystem`. For `TabComplete`, cache `getAllCommands()` result or expose the Map's keys iterator directly.

---

### M5 — `google-auth-library` is a large dependency used only on the API side
**File:** `package.json`
**Category:** Bundle size

`google-auth-library` (~1.2 MB unpacked) is listed as a top-level production dependency. It is only ever imported in `api/_utils/google-auth.ts`, which runs in the Vercel serverless runtime, never in the browser bundle. Vite will tree-shake it from the client bundle as long as no client-side code imports it, which is currently true. However, placing it in `dependencies` rather than a server-only designation risks accidental client-side import as the codebase grows.

**Suggested fix:** Document with a comment in `package.json` or add a Vite alias/externals config to confirm `google-auth-library` is never bundled for the browser. Consider adding an ESLint rule to prevent client-side imports of server-only modules.

---

### M6 — `validateEnv()` call is missing from auth API handlers
**Files:** `api/auth/login.ts`, `api/auth/callback.ts`, `api/auth/refresh.ts`
**Category:** Complexity / Correctness

`api/_utils/env.ts` exports a `validateEnv()` function with a once-guard, but none of the auth handlers call it. Environment validation only happens if something explicitly calls it. Missing env vars will surface as cryptic runtime errors deep inside `getOAuth2Client()` or `getSupabaseAdmin()` rather than a clear startup error.

**Suggested fix:** Call `validateEnv()` at the top of each handler (or at module init), before any other logic executes.

---

## LOW — Minor cleanup, nice to have

### L1 — `TerminalOutput` uses array index as `key`
**File:** `src/stations/terminal/TerminalOutput.tsx` (line 20)
**Category:** Performance / Correctness

`lines.map((line, i) => <div key={i} ...>)` uses array index as key. When the CLEAR command empties the array and new lines are appended, React can't distinguish new elements from old, potentially causing incorrect reconciliation. Since lines are only ever appended or fully cleared, this is low risk currently but will become a real issue if lines are ever reordered or spliced.

**Suggested fix:** Add a monotonic `id` field to `OutputLine` (e.g., incrementing counter in `TerminalStation`) and use it as the key.

---

### L2 — `BOOT_LINES` array contains hardcoded station count ("9 STATIONS") that will drift
**File:** `src/components/BootSequence.tsx` (line 5)
**Category:** Complexity / Maintainability

The string `'LOADING MODULES [9 STATIONS]...'` hardcodes the station count. When stations are added in later phases this will be stale.

**Suggested fix:** Derive dynamically: `` `LOADING MODULES [${STATIONS.length} STATIONS]...` `` importing from `src/utils/types.ts`.

---

### L3 — `BootSequence` two separate `useEffect`s for event listeners vs. animation could be combined
**File:** `src/components/BootSequence.tsx`
**Category:** Complexity

The component has three hooks (`useState`, and two `useEffect`s) where the listener effect only depends on `skip`. The skip callback itself is `useCallback`. This is correct but slightly over-structured for a simple one-shot animation component.

**Suggested fix:** Low priority — acceptable as-is. If BootSequence is ever extended, consider a single `useEffect` that handles both the animation loop and event listeners, or a small state machine.

---

### L4 — `cors.ts` uses wildcard `Access-Control-Allow-Origin: *` in production
**File:** `api/_utils/cors.ts`
**Category:** Security / Complexity

Using `*` for CORS is fine for a public API but exposes all endpoints to cross-origin requests from any domain. Since this is a personal operations dashboard with Google OAuth, the origin should be locked to the known frontend URL.

**Suggested fix:** Read `NEXT_PUBLIC_APP_URL` or equivalent env var and set it as the allowed origin, falling back to `*` only in development.

---

### L5 — `StatusBar` recreates `colorMap` object on every render
**File:** `src/components/StatusBar.tsx`
**Category:** Performance

`const colorMap = { ... }` is declared inside the function body, creating a new object every render. StatusBar is rendered inside Shell which renders on every navigation.

**Suggested fix:** Move `colorMap` outside the component to a module-level constant.

---

### L6 — `Homepage` key event handler uses fragile F-key parsing
**File:** `src/components/Homepage.tsx` (lines 13-14)
**Category:** Complexity / Correctness

`parseInt(e.key.replace('F', ''), 10) - 1` will parse `'F'` alone as `NaN - 1 = NaN`, and `e.key.startsWith('F')` also matches `'F10'`, `'F11'`, `'F12'`, which would try to navigate to non-existent stations. The bounds check `fKeyIndex < STATIONS.length` prevents navigation, but `fKeyIndex >= 0` with `NaN` evaluates to `false`, so the `NaN` case is safe. The F10+ case navigates to undefined stations silently.

**Suggested fix:** Use a direct lookup map `const fKeyMap = Object.fromEntries(STATIONS.map((s, i) => [s.fkey, s]))` and look up `fKeyMap[e.key]` directly, eliminating the fragile string manipulation.

---

## Summary Table

| ID | File | Category | Impact |
|----|------|----------|--------|
| H1 | `api/_utils/supabase.ts` | Caching | High |
| H2 | `api/_utils/google-auth.ts` | Caching | High |
| H3 | `src/services/auth.ts` + `api/health.ts` | API correctness + caching | High |
| H4 | `api/_utils/crypto.ts` | Performance | High |
| M1 | `src/components/BootSequence.tsx` | Re-renders | Medium |
| M2 | `BootSequence.tsx` / `App.tsx` | Duplication | Medium |
| M3 | Multiple components | Re-renders | Medium |
| M4 | `HelpSystem.ts` / `TabComplete.ts` | Performance | Medium |
| M5 | `package.json` | Bundle clarity | Medium |
| M6 | `api/auth/*.ts` | Correctness | Medium |
| L1 | `TerminalOutput.tsx` | Correctness | Low |
| L2 | `BootSequence.tsx` | Maintainability | Low |
| L3 | `BootSequence.tsx` | Complexity | Low |
| L4 | `api/_utils/cors.ts` | Security | Low |
| L5 | `StatusBar.tsx` | Performance | Low |
| L6 | `Homepage.tsx` | Complexity | Low |
