---
name: drift-audit
description: "Run after phase completion or on demand. Compares reference docs against actual code to detect discrepancies."
---

# Drift Audit Skill

## Scope
All files in `references/` compared against actual codebase.

## Procedure
1. Read each reference document:
   - `references/architecture.md` — compare against actual dependencies, file structure, stack usage
   - `references/schema.md` — compare against actual Supabase table definitions or migration files
   - `references/api-contracts.md` — compare against actual API route implementations in `/api`
   - `references/crt-design-system.md` — compare against actual CSS/component implementations
   - `references/env-vars.md` — compare against actual env var usage in code
2. For each reference file, identify:
   - Documented features/routes/fields that don't exist in code
   - Code features/routes/fields not documented in references
   - Contradictions between doc and implementation
3. Determine direction of drift:
   - If code is correct and doc is outdated → update the doc
   - If doc is correct and code drifted → generate fix request for code
4. Score and generate report

## Scoring
- **Pass** = Doc accurately reflects current code
- **Fail** = Doc is outdated or contradicts implementation

## Output
1. Report → `audits/drift-audit-phase-N.md`
2. Updated reference files (if docs drifted from code)
3. Fix requests (if code drifted from design) → `requests/phase-N-fixes/fix-drift-[desc].md`

## Blocking Rule
**Fail** on `schema.md` or `architecture.md` blocks the next phase until resolved.
