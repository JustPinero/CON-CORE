---
description: "Run drift audit — compare reference docs against code"
---

Run the drift-audit skill.

Usage: /drift-audit [quick|deep]

1. Read `.claude/skills/drift-audit/SKILL.md`
2. Execute the audit procedure across all reference docs
3. Write report to `audits/drift-audit-phase-N.md`
4. Update reference files where docs drifted from correct code
5. Generate fix requests where code drifted from intended design
6. Present summary — flag Fails on schema.md or architecture.md as blockers
