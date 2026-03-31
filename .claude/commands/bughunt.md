---
description: "Run bughunt audit only"
---

Run the bughunt skill against specified scope.

Usage: /bughunt [phase-number|file-path] [quick|deep]

1. Read `.claude/skills/bughunt/SKILL.md`
2. Determine scope from argument
3. Execute the audit procedure
4. Write report to `audits/bughunt-phase-N.md`
5. Generate fix requests for findings
6. Present summary — flag any Critical findings as blockers
