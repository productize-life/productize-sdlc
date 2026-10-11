---
name: sdlc-code-why
description: >
  Investigate the rationale, history, and tradeoffs behind existing code or design decisions
  using code archaeology and any connected evidence sources. Adapted from pstack (MIT).
  Triggers: "why does this code exist", "why did we choose this approach", "where did this
  threshold come from", "what decision led to this shape", "history of this implementation".
  Not for broken behavior or incidents (diagnosing-bugs), external research (research),
  runtime walkthroughs (sdlc-code-how) or PR work (sdlc-pr, sdlc-watch-pr).
---

# Code Why

Investigate the motivation and historical context behind existing code and decisions. `sdlc-code-how` answers how the code works. `code-why` answers what evidence explains why it ended up this way.

Do not use this as an incident or debugging skill. If the user asks why something failed, regressed, timed out, crashed, or behaved incorrectly, route to `diagnosing-bugs`. Do not use this for external ecosystem or vendor research; route that to `research`.

## Operating Posture

Be careful about confidence. Code shows mechanics, not intent. Motivation lives in commits, PRs, tickets, docs, comments, conversations, telemetry, and analytics, all of which can be missing or contradictory. Read `references/epistemics.md` before synthesizing.

## Step 1: Understand The Target

Identify the code, pattern, threshold, behavior, or decision the user is asking about. If the target is vague, state your interpretation briefly and proceed unless the ambiguity would change the investigation.

## Step 2: Establish The Code Anchor

Anchor the investigation before using optional sources:

```bash
git blame -L <start>,<end> <file>
git log --follow -p -- <file>
git log --oneline -20 -- <file>
git log -1 --format=%B <commit>
```

For substantive commits with PR numbers, fetch PR context:

```bash
gh pr view <number> --json title,body,author,createdAt,mergedAt,labels,closingIssuesReferences,comments,reviews,files
```

Capture file paths, line ranges, symbols, commits, PR numbers, and ticket IDs as seed context.

## Step 3: Choose Evidence Sources

Source control history is always in scope through git and, when available, `gh`. Other sources are optional and must be used only when the relevant connector or tool is connected and authenticated. If a source is unavailable, record that as a coverage gap rather than guessing.

Use the playbook index in `references/source-playbook.md`:

- Source control history: always use `references/sources/code-archaeology.md`.
- Issue tracker: use `references/sources/linear.md` when Linear or an equivalent tracker is connected.
- Long-form docs: use `references/sources/notion.md` only when Notion, Google Docs, Confluence, Coda, or an equivalent docs connector is connected.
- Real-time chat: use `references/sources/slack.md` only when Slack, Discord, Teams, Mattermost, or an equivalent chat connector is connected.
- Infrastructure observability: use `references/sources/datadog.md` only when Datadog, New Relic, Honeycomb, Grafana, Splunk, or an equivalent observability connector is connected.
- Error tracking: use `references/sources/sentry.md` only when Sentry, Rollbar, Bugsnag, Airbrake, or an equivalent error tracker is connected.
- Analytics warehouse: use `references/sources/databricks.md` only when Databricks, Snowflake, BigQuery, ClickHouse, dbt, Redshift, or an equivalent warehouse connector is connected.
- Incident/postmortem context: add `references/sources/incident-postmortem.md` as a cross-cutting angle only when the code is defensive and at least one incident-capable source is connected.

When a connector would materially help but is not visible in the active tool list, use tool discovery if available before declaring it unavailable.

## Step 4: Investigate

For broad investigations, use the `Agent` tool with `subagent_type: general-purpose`: one investigator per source category, all read-only, all given the seed context, the user's question, `references/investigator-prompt.md`, and exactly one relevant source playbook. Agents must not modify files, mutate trackers, post messages, or change external state.

If the Agent tool is unavailable, run the source-control pass inline and search any connected sources you can access directly. Record unavailable categories in the final output.

## Step 5: Synthesize

Use `references/synthesizer-prompt.md` and the confidence framework from `references/epistemics.md`. Separate direct evidence, supported conclusions, inferences, hypotheses, contradictions, and unknowns. Never cite code as evidence for its own intent.

If the user's question is a precursor to changing the code, add a compact Preserve / Change / Avoid / Risk constraint set after the Sources Consulted section.

## Output

Use the structure from `references/synthesizer-prompt.md`:

- The Question
- The Code in Question
- What We Found
- What We Can Reasonably Infer
- Competing Hypotheses
- What We Don't Know
- Sources Consulted
- Confidence Summary

## Provenance

Adapted from pstack (cursor/plugins, v0.15.15 @ ccb5507) by Lauren Tan, MIT. See LICENSE.pstack. Changes: renamed to `sdlc-code-why`; narrowed triggers away from debugging and external research; made every non-git source adapter optional; removed vendor-specific model routing and company context; generalized reference files.
