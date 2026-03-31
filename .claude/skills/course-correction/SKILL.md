---
name: course-correction
description: "Invoke when a fundamental assumption breaks — schema is wrong, core dependency fails, user feedback invalidates a feature, or performance won't scale."
disable-model-invocation: true
---

# Course Correction Skill

## When to Invoke
- Schema design proves wrong under real data
- Core dependency fails or is deprecated
- User feedback invalidates a planned feature
- Performance won't scale for the use case
- Security issue requires architectural change
- API provider changes break integration assumptions

## Sequence
1. **STOP** current work immediately. Do not build on a broken foundation.
2. Run drift-audit in deep mode across all references.
3. Identify ALL downstream effects:
   - Which source files are affected?
   - Which phases/requests are impacted?
   - Which tests need updating?
   - Which reference docs are now wrong?
4. Write correction report: `audits/correction-[YYYY-MM-DD].md`
   - What changed and why
   - Root cause analysis
   - Full list of affected files, phases, requests
   - Proposed path forward
   - Risk assessment of the correction itself
5. Update ALL affected reference files.
6. Generate migration/fix request files for required code changes.
7. Present report + new requests to user for approval.
   **DO NOT resume work until user approves the correction plan.**
8. Re-prioritize phase plan if needed.
9. After approval, execute fix requests in dependency order.
