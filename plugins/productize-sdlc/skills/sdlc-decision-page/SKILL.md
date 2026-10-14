---
name: sdlc-decision-page
description: >
  Build one page for a decision a human owes the pipeline (merge, approve, publish, deploy):
  the blockers the owner accepts first, then the ask and the single action, then a PRD trace that
  links back to the idea and the requirement, the gate track, before/after, evidence with its decoy,
  reviewer dissent, and the questions still open. Mode 2 lets the owner answer open questions on the
  page and send them back.
  Ours, no upstream. Triggers: "decision page", "what's waiting on me", "make this easy to approve",
  "summarise this PR for the owner", "let me answer these on a page".
disable-model-invocation: true
---

> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — confirm which notification channel this team
> uses for owner decisions (default: the PR body and the chat where the work runs).

Use this when work reaches a gate only a human can pass. A status update in chat makes the owner
read everything to find what waits on them; this page puts the accepted blockers first, then the ask
and the evidence behind it.

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
6. **Fill [decision-page.html](decision-page.html).** Edit only the JSON block (`id="decision"`).
   Set `"example": false` and set the required `meta.id` to a stable, unique decision id. Inside
   JSON strings, write `<` as `\u003c`, `>` as `\u003e`, and `&` as `\u0026` so pasted titles,
   logs and notes cannot close the JSON script block. Statuses: `pass`, `fail`, `wait`, `warn`,
   `decoy-red`; every `decoy-red` row must include `raw`. Optional: set `meta.diff` to the raw
   diff link and `independent_summary` to `{model, text}` when a different reviewer/model supplied
   the owner-facing summary. Before publishing, run
   `node scripts/check-decision-page.cjs --validate decision-page.html`.
7. **Publish privately and send the link when the gate opens**, in the same step that starts
   watching for the owner's action: the team's channel from the registry, plus the PR body.
   When the state changes, update the same page and URL; do not post a new one.

## Mode 2: the owner answers on the page (HITL)

Use when the outcome is a spec or a set of open questions rather than a merge, e.g. a spec that passed
review but still has decisions only the owner can make.

1. Put each decision in `questions` (id, title, one line of context, 2-3 options). One decision per
   question; no free-text-only questions.
   - A recommendation never stands alone: mark it `rec: true` **with** `why`, and give the question a
     `strongest_alternative: {v, why}` (the option someone else would pick, and their best reason).
     The page renders both side by side; a `rec` missing either one renders as an error. A label
     alone invites a rubber stamp; the reason and the counter-case keep the owner deciding.
2. Answers are stored where the agent can read them: on a claude.ai Artifact with the `db` and
   `user` capabilities declared (`const db = await claude.use("db")`;
   `const user = await claude.use("user")`), in collections `answers` and `handoff`. Send is enabled
   in db mode only when `await user.isOwner()` is true; the submission records `by: await user.id()`.
   Elsewhere the page keeps answers in the browser, shows that the agent cannot see them, and offers
   **Copy answers to send**; the owner pastes them where the agent reads replies.
3. Compute `qsVersion` as the hash of all current question ids, titles, and option values at render
   time. Every stored answer and `handoff/submission` carries `decisionId` and `qsVersion`, so changed
   questions require a fresh answer instead of reusing stale consent. The pickup agent must recompute
   the current page's `qsVersion` before acting; if `handoff/submission.qsVersion` differs, reject the
   submission and write the rejection to `handoff/agent` so the page says the questions changed.
4. **The trigger is the owner's Send button** (`handoff/submission`), never a chat message saying
   "done". Before writing `handoff/submission`, the page re-reads `handoff/submission` and
   `handoff/agent`; it refuses instead of overwriting when the stored submission has a different
   `qsVersion` or `handoff/agent.state` is not `done`. Whatever picks up the submission (a watcher, a
   no-model scheduled check, a connector), it writes `handoff/agent` back in three steps, so the owner
   sees it from the page:
   - `received` + `receivedAt`
   - `handed-off` + `handedOff` (what was passed on, and to whom). This is not "finished".
   - `done` + `result` (links to what changed, and the check that proves it).
5. Record the answers verbatim in the requirement (ledger, spec, ticket) before acting on them.

## Delivery and pickup, cost-ordered

Principle: never spend a model turn to find out that nothing happened. Use the cheapest ladder that
fits the owner flow:

1. **Owner pastes the copied answers where the agent already listens.** This needs no extra
   infrastructure and costs two owner actions: copy from the page, paste into the watched channel.
2. **Page to a connector.** A remote MCP on a free serverless tier (e.g. Cloudflare Workers + D1)
   records the submission. A no-model poller (`curl` on a timer) checks for pending items and wakes
   the agent only when one exists, so idle time costs nothing.
3. **Avoid scheduled model polling.** Do not use a scheduled model session or an in-session cron that
   asks "anything yet?" Every empty check is still a paid model turn.

The page cannot call arbitrary URLs because the host CSP restricts network targets. Use the connector
route when the pickup path needs network delivery.

## Done when

- Run `node scripts/check-decision-page.cjs decision-page.html`.
- Run `node scripts/check-decision-page.cjs --validate decision-page.html`.
