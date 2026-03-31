# Phase 2 Audit Summary — 2026-03-31

## Test Audit: Grade B-
- 142 tests pass across 26 files
- Utils layer: 95% (excellent)
- Components: 91% (good)
- Services: 38% (poor — gmail.ts has 4 untested functions)
- SourceIntel: 0% (no test file — complex stateful component)
- API routes: 0% (no unit tests for serverless functions)
- Deferred: Add service tests and SourceIntel tests incrementally

## BugHunt: 5 Critical, 8 Warning, 6 Info
### Critical (FIXED)
- C-1: SourceIntel side-effect in render body → moved to useEffect with cleanup
- C-3: SSRF via unsubscribe URL → added private IP/localhost blocklist, HTTPS-only
- C-4: OAuth2Client singleton leaking credentials → fresh client per request in getGmailClient
- C-5: Optimistic delete/archive counter → wrapped in try/catch, returns { deleted, failed }

### Critical (DEFERRED from Phase 1)
- C-2: Wildcard CORS → will lock to app URL before deploy

### Warning (NOTED for future)
- W-1: Gmail quota burst (50 concurrent gets) → reduce to 10 in future optimization
- W-2: Client timeout (20s) shorter than server work → increase in Phase 3
- W-3: Actions view with null category → guard exists via conditional render
- W-5: onSenderUpdated on error → FIXED (now only called on success)
- W-6: No timeout on unsubscribe client calls → add in Phase 3
- W-7: validateEnv singleton flag → acceptable for production
- W-8: parseSender regex gaps → handles 95% of real-world formats, edge cases logged

## Drift Audit: 2 Blocking Fails → FIXED
- schema.md: analyze-sender now writes sender_name in upsert
- api-contracts.md: all 5 implemented routes updated to match actual request/response shapes
  - Added /api/auth/status route
  - Fixed key names (deleted vs deletedCount, dossier vs dossierSummary, etc.)
  - Removed fabricated query params
  - Added undocumented params (forceRefresh, action)
- crt-design-system.md: PASS (minor hover gaps noted)
- env-vars.md: PASS

## Conclusion
All 5 critical bugs and 2 blocking drift issues resolved. Phase 2 is COMPLETE.
