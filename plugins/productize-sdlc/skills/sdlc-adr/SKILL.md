---
name: sdlc-adr
description: >
  Write and maintain Architecture Decision Records: context, decision, consequences, deferred
  items — small enough to actually get read, durable enough to survive the people who wrote them.
  Ours — no upstream. Triggers: "write an ADR", "record this decision", "we keep going back and
  forth on this".
disable-model-invocation: true
---

> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — where do ADRs live in this repo (context layer)?

An ADR records **one decision** at the moment it was made, so a cold reader six months later can
see *why* — not just *what*. If you keep re-litigating the same question, that question wants an
ADR.

## Template

```markdown
# ADR-NNN: <decision as a sentence, e.g. "Store the threshold as its own aggregate">

**Status**: proposed | accepted | superseded by ADR-XXX | deprecated
**Date**: YYYY-MM-DD  **Deciders**: <names/roles>

## Context
The situation that forced a decision. Facts, constraints, forces at play —
no solution talk yet. What happens if we do nothing?

## Options considered
### Option A: <name>
- pros / cons in one line each
### Option B: <name>
- pros / cons

## Decision
We chose **<option>**, because <the one or two reasons that actually decided it>.

## Consequences
- **Good**: what becomes easier / safer
- **Bad**: what we knowingly accept (cost, complexity, foreclosed options)
- **Risks**: what could prove us wrong, and the signal that would

## Deferred items
Questions we explicitly did NOT decide, each with an owner and a trigger
("revisit when X happens"). An empty section is allowed; a missing one is not.
```

## Rules

- One decision per ADR. A document covering three decisions is three ADRs stapled together.
- **Status is sacred.** When a decision changes, the old ADR gets `superseded by ADR-XXX` —
  never edited into pretending it said otherwise (history is the point).
- Consequences must include the **bad** ones. An ADR with only pros is a sales pitch, not a
  record.
- Deferred items are first-class: most bad "re-opened" decisions were never deferred on paper —
  they just evaporated until someone re-decided alone.
- Link the ADR from the spec/PR that consumes it; link the PR that implements it back.
- Keep it short enough to read in five minutes. Depth goes in linked evidence, not the body.
