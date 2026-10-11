---
name: sdlc-blast-radius
description: >
  Probe what a chosen code fix could break elsewhere and prove the key "safe because" fact by
  running code. Adapted from pstack (MIT).
  Triggers: "blast radius", "what could this break", "prove this fix is safe", "review the
  risk after the fix is picked".
  Not for root-cause diagnosis (diagnosing-bugs), runtime walkthroughs (sdlc-code-how),
  rationale/history (sdlc-code-why), external research (research) or PR work (sdlc-pr, sdlc-watch-pr).
---

# Blast Radius

Find what a chosen change could break somewhere else before it ships. This runs after a fix candidate exists, especially after a root-cause diagnosis has selected a repair and you need to prove the "safe because" claim.

This skill is not for finding the cause of a failure. If the cause or mechanism is still unknown, use `diagnosing-bugs` first.

## Core Rule

A convincing risk writeup is not enough. Find the one or two facts the change's safety depends on and prove them by running the real code whenever that is reasonably cheap.

For each safety fact, say where it landed on this ladder:

1. You asserted it.
2. You cited a real `file:line` or the relevant library source.
3. You walked the bad case and showed it cannot reach the changed behavior.
4. You ran a script or test that calls the shipped code path and fails loudly if the fact is false.
5. You reproduced the behavior in the running app or service.

Step 4 is usually the right target: a small script or focused test that imports the same library and calls the exact function or path under review.

## Workflow

1. Read the diff, the touched symbols, and the intended behavior change. Include the part the diff does not spell out, such as timing, teardown, serialization, or external API shape.
2. Identify the one fact the change is safe because of. Most risky-looking changes collapse around one fact, for example "this call only removes entries already known to be dead."
3. Look where symbol search stops. Check library source and pinned versions, local patches, generated schemas, JSON or wire formats, DB columns, feature flags, jobs, queues, teardown order, and downstream consumers in other languages.
4. Separate confirmed risks from cleared risks. Each confirmed risk needs a concrete failure mode, `file:line`, likelihood, cost, and the cheapest check that would catch it.
5. Prove the load-bearing safety fact. Add a temporary script or focused test when useful, run it, and keep the command plus output for the report. Remove any temporary artifact that should not ship.
6. For a broad change, use the `Agent` tool for independent read-only passes. Use `subagent_type: general-purpose`, give each agent a distinct angle, then synthesize and verify the claims yourself.

## Output

Return:

- **What changed.** The behavior change, including the non-obvious part.
- **The safety fact.** The claim, ladder step reached, and proof. If not proven, write `unproven`.
- **Risks.** Each risk names how it breaks, where, likelihood, cost, and how to check it.
- **Cleared.** What you checked and why it is fine.
- **Before merge.** The cheapest test, script, repro, or manual check that would catch the real bug.

Keep the report specific and cite real code. Strip private details before sharing outside the repo.

## Provenance

Adapted from pstack (cursor/plugins, v0.15.15 @ ccb5507) by Lauren Tan, MIT. See LICENSE.pstack. Changes: renamed to `sdlc-blast-radius`; rewrote triggers and cross-references for this pack; removed vendor-specific model routing; replaced multi-candidate suggestion with optional read-only subagent fan-out.
