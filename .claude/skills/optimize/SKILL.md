---
name: optimize
description: "Run after phase completion or on demand. Identifies performance issues, duplication, unnecessary complexity, and improvements."
---

# Optimize Skill

## Scope
- **Quick mode**: Files touched in the target phase
- **Deep mode**: Entire codebase

## Procedure
1. Read all files in scope
2. Check for each optimization category:
   - **Performance**: unnecessary re-renders, missing memoization, large bundle imports, unoptimized API calls, missing request deduplication
   - **Duplication**: repeated logic that should be extracted, copy-paste patterns
   - **Complexity**: over-engineered solutions, unnecessary abstractions, deep nesting
   - **Bundle size**: large dependencies that could be replaced, tree-shaking opportunities
   - **Caching**: missed caching opportunities for Claude API responses, redundant Supabase queries
   - **API efficiency**: batch opportunities, unnecessary sequential calls that could be parallel
3. Score by impact
4. Generate report and fix requests for High items

## Scoring
- **High** = Major performance or quality improvement. User-visible impact.
- **Medium** = Notable improvement, worth scheduling.
- **Low** = Minor cleanup, nice to have.

## Output
1. Report → `audits/optimize-phase-N.md`
2. Fix requests for High items → `requests/phase-N-fixes/fix-optimize-[desc].md`
