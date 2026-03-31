---
name: bughunt
description: "Run after phase completion or on demand. Searches for logic errors, race conditions, unhandled states, and security issues."
---

# BugHunt Skill

## Scope
- **Quick mode**: Files touched in the target phase
- **Deep mode**: Specified area or full codebase

## Procedure
1. Read all files in scope
2. Check for each bug category:
   - **Logic errors**: wrong conditions, off-by-one, null access, type coercion
   - **Race conditions**: async operations without proper sequencing, stale closures
   - **Unhandled states**: missing loading/error/empty states, unhandled promise rejections
   - **Security**: XSS vectors, injection, secrets in client code, CSRF, unvalidated input
   - **API misuse**: Gmail rate limit violations, missing error handling on API calls, missing AbortController timeouts
   - **Data integrity**: missing validation before Supabase writes, orphaned records
3. Score findings by priority
4. Generate report and fix requests

## Scoring
- **Critical** = Blocks next phase. Data loss, security vulnerability, crash, secret exposure.
- **Warning** = Fix soon. Wrong behavior, silent failure, bad UX, rate limit violation.
- **Info** = Minor. Cosmetic, non-blocking, nice-to-fix.

## Output
1. Report → `audits/bughunt-phase-N.md`
2. Fix requests → `requests/phase-N-fixes/fix-bug-[desc].md`

## Blocking Rule
Any **Critical** finding blocks the next phase until resolved.

## CON-CORE-Specific Checks
- Password/security data never written to Supabase or localStorage
- Google OAuth tokens encrypted before storage
- Claude API key never in client-side code or VITE_* vars
- All VITE_* vars checked for accidental secret inclusion
- Gmail batch operations respect 250 quota units/second limit
- AbortController timeout on all Claude API calls
