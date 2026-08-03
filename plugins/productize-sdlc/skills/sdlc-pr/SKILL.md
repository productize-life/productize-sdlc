---
name: sdlc-pr
description: >
  Create or update a PR in the team-standard format: intent-first summary, file tables, review
  fixes, mandatory second-engine review, runnable-evidence accountability. Ours — grown in a
  private fleet lab, no upstream. Triggers: "open the PR", "create PR", "update the PR body".
disable-model-invocation: true
---

> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — confirm assignment and track.

Create and push a pull request in the standard format. If a PR already exists for the branch,
**update** it instead of creating a new one.

## 1. Gather context

In parallel: `git status --short` · `git diff <base>...HEAD --stat` · `git log <base>...HEAD
--oneline` · `git branch --show-current` · existing-PR check (`gh pr view --json url,state`).

Read the full diff and all commit messages. Understand: what feature/fix, which spec/AC it
relates to, added vs modified files, and whether fix-after-review commits exist.

## 2. Review-matrix routing (classify the diff → extra lenses)

Before the second-engine pass, classify the diff and run the lenses its row demands (cumulative —
pick the strictest row the diff qualifies for):

| The diff touches | Extra lenses (besides the second engine) |
|---|---|
| docs only | none (skip to push) |
| internal code, additive | second engine only |
| auth / secrets / external input / deploy / prod | **+ security review** (never skip) |
| domain model / schema / cross-boundary API contract | **+ domain-modeling lens** |
| company / external / customer-facing repo | **+ security + test-design review** (full tier) |

Each extra lens's findings fold into the PR body under its own `## <lens> review` section, same
warn-not-block rule as the second engine. Heterogeneity rule: a spawned reviewer's model must
differ from the maker's — in-session self-review does not satisfy the gate. Not sure which row →
treat as the stricter one.

## 3. Second-engine review (mandatory, warn-not-block)

Run a review of the diff by **a different model than the one that wrote the code** (your
`reviewer` role — e.g. Codex, or another engine's review skill). Extract findings only
(severity · `file:line` · concern); never paste or fabricate a verdict. Inject them as the
`## Code review (2nd engine)` section:

- If none: `second-engine review — no blocking findings`.
- If a P1 exists: prepend `> ⚠️ **P1 from second-engine review — resolve or justify before merge**`
  at the very top of the body.
- Real and quick to fix → fix first (commit as a review-fix), then proceed. Otherwise surface it;
  **the human merge is the real gate** — this warns, it never hard-blocks.
- Engine unavailable → write `second-engine review — skipped (unavailable here)`. Never fabricate.

## 4. Body — use this exact format

Use `templates/pr-template.md` from this repo. Its sections, in order:

1. **Summary** — 1-3 sentences of WHY (the problem solved, not the code changed) + **Intent**:
   the approach chosen, the alternative rejected and why. Reviewers must not have to reconstruct
   the author's reasoning from the diff.
2. **What's new** — one bolded bullet per logical change.
3. **Files changed** — tables, split **New files** vs **Modified files** (always; counts + +/-).
4. **Review fixes included** — only if fix-after-review commits exist; omit otherwise.
5. **Code review (2nd engine)** + any extra-lens sections (Step 2-3).
6. **Test plan** — `[x]` for what actually ran and passed; `[ ]` left for manual steps.
7. **Accountability** — mandatory for anything touching the production boundary:
   - **Accountable**: the human who inherits the consequence (an agent may write/route/merge
     inside policy but cannot be accountable).
   - **Evidence**: a runnable `Acceptance:` line that was actually run — command → observed
     output. Adjectives ("works", "verified") are not evidence.
   - **If wrong / rollback**: one line — how to revert + blast radius.

Title format: `type(scope): short description` — feat/fix/test/docs/refactor, under 70 chars.

## 5. Push and create/update

- **Fetch before push** — the branch may have moved via web UI or another process.
- Never commit straight into the default branch; push the work branch; `gh pr create` (or
  `gh pr edit` when updating). After creation, show the URL.

## Rules

- Never file tracker issues from this flow — flag bugs in PR descriptions instead.
- File placement must be correct from the **first commit** (CI checks per commit; a later
  move-commit does not fix earlier commits — rebase instead).
- A green PR/CI is **necessary, not sufficient**: for work tied to a spec/roadmap goal, product
  intent-alignment is a separate axis a human confirms at merge.
