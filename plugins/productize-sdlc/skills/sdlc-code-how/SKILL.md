---
name: sdlc-code-how
description: >
  Explain how existing code works: subsystem architecture, runtime flow, ownership, layering,
  placement, and onboarding mental models. Adapted from pstack (MIT).
  Triggers: "how does X work", "walk me through this code", "where should this live",
  "which package owns this", "is this the right layer", "explain the flow before editing".
  Not for rationale/history (sdlc-code-why), broken behavior (diagnosing-bugs), external
  research (research), PR creation (sdlc-pr) or PR watching (sdlc-watch-pr).
---

# Code How

Explore the codebase to answer how existing code works. The output should give a senior engineer a useful mental model of a subsystem: what starts it, how data moves, where decisions happen, which files matter, and what is easy to misunderstand.

Use `sdlc-code-why` when the user asks for the rationale or history behind a decision. Use `diagnosing-bugs` when the question is about something that broke.

## Assess Scope

If the scope is ambiguous, state your interpretation and proceed. Ask the user only when the ambiguity changes the answer or would cause external side effects.

- **Simple:** one module, utility, function, or narrow flow. Explore inline and explain directly.
- **Complex:** multiple packages, services, data flows, or ownership boundaries. Split the question into 2 to 4 exploration angles.

When unsure, start simple and broaden only if the code demands it.

## Explore

For complex questions, use the `Agent` tool in parallel with `subagent_type: Explore` when available. If `Explore` is unavailable, use `subagent_type: general-purpose` with strict read-only instructions. Give each agent one distinct angle and the relevant template from `references/explorer-prompt.md`.

For simple questions, read the code yourself. Use the repo's normal search and file-reading tools, and prefer exact code paths over guesses from names.

## Synthesize

For complex questions, merge the explorer findings yourself or use one `Agent` with `subagent_type: general-purpose` as a synthesizer. The synthesizer prompt should follow `references/explainer-prompt.md` and include the explorer findings.

Resolve contradictions against the code before presenting. Do not let separate explorer reports remain as separate mini-answers.

## Output

Use the shape from `references/explainer-prompt.md`, dropping sections that do not apply:

- Overview
- Key Concepts
- How It Works
- Where Things Live
- Gotchas

Use concrete file paths, function names, and line references. Include a diagram only when it clarifies a real flow.

## References

- `references/explorer-prompt.md` for read-only exploration briefs.
- `references/explainer-prompt.md` for the final explanation structure.

## Provenance

Adapted from pstack (cursor/plugins, v0.15.15 @ ccb5507) by Lauren Tan, MIT. See LICENSE.pstack. Changes: renamed to `sdlc-code-how`; rewrote triggers and cross-references for this pack; removed vendor-specific tool names and model routing; generalized the subagent instructions.
