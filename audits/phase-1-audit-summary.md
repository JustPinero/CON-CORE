# Phase 1 Audit Summary — 2026-03-31

## Test Audit: Grade C+
- 74 tests pass across 15 files
- Good coverage: Homepage, RetroButton, Shell, StatusBar, CommandRegistry, tokens
- Gaps: auth service functions (login/logout/checkAuthStatus untested), API routes (0 tests), terminal input tab/arrow paths, TabComplete longestCommonPrefix
- Recommendation: Add auth service mocked fetch tests and basic API route method-guard tests in Phase 2

## BugHunt: 2 Critical, 4 Warning, 4 Info
### Critical (FIXED)
- BUG-1: OAuth CSRF — added state parameter to login/callback with HttpOnly cookie
- BUG-2: Open redirect — replaced fragile URL replacement with explicit base URL derivation

### Warning (FIXED)
- BUG-3: No fetch timeout — added 8s AbortController on checkAuthStatus and refreshToken
- BUG-5: Supabase update error silently ignored — now checked and returns 500
- BUG-9: validateEnv() never called — now called in auth handlers

### Warning (DEFERRED)
- BUG-4: Stale auth state when sessionStorage is set but server token revoked — acceptable for single-user, will revisit if needed
- BUG-6: CORS wildcard — acceptable for dev, will lock to app URL before deploy

### Info (NOTED)
- BUG-7: SESSION_KEY export placement — cosmetic
- BUG-8: Supabase client singleton — FIXED (now cached)
- BUG-10: Crypto key derivation via raw slice — FIXED (now uses SHA-256 digest)

## Optimize: 4 High, 6 Medium, 6 Low
### High (FIXED)
- H1: Supabase client singleton — cached at module level
- H2: OAuth2Client singleton — cached at module level
- H3: Auth status broken (health endpoint) — created /api/auth/status endpoint
- H4: Crypto key re-allocation — cached with SHA-256 derivation

### Medium/Low (DEFERRED to Phase 2+)
- Inline styles, BootSequence re-renders, getAllCommands() array conversion, etc.

## Drift Audit: 4 files checked
### FIXED
- architecture.md: googleapis → google-auth-library
- schema.md: CategoryBreakdown keys aligned
- api-contracts.md: error type, health response, category keys aligned
- env-vars.md: TOKEN_ENCRYPTION_KEY → SESSION_SECRET, added missing vars

### PASS
- crt-design-system.md: no drift

## Conclusion
All 2 critical bugs and 2 blocking drift issues resolved. Phase 1 is COMPLETE.
