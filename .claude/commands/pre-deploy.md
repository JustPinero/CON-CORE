---
description: "Run pre-deploy validation checklist"
---

Run the full pre-deploy checklist.

Usage: /pre-deploy [environment]
Default environment: production

1. Read `.claude/skills/pre-deploy/SKILL.md`
2. Execute each check in the procedure
3. Report PASS/FAIL per check
4. If any FAIL: deployment is BLOCKED, list required fixes
5. If all PASS: CLEAR FOR DEPLOY
