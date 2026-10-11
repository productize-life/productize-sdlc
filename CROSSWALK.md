# CROSSWALK

Two tables: (1) **intent → skill** — what to reach for, and how the skills chain;
(2) **provenance** — exactly what this pack takes from upstream and what it patches.

## 1. Intent → skill

| You say / situation | Skill |
|---|---|
| "Set up the registry" / first time in a repo | `sdlc-registry` (Mode 1 init) |
| "Which skill covers this?" / "May this agent run that?" | `sdlc-registry` (Mode 2 consult) |
| "Implement this ticket / spec" | `sdlc-implement` (needs seams in the brief) |
| "Merge conflict / rebase stuck" | `sdlc-merge-resolve` |
| "What needs attention? / triage this issue" | `sdlc-triage` |
| "Break this plan into tickets" | upstream `to-tickets` (adopt as-is) |
| "Red-green this" / test-first build | upstream `tdd` (adopt as-is) |
| "Sharpen this plan before we build" | upstream `grilling` / `grill-with-docs` (adopt as-is) |
| "Research X against primary sources" | upstream `research` (adopt as-is) |
| "Design the module interface / seams" | upstream `codebase-design` (adopt as-is) |
| "Plan this huge foggy effort" | upstream `wayfinder` (adopt as-is) |
| "Review the diff against standards/spec" | upstream `code-review` (adopt as-is) |
| "Design the screens / wireframe this / map the user journey" | `sdlc-product-design` |
| "How does this code work?" / before changing a subsystem | `sdlc-code-how` |
| "Why is it built this way?" / history of a decision | `sdlc-code-why` |
| "What could this fix break?" / after a fix is chosen | `sdlc-blast-radius` |
| "Is the PR green / ready?" / after opening it | `sdlc-watch-pr` |
| "Log your decisions" / unattended or multi-phase run | `sdlc-show-me-your-work` |

## The chain (how a feature walks through)

```
grilling (with the human) → to-spec / your spec skill → sdlc-product-design (UI work, before tickets) → to-tickets (sdlc-triage writes the seams)
  → sdlc-code-how before touching unfamiliar code → sdlc-implement + tdd per ticket
  (fresh context each, seams in the brief) → sdlc-blast-radius on the chosen change
  → code-review + a second-engine review → sdlc-pr → sdlc-watch-pr to a verdict → human merge
```

Long or unattended runs keep a trail with `sdlc-show-me-your-work` the whole way.

On-ramps: `sdlc-triage` (incoming issues), `wayfinder` (big foggy efforts → then to-spec),
`diagnosing-bugs` (something broken). Vocabulary layer underneath everything:
`domain-modeling` + `codebase-design`.

## 2. Provenance — what we took, what we patched

