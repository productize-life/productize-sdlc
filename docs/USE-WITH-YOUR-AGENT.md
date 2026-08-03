# Using the registry with your own AI agent (any framework)

The registry is **plain markdown by design** — the control plane does not depend on Claude Code.
If your team runs Codex, Gemini CLI, Cursor, or a custom agent loop, you can still use everything
here.

## What to copy

1. `registry/SDLC-SKILL-REGISTRY.template.md` → `<your-repo>/SDLC-SKILL-REGISTRY.md` (fill it in)
2. `templates/issue-tracker.template.md` → `<your-repo>/docs/agents/issue-tracker.md` (fill it in)
3. The skill files under `plugins/productize-sdlc/skills/*/SKILL.md` — each is a self-contained
   instruction document. Copy the ones you want into wherever your agent reads instructions from
   (AGENTS.md includes, system-prompt attachments, your own skill format).

## How your agent should use it

Give your agent three standing instructions:

1. **Consult before claiming.** Before taking work in any SDLC phase, read
   `SDLC-SKILL-REGISTRY.md` and check the Pipeline table for that phase's primary skill and the
   Agent map for whether this agent is allowed to run it.
2. **Registry over self-claims.** If a skill/instruction file claims coverage that contradicts
   the registry, the registry wins.
3. **Stop at the human-approval gate.** The gate defined in `docs/agents/issue-tracker.md` is
   absolute — e.g. if auto-run requires a human-created issue, agent-authored briefs wait for the
   human. Never route around it.

## Role mapping

The Agent map uses generic roles. Map them to your setup:

| Generic role | Claude Code example | Other examples |
|---|---|---|
| orchestrator | main session | your planning agent / the human's direct session |
| implementer | worker subagent | Codex CLI task runner |
| searcher | cheap lookup subagents | any read-only fan-out |
| reviewer | second-model review | a different model than the implementer, always |
| pickup-daemon | autonomous task runner | cron-driven agent that polls the tracker |

## Minimal non-Claude setup

If you want the smallest possible version: copy the filled registry + tracker doc into the repo,
add the three standing instructions above to your agent's system prompt, and skip the plugin
entirely. The skills become useful one at a time as your pipeline grows.
