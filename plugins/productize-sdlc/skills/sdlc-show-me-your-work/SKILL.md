---
name: sdlc-show-me-your-work
description: >
  Keep a reviewable decision trail for long-running or unattended work: an append-only TSV with
  one row per decision (what, why, evidence, result), audited against the transcript and scanned
  by a reviewer from a different model family before handing back. Adapted from pstack (MIT).
  Triggers: "decision log", "audit trail", "log your decisions", "show me your work",
  autonomous or multi-phase runs, work a human reviews after stepping away.
  Not for session continuity notes, retrospectives, root-cause reports or PR verdicts (sdlc-watch-pr).
---

# Show me your work

Keep one canonical log for a run, so a reviewer who was not watching can see every fork, why it was taken, and the proof.

## The format

A single TSV file, one row per decision. Cells stay single-line. Evidence is a pointer, not prose.

Copy `references/decision-log-template.tsv` (the header row) to start a clean log. Columns:

- **ts.** ISO8601 UTC timestamp.
- **phase.** The phase or workstream.
- **decision.** What was chosen or done, one line.
- **why.** The reason in plain words. If a principle drove it, say it plainly, not as a jargon tag.
- **evidence.** A pointer that proves it: commit SHA, PR number, `file:line`, a command plus its output path, an artifact or screenshot path. Never a paragraph. Never a secret value: point at where a key lives, not at the key.
- **result.** The outcome or predicate state: `tests green`, `reverted`, `pixel-diff 0`, `INCONCLUSIVE`, `open`.

Example:

```
ts	phase	decision	why	evidence	result
2026-05-24T09:02:00Z	frame	counted the work first, about 100 components and roughly 75 hours	wanted to know the size before starting a long run	commit 3a9f1c2	found 5 things to sort out before starting
2026-05-24T09:40:00Z	harness	took screenshots of the old version before changing anything	so we can compare old against new and catch any visual change	scripts/snapshot.sh, baseline/	saved 120 reference screenshots
2026-05-24T11:15:00Z	widget	moved the widget styles over without changing how it looks	keep the change small and the result identical	commit 7c21e0a, pixel-diff 0	looks identical, tests pass
2026-05-24T12:30:00Z	widget	threw out a helper's work because its screenshots were blank	checked the real files instead of trusting its summary	worktree reset	reverted, tightened the instructions for next time
```

## Logging a row

Write each entry the way you would tell a teammate what you did: plain words, concrete actions, no filler or abstract jargon. Rows are written in English.

Use the helper:

```bash
<skill-dir>/scripts/log.sh <logfile> <phase> <decision> <why> <evidence> <result>
```

It stamps `ts`, writes the header on first use, strips stray tabs and newlines, and prefixes any cell starting with `=`, `+`, `-`, or `@` with a single quote so a spreadsheet never runs it as a formula. A bare `printf` works too, but then you own those same protections when cells come from generated or user-supplied text (PR titles, filenames, model output).

Log decision points and checkpoints, not every action: a fork chosen, a unit completed with its verification result, a pivot or revert with its trigger, a blocker surfaced, a gate fixed. For loop runs, one row per iteration. Skip the trivial and self-evident.

A "green" result needs the command that produced it in evidence. A gate or checker reported as passing needs a row showing it was made to go red at least once (decoy, seeded bad input), or the result is `unproven`, not `pass`.

### Runs and `start` rows

A run is one agent conversation, including its later turns and any summary of it. A pickup, a replacement agent, or a new chat starts a new run. When a run adds to a log that already has rows, its first row has phase `start`, and so does its first row after another run's `start` row. So a run that returns to a log in a later turn first reads the log's last rows to see whether another run wrote since. A `start` row names the `ts` range of the rows before it that this run did not write, and its evidence names this run (session id or agent id). Use phase `start` for nothing else.

## Where it lives

By default the log is a working artifact, not committed: `decisions.tsv` in the work dir, or `.audit/<task-slug>.tsv` when several efforts run at once. Keep it out of git there.

- Never commit it into an external repo you do not own.
- Commit it only when the work is ambitious enough that a reviewer needs the trail to trust the result, and only after checking that no evidence cell holds a secret, a customer name, or tenant data.

## Rules

- Append-only. A wrong call gets a new row that supersedes it. Never edit or delete history.
- Prefer evidence produced by committed scripts over hand-made one-offs: a check you can rerun beats a sentence you typed.

## Audit the log against the transcript

At the end of the run, before handing back, check that the log told the truth. Read this run's own transcript: in Claude Code, `~/.claude/projects/<slug>/<session-id>.jsonl`, where `<slug>` is the workspace path with every character that is not a letter or digit turned into `-`. In Codex, the `~/.codex/sessions/YYYY/MM/DD/rollout-*.jsonl` file whose first line has `payload.cwd` equal to the workspace path. Never glob across every project's directory: that reads unrelated private chats.

Walk this run's rows against what actually happened. This run's stretch of rows begins at one of its `start` rows (or the first row, if this run created the log) and ends at the next `start` row of another run.

- Every row maps to a real decision or action.
- Every evidence pointer resolves and shows what the row claims. Open it: `cat`, `git show`, rerun the command. A success message you wrote yourself is not evidence.
- A fork, pivot, or abandoned approach that shaped the work but is not logged is a gap. Add it.

Correct the log, not the story. The audit never edits or removes a row, even an invented one. When a row records no real decision or action, or its claim or evidence is wrong, add a row that supersedes it with what actually happened and a pointer that resolves.

## Cross-model review of the trail

Before handing back, have a reviewer from a different model family from the one that did the work read the trail and the transcript. Self-review is not a substitute. The reviewer is, for example, Codex if the work was done by Claude, and a Claude subagent if the work was done by Codex. Brief it read-only:

> Read `<logfile>` and the transcript at `<path>`. Flag: decisions with weak or absent evidence; verification claimed without proof in the transcript; choices that look risky in hindsight (premature, scope-creeping, papering over a symptom); gaps a casual skim would miss. Cite row `ts` values. Do not redo the work.
 If no different-family reviewer can run, say so in the Attention section; do not substitute a same-family review and call it cross-model.

Every reply for a run that produced a trail ends with an **Attention** section. Its first line names the reviewer's model (`reviewed by <model>`), then each flag points at specific rows or moments. "No flags" is a valid value. The reviewer line is not optional.

## Reviewing the trail

Read top to bottom, follow the evidence pointers, spot-check. `column -s$'\t' -t decisions.tsv` renders it in a terminal; GitHub renders a committed TSV as a table.

## Composing this skill

Other skills route their audit trail here instead of inventing one. Reference it by name and let it own the format; do not restate the columns.

## Provenance

Adapted from pstack (cursor/plugins, v0.15.15 @ ccb5507) by Lauren Tan, MIT. See LICENSE.pstack. Changes: renamed to `sdlc-show-me-your-work`; added the no-secret evidence rule, the external-repo rule and the "a pass needs a red first" rule; made the cross-model reviewer generic; dropped harness-specific transcript paths beyond the two named. `scripts/log.sh` and `references/decision-log-template.tsv` are unchanged.
