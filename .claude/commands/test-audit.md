---
description: "Run test audit only"
---

Run the test-audit skill against specified scope.

Usage: /test-audit [phase-number|file-path] [quick|deep]

1. Read `.claude/skills/test-audit/SKILL.md`
2. Determine scope from argument
3. Execute the audit procedure
4. Write report to `audits/test-audit-phase-N.md`
5. Generate fix requests for gaps found
6. Present summary to user
