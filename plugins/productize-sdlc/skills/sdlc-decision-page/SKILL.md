---
name: sdlc-decision-page
description: >
  Build one page for a decision a human owes the pipeline (merge, approve, publish, deploy):
  the ask and the single action on top, then a PRD trace that links back to the idea and the
  requirement, the gate track, before/after, evidence with its decoy, reviewer dissent, and the
  questions still open. Ours, no upstream. Triggers: "decision page", "what's waiting on me",
  "make this easy to approve", "summarise this PR for the owner".
disable-model-invocation: true
---

> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — confirm which notification channel this team
> uses for owner decisions (default: the PR body and the chat where the work runs).

Use this when work reaches a gate only a human can pass. A status update in chat makes the owner
read everything to find what waits on them; this page puts the ask first and shows why it is safe.

## Steps

1. **Name the ask.** One sentence, one action, one link (the PR, the approve page). Say what happens
   if nobody acts. If there is more than one ask, make one page per ask.
2. **Build the PRD trace from sources, not memory.**
   - **idea**: the owner's own words, quoted verbatim from where they were first written down. If
     they only exist in chat, write them into the decision note first, then link the note.
   - **requirement**: the goal, spec or ticket this serves (`sdlc-spec` output, tracker issue).
   - **problem**, **solution**, **measure** (each measure with a status), **not doing**.
   - Add a line back to the requirement (a checkpoint or comment) so the trace runs both ways.
3. **Fill the evidence from runs you actually made.** Each row is a command you ran and what it
   returned. Include the decoy (the input that must fail) and show it failed. Mark anything
   self-reported by an agent as such (`note`).
4. **Copy the dissent** from the review (e.g. a multi-model review): what reviewers disagreed on,
   and which point changed the verdict (`flip: true`). Do not drop findings you disagree with.
5. **Check every link resolves** at the ref you name in `meta.ref`, e.g.
   `git show <ref>:<path>` for repo files and an HTTP status check for URLs. A page with a dead
   link sends the owner looking for the thing you meant.
6. **Fill [decision-page.html](decision-page.html).** Edit only the JSON block (`id="decision"`) and
   set `"example": false`. Statuses: `pass`, `fail`, `wait`, `warn`, `decoy-red`.
7. **Publish privately and send the link when the gate opens**, in the same step that starts
   watching for the owner's action: the team's channel from the registry, plus the PR body.
   When the state changes, update the same page and URL; do not post a new one.

## Done when

- `Acceptance: open the page → the ask and its link are visible without scrolling on a phone`
- `Acceptance: every href → resolves at meta.ref (no 404)`
- `Acceptance: the evidence table has at least one decoy row showing it failed`
- The owner can act from the page alone.
