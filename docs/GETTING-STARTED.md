# Getting Started

## 1. Install the plugin (Claude Code)

```
/plugin marketplace add productize-life/productize-sdlc
/plugin install productize-sdlc
```

Verify: the skills `sdlc-registry`, `sdlc-implement`, `sdlc-merge-resolve`, `sdlc-triage`
should be invocable.

> **Plugin cache gotcha:** if you maintain this pack, bump `version` in
> `plugins/productize-sdlc/.claude-plugin/plugin.json` on every change — an unchanged version
> string means nothing copies on update, and users must uninstall + reinstall to see changes.

## 2. Pair with the upstream pack

This pack assumes [mattpocock/skills](https://github.com/mattpocock/skills) is installed too —
it adopts ten of those skills unchanged and patches three. Install the upstream plugin, then read
[CROSSWALK.md](../CROSSWALK.md) for exactly which is which.

## 3. Initialize the registry in your project repo

In your project, run `/sdlc-registry`. It copies the registry template into your repo and
interviews you about: your tracker, your agent roles, your product tracks, and your
human-approval gate. Answer one question at a time; empty pipeline phases are expected on day one.

## 4. Fill in the tracker doc

Copy `templates/issue-tracker.template.md` into your repo at `docs/agents/issue-tracker.md`
and fill it: real states (don't invent new ones), real labels, and — most importantly — your
**human-approval gate** in writing. The triage and wayfinding skills read this file as the
source of truth.

## 5. Run your first feature through the chain

```
grilling → spec → to-tickets → sdlc-implement + tdd → code-review → PR
```

Start small: one feature, one ticket at a time, fresh context per ticket, seams written into the
ticket brief. After the first run, update the registry's selection rules with what you learned.
