---
name: sdlc-implement
description: >
  Implement a piece of work from a spec or tickets with build discipline: branch-first, pre-agreed
  test seams, review before ship, remote builds wrapped. Patch of mattpocock `implement` —
  see CROSSWALK.md for provenance. `--plan` writes the implementation plan and stops before any
  source edit; `--from-plan <ref>` builds from an approved plan, red tests first.
  Triggers: "implement this ticket", "implement the spec", "build this from the tickets",
  "plan the implementation first".
disable-model-invocation: true
---

> ⛔ **If invoked with `--plan`, read "Plan mode" below before anything else.** It overrides gates
> 1, 3 and 4 for that run.
>
> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — confirm the phase/skill/agent assignment for this
> work, and which product context layer (if any) to load.

Implement the work described in the spec or tickets.

## Plan mode (`--plan`)

`--plan` runs gate 2 (seams) as normal, then writes the plan and **stops**. It suspends gates 1, 3
and 4 for this run: no branch, no source edits, no commit, no push. **The only write allowed is the
plan itself.**

The plan names:

- **Seams** — each seam from the brief with the concrete **test file and test name** that will
  exercise it. A seam without a named test is not ready.
- **Files to touch** — path + one line on the change. Read each file before listing it; a path
  you did not open is a guess.
- **Steps** — ordered, one red-green cycle per step, smallest vertical slice first.
- **Out of scope** — what the brief implies but this run will not do.
- **Risks / unknowns** — anything that would change the plan if wrong; run `sdlc-code-how` first
  on any subsystem you cannot explain.
- **Verification** — the exact typecheck/test commands the build run will execute, and which
  machine runs them.

**Where it goes:** one canonical place — a comment on the tracker issue if the work has one,
otherwise an untracked file `plans/<ticket-id>.md` in the working tree (never committed to the
default branch). Print its location at the end.

**Approval is a human act.** The skill cannot verify it. The human approves by starting the build
run with `--from-plan <ref>`.

### Building from an approved plan (`--from-plan <ref>`)

1. Read the plan at `<ref>`. Record the ref and the plan's `sha256` in the first commit message.
2. Gate 1 as usual: branch first.
3. **Red first:** land the tests named under Seams, run them, and see them **fail** before writing
   any implementation. A test that passes before the change is not testing the change: stop.
4. Then the loop below. If the plan turns out wrong, stop and update the plan; do not drift from it.

**Not this mode:** a large or foggy effort that spans several tickets is `wayfinder`; turning a plan
into tickets is `to-tickets`. `--plan` covers one ticket.

## Gates (the patch over upstream — do not skip)

1. **Branch-first, always.** Create or check out the work branch before editing; run
   `git status -sb` before the first commit. Never commit into the default branch directly.
2. **Seams arrive with the brief.** TDD needs pre-agreed test seams. If the ticket/spec brief has
   no seams, stop and ask (or hand back for a handoff note) — never invent seams silently.
   For AFK/autonomous runs there is no mid-flight human gate, so an incomplete brief means
   stop + hand back, not guessing.
3. **End at review, not at push.** Done = open your review flow (review skill / PR creation).
   Do not `git push` directly unless the user explicitly says so.
4. **Remote builds get wrapped.** If typecheck/tests run on another machine, wrap them in that
   machine's remote-exec command (e.g. `ssh <host> '…'`). Never run locally and conclude for the
   remote machine.

## Loop (from upstream)

Implement the work described by the user in the spec or tickets.

Use /tdd where possible, at pre-agreed seams.

Run typechecking regularly, single test files regularly, and the full test suite once at the end.

Once done, review the work. A second-engine adversarial review (a different model than the
implementer) catches what self-review misses; upstream `/code-review` (standards + spec lens) can
supplement it — the two are complementary, not substitutes.

**Replaces** upstream's "Commit your work to the current branch": commit on the work branch
(branch-first above), then hand off to your review/PR flow.
