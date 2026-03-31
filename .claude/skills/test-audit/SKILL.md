---
name: test-audit
description: "Run after phase completion or on demand. Evaluates test coverage, strategy, and quality."
---

# Test Audit Skill

## Scope
- **Quick mode**: Files touched in the target phase only
- **Deep mode**: Entire codebase

## Procedure
1. Identify all source files in scope
2. For each source file, check for corresponding test file
3. Evaluate test quality per file:
   - Are happy paths covered?
   - Are error/edge cases covered?
   - Are integration points tested?
   - For station actions: does a Terminal command test exist?
4. Run `npx vitest run --coverage` and analyze coverage report
5. Score and generate report

## Scoring
- **A** = Comprehensive: edge cases, failure paths, integration, terminal parity
- **B** = Good: most happy + sad paths, minor gaps
- **C** = Basic: happy paths only, obvious gaps
- **D** = Minimal: significant blind spots
- **F** = Missing or non-functional

## Output
1. Report → `audits/test-audit-phase-N.md`
2. Fix requests → `requests/phase-N-fixes/fix-test-[desc].md`

Each fix request contains: what's missing, why it matters, proposed test code, files to touch, acceptance criteria.

## CON-CORE-Specific Rules
- Every station GUI action MUST have a corresponding Terminal command test
- Claude API response parsing must have tests with realistic mock responses
- Gmail/Calendar API wrappers must have integration tests with mocked HTTP
- CRT visual components get snapshot tests (tests-after is OK)
- Supabase queries must be tested against actual schema shape