Upstream: [mattpocock/skills](https://github.com/mattpocock/skills) — Matt Pocock's engineering
skills, MIT licensed. Verified against upstream commit `2ab9580` (2026-07-28) on 2026-08-03.

**Adopt as-is (install the upstream plugin, use unchanged):** `to-tickets`, `tdd`, `grilling` (+ `grill-me`,
`grill-with-docs` wrappers), `research`, `codebase-design`, `wayfinder`, `code-review`,
`diagnosing-bugs`, `domain-modeling`, `prototype`.

**Patched in this pack** (upstream kept as the reference; patches listed so drift is traceable):

| This pack | Upstream skill | What the patch changes and why |
|---|---|---|
| `sdlc-implement` | `implement` | Upstream says "commit your work to the current branch" — clashes with branch-first + PR-gated discipline and assumes local builds. Patch: branch-first always, seams must arrive with the brief (no mid-flight human gate for AFK agents), end at review/PR not push, remote builds wrapped. |
| `sdlc-merge-resolve` | `resolving-merge-conflicts` | Upstream says "always resolve; never `--abort`" — a bad automated resolution can destroy others' work. Patch: abort-and-escalate allowed (capture state to a handoff note first) when intent is unclear, foreign commits are mixed in, or checks keep failing. |
| `sdlc-triage` | `triage` | Upstream assumes a GitHub-style PR surface as core. Patch: tracker-first (Linear-first with a GitHub variant), PR surface becomes an optional add-on, and an explicit human-approval-gate warning: agent-authored briefs do not auto-run where the gate requires a human creator. |

**Not adopted, and why:** `setup-matt-pocock-skills` (writes config into your repo and edits
CLAUDE.md — we hand-write `docs/agents/issue-tracker.md` instead, advisory only) · `ask-matt`
(router — this CROSSWALK fills that role).

**Adapted from [pstack](https://github.com/cursor/plugins/tree/main/pstack)** by Lauren Tan
(poteto), MIT, at v0.15.15 (`ccb5507`), via the harness-neutral mirror `backnotprop/pstack`:

| This pack | pstack skill | What we changed |
|---|---|---|
| `sdlc-code-how` | `how` | Renamed so it does not catch plain "how do I…" chat; Cursor-only model routing removed. |
| `sdlc-code-why` | `why` | Renamed; source adapters kept generic (git, tracker, postmortems; chat and observability only when connected). |
| `sdlc-blast-radius` | `blast-radius` | Triggers tightened around `diagnosing-bugs` and this pack's skills; pstack-only references removed. |
| `sdlc-watch-pr` | `watch-pr` | Advisory verdict only: never merges, arms auto-merge, rebases or force-pushes. CLI and its tests kept unchanged. |
| `sdlc-show-me-your-work` | `show-me-your-work` | Cross-family reviewer named per harness; added: no secret values in evidence, and a gate reported as passing needs a row showing it was made to go red first. |

Upstream pstack stays canonical for these five: when it moves, diff the new release against the
pinned ref above and carry real fixes over, the same way as the Pocock patches.

In 0.3.0, `sdlc-triage` also gained a mandatory **Seams** section on `ready-for-agent` briefs, and
`sdlc-review` gained **Step 0**: prove the reviewer's tree runs its own tests before reviewing.

## 3. Ours — grown in a private fleet lab, no upstream

Shared as public good (วิทยาทาน), generalized from several years of running AI-agent SDLC
practice. Product-specific internals were stripped; the disciplines are the shareable part.

| Skill | What it carries |
|---|---|
| `sdlc-registry` | The control-plane idea itself: registry > skill self-claim; consult before claiming; same-turn updates. |
| `sdlc-spec` | One-phase-per-turn grooming; the **Testing Decisions / seams appendix** as the contract between spec and test-first build; multi-pass spec review (completeness / consistency / dev-readiness / testability bounce). |
| `sdlc-qe` | Quadrant-mapped test plans read from the spec's seams; the **vacuous-assertion audit** (`undefined === undefined` → PASS is a critical finding). |
| `sdlc-review` | 2nd-engine ≠ maker-engine; P1/P2/P3 taxonomy with failure scenarios; warn-not-block; understanding gate before reporting. |
| `sdlc-pr` | Intent-first PR body (Summary + Intent, file tables, review-fixes), review-matrix routing by risk, mandatory 2nd-engine section, **Accountability with runnable evidence**. |
| `sdlc-ddd` | Coach-not-generator domain discovery; the one-file write exception (CONTEXT.md) for confirmed language only. |
| `sdlc-product-design` | Our synthesis of published methods (sources cited in the skill). UX/product design as a phase before the build: JTBD per persona, journey maps whose "cognitive state" is three checkable questions (expectation, wayfinding, decision), lo-fi wireframes with interaction notes that test design reads. |
| `sdlc-adr` / `sdlc-pe-review` | ADRs small enough to read, with sacred status and first-class deferred items; technical decisions translated to PM-decidable questions with a recommendation. |

Templates: `templates/pr-template.md` (the exact PR body we use), `templates/issue-tracker.template.md`.

Complementary disciplines (handoffs, verify-before-claim, no-fabricated-output, second-opinion)
ship in the sibling kit `productize-starter-fleet-kit` in this org — we point there instead of
duplicating.

## Keeping this pack honest

- When upstream moves, re-run the drift check: diff the patched skills against the new upstream,
  record the result in your registry's drift-check log.
- A patch that upstream later absorbs should be retired back to upstream (supersede log).
- This pack never edits upstream files; it layers beside them.
