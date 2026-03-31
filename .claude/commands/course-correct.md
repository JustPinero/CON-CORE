---
description: "Trigger course correction when a fundamental assumption breaks"
---

Initiate course correction protocol.

Usage: /course-correct [description of what broke]

1. Read `.claude/skills/course-correction/SKILL.md`
2. STOP all current work immediately
3. Run drift-audit in deep mode
4. Identify all downstream effects
5. Write correction report to `audits/correction-[date].md`
6. Update affected reference files
7. Generate migration/fix requests
8. Present plan to user — DO NOT resume until approved
