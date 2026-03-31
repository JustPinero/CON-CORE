---
description: "Mark a phase complete and run all audits"
---

Mark a phase as complete and run the full audit suite.

Usage: /phase-complete [phase-number]

1. Verify all requests in the phase are completed
2. Run all four audits in deep mode via /run-audits [phase] deep
3. If any Critical findings: phase is NOT complete, present blockers
4. If all clear:
   a. Commit any outstanding changes
   b. Merge phase branch to main
   c. Create next phase branch
   d. Update CLAUDE.md if needed
   e. Announce phase completion with audit summary
