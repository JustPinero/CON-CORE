---
description: "Run optimize audit only"
---

Run the optimize skill against specified scope.

Usage: /optimize [phase-number|file-path] [quick|deep]

1. Read `.claude/skills/optimize/SKILL.md`
2. Determine scope from argument
3. Execute the audit procedure
4. Write report to `audits/optimize-phase-N.md`
5. Generate fix requests for High-impact items
6. Present summary to user
