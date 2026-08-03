# productize-sdlc

A product-agnostic **SDLC control layer for AI-agent teams**, by
[Productize.life](https://productize.life).

**Claude Code for SDLC, for non-developers.** You don't need to be an engineer to run a real
development lifecycle with AI agents — you need a pipeline with discipline and a control plane
that keeps it governable. This pack is that layer: it fills the hollow middle of most skill sets
(spec → tickets → implement → test-first) and puts a **registry** in charge, so a product person,
founder, or PM can own the whole SDLC through Claude Code.

Most skill sets grow by accident: strong at the ends (planning, review, shipping) and hollow in
the middle. This pack fills the middle with discipline, and keeps the skill set governable as it
grows — your pipeline, your registry, your rules.

## What's inside

| Piece | What it is |
|---|---|
| **The Registry** (`registry/SDLC-SKILL-REGISTRY.template.md`) | A single markdown control plane: phase → primary skill, agent → permitted skills, selection rules, supersede + drift logs. Agent-agnostic — any AI agent can read it. |
| **`sdlc-registry`** skill | Init the registry in your repo, consult it before claiming coverage, register changes same-turn. |
| **Ours — grown in practice, no upstream** | `sdlc-spec` (interview-driven spec + seams appendix + spec review) · `sdlc-qe` (quadrant test design + vacuous-assertion audit) · `sdlc-review` (adversarial 2nd-engine review) · `sdlc-pr` (intent-first PR pipeline) · `sdlc-ddd` (domain coaching, CONTEXT.md) · `sdlc-adr` + `sdlc-pe-review` (decisions written and translated to PM language) |
| **Patched from upstream** | `sdlc-implement` (branch-first/seams), `sdlc-merge-resolve` (abort-and-escalate), `sdlc-triage` (tracker-first). |
| **Adopt as-is from Matt Pocock** | `to-tickets`, `tdd`, `grilling`, `wayfinder`, `code-review`, `research`, `diagnosing-bugs`, `domain-modeling`, `codebase-design`, `prototype` — see CROSSWALK.md. |
| **`templates/`** | `pr-template.md` (the intent-first PR body with runnable-evidence accountability) + `issue-tracker.template.md` (states, labels, your human-approval gate). |
| **`CROSSWALK.md`** | Intent → skill router + the full provenance of what we took, patched, and wrote ourselves. |

## Two ways to consume it

**1. As a Claude Code plugin**

```
/plugin marketplace add productize-life/productize-sdlc
/plugin install productize-sdlc
```

Then run `/sdlc-registry` in your project repo to initialize your control plane.

Pair it with [mattpocock/skills](https://github.com/mattpocock/skills) — this pack deliberately
patches only three of Matt's skills and tells you to adopt the rest as-is (see CROSSWALK.md).

**2. With your own AI agent (any framework)**

Everything here is plain markdown by design. Copy `registry/SDLC-SKILL-REGISTRY.template.md` into
your repo, fill it in, and point your agent at it — the registry is the control plane; the skill
files are instruction documents any agent can follow. No Claude-specific dependency.

## The three ideas it's built on

1. **The registry outranks skill self-claims.** A skill saying "I cover X" is just text; the
   registry is the source of truth. Consult it before claiming any phase.
2. **Skills are general engines; product context is a loadable layer.** One skill set serves many
   products — product-specific conventions live in reference layers the skill reads, never
   hardcoded in the skill body.
3. **Every autonomous pipeline needs a human-approval gate, defined in writing.** The pack's
   skills stop at yours.

## Credits

**Matt Pocock** — the pipeline skills in this pack are built on his
[mattpocock/skills](https://github.com/mattpocock/skills) (MIT). Three of his skills are patched
here (`implement`, `resolving-merge-conflicts`, `triage` → `sdlc-implement`, `sdlc-merge-resolve`,
`sdlc-triage`); ten more are recommended **adopted unchanged** — see CROSSWALK.md for the complete,
explicit list of what we took and what we changed. His work carries the foundation; our patches
are marked and traceable.

**Productize.life** — registry design, patched skills, templates, and this packaging.

## License

MIT — see [LICENSE](LICENSE). Portions derived from mattpocock/skills © Matt Pocock, MIT.
