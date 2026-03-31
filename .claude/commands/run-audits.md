---
description: "Run all four audits (test-audit, bughunt, optimize, drift-audit)"
---

Run all four audit skills against the specified phase or area.

Usage: /run-audits [phase-number] [quick|deep]
Default: current phase, quick mode

1. Determine the target phase from the argument (default: current phase from CLAUDE.md or handoff.md)
2. Determine mode: quick (phase files only) or deep (full codebase)
3. Run each audit skill in sequence using the audit-runner agent:
   a. test-audit
   b. bughunt
   c. optimize
   d. drift-audit
4. Compile a summary of all findings
5. If any Critical findings exist, flag as PHASE BLOCKED
6. Present summary to user with links to individual audit reports
