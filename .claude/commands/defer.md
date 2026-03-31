---
description: "Defer a feature to a later phase"
---

Defer a feature or task to a later phase.

Usage: /defer [what to defer and why]

1. Generate a unique DEBT-ID (format: DEBT-YYYY-MM-DD-NNN)
2. Add entry to `audits/debt.md` under ## Open:
   - DEBT-ID
   - Date
   - Description of deferred feature
   - Reason for deferral
   - Suggested phase for activation
   - Severity: low/medium/high
3. If the deferred item has a request file, mark it as deferred
4. Confirm deferral to user with DEBT-ID for future reference
