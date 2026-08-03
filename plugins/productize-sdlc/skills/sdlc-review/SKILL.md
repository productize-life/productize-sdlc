---
name: sdlc-review
description: >
  Adversarial second-engine code review: a different model than the writer's, severity-tagged
  findings, warn-not-block. Ours — grown in a private fleet lab, no upstream.
  Triggers: "review this diff", "second opinion", "adversarial review", "review before merge".
disable-model-invocation: true
---

> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — confirm the reviewer role and its assigned engine.

## The non-negotiables

1. **Reviewer engine ≠ maker engine.** A different model than the one that wrote the code.
   In-session self-review does not satisfy this gate — same-model review shares the same blind
   spots.
2. **Findings, not verdicts.** Extract severity · `file:line` · concern. Never read/paste the whole
   trace into your answer, and **never fabricate a verdict** — if the engine didn't run, say
   "skipped (unavailable)", never "no findings".
3. **Warn, don't block.** The human merge is the real gate. Findings land where the merge decision
   is made (the PR body via `sdlc-pr`), not in a hard CI block that teaches people to bypass it.

## Severity taxonomy

- **P1** — wrong behaviour, data loss, security hole, breaks the public contract. If any P1:
  surface it at the very top of the PR body (`> ⚠️ **P1 …**`) — unmissable at the merge gate.
- **P2** — real defect with a workaround, or a maintainability trap the next reader will hit.
- **P3** — style/clarification; take it or drop it without ceremony.

## Process

1. Review the **diff against its base**, with the repo available so the engine can chase calls.
2. Run the project's checks if the engine can (a reviewer that also *runs* the tests catches what
   a reading reviewer can't).
3. For each finding, first ask the understanding gate (Adler): does the reviewer actually
   understand what this code is *for*? A finding against behaviour the spec requires is not a
   defect — flag it as a question, not a P*.
4. Real-and-quick P1/P2 → fix now, commit as a review-fix (feeds the "Review fixes included"
   section of the PR). Everything else → surface for the human at merge.

## Finding-quality check (before you report)

- A finding that says "should add X" with no failure scenario is a suggestion, not a defect —
  label it so.
- A finding the maker can't reproduce from the stated inputs is a question, not a P*.
- Report what you proved AND what you didn't. Naming the unreviewed surface is part of the
  deliverable.
