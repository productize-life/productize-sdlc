## Summary

[1-3 sentences explaining the WHY — what problem this solves, not what code was changed]

**Intent**: [1-2 sentences — approach chosen + the trade-off/alternative rejected and why.
Reviewers must not have to reconstruct the author's reasoning from the diff. Not backstory —
just the decision.]

## What's new

- **[Feature/component name]** — [what it does and why]
- **[Another item]** — [description]

### Files changed (N files, +X / -Y)

**New files (N):**

| File | Purpose |
|------|---------|
| `path/to/file` | Short description |

**Modified files (N):**

| File | Change |
|------|--------|
| `path/to/file` | What changed |

### Review fixes included

[Only include this section if there were review-driven fix commits]

- Fixed [description of what was wrong and how it was fixed]

## Code review (2nd engine)

[Each finding: severity · `file:line` · concern. If none: "second-engine review — no blocking
findings". If any P1, prepend `> ⚠️ **P1 from second-engine review — resolve or justify before
merge**` at the very top of the body. If the engine was unavailable:
"second-engine review — skipped (unavailable here)". Never fabricate a verdict.]

## Test plan

- [x] `<test command>` — N tests pass
- [x] `<typecheck command>` — passes (or note pre-existing errors)
- [x] Code review: N issues found and fixed
- [ ] Manual: [describe manual verification steps]

## Accountability

- **Accountable**: [the human who inherits the consequence — an agent may write/route/merge
  inside policy but cannot be accountable]
- **Evidence** (Acceptance — actually ran, saw the expected output; not "works"/"verified"):
  - `<command>` → `<expected output observed>`
- **Checklist accepted**: [invariants the author confirmed — e.g. no secrets, additive-only,
  required lenses run]
- **If wrong / rollback**: [one line — how to revert + blast radius]
