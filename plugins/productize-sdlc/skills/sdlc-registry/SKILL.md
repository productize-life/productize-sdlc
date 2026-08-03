---
name: sdlc-registry
description: >
  Initialize or consult the SDLC Skill Registry — the control plane that maps every SDLC phase
  to its primary skill, maps agent roles to skills, and outranks any skill's self-claim.
  Triggers: "init registry", "set up sdlc registry", "which skill covers this", "who uses what",
  "register this skill", "is there a skill for".
disable-model-invocation: true
---

# SDLC Registry — control plane for your skill set

The registry is a single markdown file in the repo (`SDLC-SKILL-REGISTRY.md`) that governs the
whole SDLC skill set: which skill owns which phase, which agent role may run which skill, and
what supersedes what. It is agent-agnostic — Claude Code, Codex, or your own agent can read it.

## Iron rules (the point of this skill)

1. **The registry outranks skill self-claims.** If a skill file claims coverage that disagrees
   with the registry, trust the registry and fix the skill. A provenance label or a "verified"
   mark someone typed into a skill is just text — the registry is the derived source of truth.
2. **Consult before claiming.** Before any agent claims work in an SDLC phase, check the Pipeline
   table for the primary skill of that phase.
3. **Same-turn updates.** Whenever a skill is adopted, patched, enhanced, or retired, update the
   registry in the same turn. A registry that lags reality is worse than none.

## Mode 1: Init (no registry yet)

1. Copy `registry/SDLC-SKILL-REGISTRY.template.md` (from this repo) to `SDLC-SKILL-REGISTRY.md`
   at the user's repo root (or wherever they keep control docs).
2. Interview — one question at a time:
   - **Tracker**: where do issues live (Linear / GitHub Issues / local markdown / other)?
     Fill the tracker section; point the user at `templates/issue-tracker.template.md` to fill
     in states, labels, and their **human-approval gate** (see below).
   - **Agent roles**: which concrete agents fill the generic roles (orchestrator / implementer /
     searcher / reviewer / pickup-daemon)? Map them in the Agent map table. Examples: Claude Code
     subagents, Codex CLI, custom daemons. Roles with no agent yet stay blank — don't invent.
   - **Tracks**: single product or several? For each product context, name the context layer
     (reference files the skills load when work is that product's).
3. Fill the Pipeline table with what actually exists today — skills in hand, marked 🟢/🔧/🟩 —
   and leave phases with no skill visibly empty. Empty phases are the point: they show the gaps.

## Mode 2: Consult (registry exists)

Read `SDLC-SKILL-REGISTRY.md` first. Answer from it:
- "Which skill covers <phase/work>?" → Pipeline table row.
- "May <agent> run <skill>?" → Agent map; if the pairing isn't listed, ask the owner before adding.
- "<Skill A> says it does X but <Skill B> does too" → selection rules, then supersede log.

## Mode 3: Register a new/changed skill

Add or update the Pipeline row (phase, source, status), add the agent pairing, and if it replaces
something, add a Supersede row (old → new → reason → date). Update the drift-check date.

## The human-approval gate

Every autonomous pipeline needs one rule that says which actions require a human. Define yours
explicitly in the registry (e.g. "auto-run only when the issue creator is a human", "irreversible
actions always ask"). Skills in this pack assume such a gate exists and will stop at it.
