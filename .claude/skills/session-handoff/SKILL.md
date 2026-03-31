---
name: session-handoff
description: "Use when context is heavy or before ending a session. Writes a handoff file for next session continuity."
---

# Session Handoff Skill

## When to Use
- Context window is getting heavy (many files read, long conversation)
- Before ending a work session
- When switching to a different phase or major task
- When user requests a handoff

## Procedure
1. Review the current session's work
2. Generate `.claude/handoff.md` containing:

```
# Session Handoff — [DATE]

## Current Phase
Phase N: [name]

## Current Request
[request file path and brief description]

## Completed This Session
- [list of completed items with file paths]

## In Progress
- [what's partially done, with specific details]

## Remaining on Current Request
- [what still needs to be done]

## Decisions Made
- [any architectural or design decisions, with rationale]

## Questions Raised
- [any unresolved questions for the user]

## Test Status
- [passing/failing, which tests, any skipped]

## Blocking Issues
- [anything preventing progress]

## Exact Next Step
[Precise description of what the next session should do first]
```

3. Save to `.claude/handoff.md` (overwrite any existing handoff)
4. Confirm handoff written to user
