# SDLC Skill Registry

> Control plane for this repo's SDLC skill set. Pattern by [Productize.life](https://productize.life)
> (`productize-sdlc`). Fill every `{placeholder}`, delete rows you don't use, keep the iron rules.

## Iron rules

1. **The registry outranks skill self-claims.** If a skill file claims coverage that disagrees
   with this registry, trust the registry and fix the skill.
2. **Consult before claiming.** Before any agent claims work in an SDLC phase, check the Pipeline
   table for that phase's primary skill.
3. **Same-turn updates.** Adopt / patch / enhance / retire a skill → update this registry in the
   same turn.
4. **The registry is a map, not a command.** The human owner decides; the registry informs.

## Tracks — skills are general engines; product context is a loadable layer

Skills in this registry are **general engines** — not locked to any product. What differs per
product is the **context layer** the skill loads:

- **{product A} context** = `{reference files the skill reads when work is product A's}`
- **{product B / general}** = {…}

**Track decision:** {how work is classified — e.g. label on the issue, repo it lives in}

**Rules:**
1. No product-specific content hardcoded in skill bodies — it belongs in a reference layer the
   skill reads.
2. Never apply one product's conventions to another product's work.
3. A new product starts on the general track; give it its own context layer once conventions settle.

## Pipeline table (SDLC phase → skill)

Statuses: 🟢 adopted-as-is · 🔧 patched (patch noted in CROSSWALK/supersede log) · 🟩 ours · ⏸️ parked

Suggested starter mapping if you install the `productize-sdlc` pack (edit to your reality —
"source" = `pack` means this repo's plugin, `pocock` means mattpocock/skills, `you` means your own):

| Phase | Skill | Source | Status | Notes |
|---|---|---|---|---|
| Requirements — interview | `sdlc-spec` | pack | 🟩 | one-phase-per-turn + seams appendix |
| Requirements — synthesis | `to-spec` | pocock | 🟢 | synthesis of an existing conversation |
| Spec review | `sdlc-spec` Mode 2 | pack | 🟩 | |
| Domain modelling | `sdlc-ddd` | pack | 🟩 | coach style; persists CONTEXT.md |
| Understand existing code (how it works) | `sdlc-code-how` | pack (pstack, MIT) | 🟩 | cited walkthrough before you change anything; new in 0.3.0 |
| Understand existing code (why it is this way) | `sdlc-code-why` | pack (pstack, MIT) | 🟩 | cited rationale from git, tracker, postmortems; new in 0.3.0 |
| Design — UX/product (JTBD, journeys, screen map, lo-fi wireframes) | `sdlc-product-design` | pack | 🟩 | before implement, not a review after the UI exists; interaction notes feed `sdlc-qe`; new in 0.3.1 |
| Design decisions (ADR) | `sdlc-adr` + `sdlc-pe-review` | pack | 🟩 | write + PM-language review |
| Grilling (sharpen plan/design) | `grilling` | pocock | 🟢 | human-in-loop only |
| Big-effort planning | `wayfinder` | pocock | 🟢 | |
| Breakdown → tickets | `to-tickets` | pocock | 🟢 | |
| Triage | `sdlc-triage` | pack | 🔧 | tracker-first patch of pocock `triage` |
| Implement | `sdlc-implement` | pack | 🔧 | branch-first/seams patch of pocock `implement`; `--plan` = plan only, no source edits; `--from-plan` = build from it, red first |
| TDD loop | `tdd` | pocock | 🟢 | seams arrive via the spec appendix or the triage brief |
| Test design from AC | `sdlc-qe` | pack | 🟩 | quadrants + vacuous-audit |
| Bug diagnosis | `diagnosing-bugs` | pocock | 🟢 | |
| Fix safety (after a fix is chosen) | `sdlc-blast-radius` | pack (pstack, MIT) | 🟩 | check the one "safe because" fact by running code; new in 0.3.0 |
| Research | `research` | pocock | 🟢 | |
| Code review | `sdlc-review` (+ `code-review` lens) | pack+pocock | 🟩/🟢 | 2nd engine ≠ maker engine |
| Merge conflicts | `sdlc-merge-resolve` | pack | 🔧 | abort-and-escalate patch |
| PR / release | `sdlc-pr` | pack | 🟩 | template in `templates/pr-template.md` |
| PR — watch to a verdict (after open) | `sdlc-watch-pr` | pack (pstack, MIT) | 🟩 | readiness verdict only; never merges; new in 0.3.0 |
| Owner decision — the page the human acts from | `sdlc-decision-page` | pack | 🟩 | ask + PRD trace + evidence; set the team's notification channel here (default: PR body + chat) |
| Decision trail for unattended / multi-phase runs | `sdlc-show-me-your-work` | pack (pstack, MIT) | 🟩 | append-only TSV + cross-family review of the trail; new in 0.3.0 |
| Deploy / publish | {your deploy skills} | you | — | not shipped in the pack |
| Handoff / continuity | {write-handoff, verify-claims} | starter-fleet-kit | 🟢 | sibling kit in this org |

**Empty phases are signal, not shame** — they show where your pipeline has no coverage yet.

## Agent map — who runs what

Fill with your real agents; leave blanks rather than invent. Generic roles → examples:
orchestrator (Claude Code main session), implementer (a worker subagent), searcher (cheap lookup
subagents), reviewer (a second engine), pickup-daemon (an autonomous runner).

| Agent | Runs |
|---|---|
| {orchestrator} | {planning/design/human-gated skills} |
| {implementer} | {implement + tdd — seams must arrive in the brief} |
| {searcher} | {research fan-out} |
| {reviewer} | {review only — never implements} |
| {pickup-daemon} | {reversible work only — code goes to the implementer lane} |

## Selection rules (when two skills could both fit)

- Spec via interview → {skill} · spec via synthesis of an existing conversation → {skill}
- Review for defects in a diff → {review skill} · review for standards/spec compliance → {other}
- One clear feature → {tickets skill} · big/foggy multi-session effort → {wayfinding skill}
- Test design from acceptance criteria → {skill} · red-green loop while implementing → {tdd}
- Grilling always happens with the human live — never delegated to an agent.

## Governance rules

1. New/changed skills enter the Pipeline table with phase + status + owner before use.
2. Patched skills record what they patch and from which upstream commit (supersede log below).
3. Retired skills move to the supersede log — never just disappear.
4. Tracker labels/states the pipeline relies on live in `docs/agents/issue-tracker.md`
   (template in the `productize-sdlc` repo) — list the ones you created here:
   {labels created, date}
5. {your human-approval gate — e.g. "auto-run only when the issue creator is the human owner"}

## Supersede & patch log

| Old | Became | Reason | Date |
|---|---|---|---|
| {old skill/fork} | {new skill} | {why — drift, clash with fleet discipline, …} | {date} |

## Drift-check log

- {date}: {what was checked against which upstream commit}
