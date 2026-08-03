---
name: sdlc-merge-resolve
description: >
  Resolve an in-progress git merge/rebase conflict with an abort-and-escalate escape hatch.
  Patch of mattpocock `resolving-merge-conflicts` — see CROSSWALK.md for provenance.
  Triggers: "merge conflict", "resolve rebase", "rebase stuck in conflict".
disable-model-invocation: true
---

> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — confirm the assigned agent and product track.

Resolve the in-progress merge/rebase, from upstream:

1. **See the current state** of the merge/rebase. Check git history and the conflicting files.

2. **Find the primary sources** for each conflict. Understand deeply why each change was made and
   what the original intent was. Read the commit messages, check the PRs, check the original
   issues/tickets.

3. **Resolve each hunk.** Preserve both intents where possible. Where incompatible, pick the one
   matching the merge's stated goal and note the trade-off. Do **not** invent new behaviour.

4. Discover the project's **automated checks** and run them — typically typecheck, then tests,
   then format. Fix anything the merge broke. If checks run on another machine, wrap them in that
   machine's remote-exec command.

5. **Finish the merge/rebase.** Stage everything and commit. If rebasing, continue the rebase
   process until all commits are rebased.

## The gate this patch adds (load-bearing)

Upstream says "Always resolve; never `--abort`". For agent fleets that is dangerous: a bad
automated resolution can destroy someone else's work. This variant allows **abort-and-escalate**:

- **Abort is allowed when**: the conflict spans many files with unclear intent; the conflict
  contains commits from another process/agent/author mixed into yours; or resolution keeps
  failing checks with no identifiable cause.
- **Abort safely**: before `git merge --abort` / `git rebase --abort`, capture the state —
  `git status`, `git diff --name-only --diff-filter=U`, the conflicting file list plus a note on
  what is stuck — into a handoff note for the human, then abort and escalate.
- **Never**: abort without leaving the capture; `git checkout --theirs/--ours` wholesale on a file
  without reading its hunks; push a resolution that mixes in commits you do not own.
