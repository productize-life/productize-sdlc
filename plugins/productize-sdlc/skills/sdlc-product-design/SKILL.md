---
name: sdlc-product-design
description: >
  Turn requirements into an implementable UX/UI spec: JTBD per persona, journey maps with
  checkable cognitive annotations, a screen map, lo-fi ASCII wireframes, and an interaction spec
  that test design can read. Runs after requirements and before implement. Our synthesis,
  informed by the cited frameworks.
  Triggers: "wireframe", "UI spec", "screen design", "user journey", "JTBD", "lo-fi", "mockup",
  "design the screens".
disable-model-invocation: true
---

> 🚦 **First: open `SDLC-SKILL-REGISTRY.md`** — this is the UX/product design phase. It sits
> between requirements (`sdlc-spec`) and implement. Design comes **before** the build, not as a
> review after the UI exists: a design consult that arrives after the screens are coded finds its
> blockers when the structure is already written.

Think in user jobs (JTBD), not features. Design from the user's perspective inward.

## Phase 1: Discover and understand

Use the interview framework in [interview-framework.md](interview-framework.md): A.1–A.3 here,
the domain-expert track (A.4) while reading requirements, the engineering track (A.5) after
Phase 4 and before Phase 5.

1. Read the existing docs (business requirements, spec, acceptance criteria). List the business
   rules that need a screen.
2. Identify personas: environment, frequency of use, technical comfort.
3. Clarify the platform (desktop-first or mobile-first).
4. Run Five Whys on any requirement that feels surface-level.
5. **One question per message, no exceptions.** Never list several questions at once.

## Phase 2: JTBD analysis

For each persona, a JTBD table:

```markdown
| # | Job statement | Trigger | Outcome | Requirement § |
|---|---------------|---------|---------|---------------|
| J1 | [verb] + [object] + [context] | [event] | [measurable result] | §X.Y |
```

Start with an action verb. Include a performance target. Map every job to a requirement section.

## Phase 3: User journey maps

Journey maps for the 3–5 most critical flows, as ASCII flow diagrams. At each step, annotate the
cognitive state, pain points and design implications.

**"Cognitive state" means these three questions, not a loose adjective.** They are our
selection from John Whalen's broader six-minds model in *Design for How People Think*, not a
summary of it:

- **Expectation:** arriving at this step, what does the user expect to happen next? People fill
  gaps from familiar patterns; the step that breaks an expectation is where people drop out.
- **Wayfinding:** do they know where they are, where the next step is, and how they would notice
  a mistake?
- **Decision:** what must they decide here, and do they frame the problem the way the system does?
  (Novices and experts frame it differently.)

Write each as a checkable line ("expects to see the total before confirming"), never as "feels
hesitant".

## Phase 4: Screen map and navigation

A screen inventory table plus an ASCII navigation tree. Group by the user's mental model, not the
data model. At most two levels of nesting.

## Phase 5: Lo-fi wireframes

ASCII wireframes per screen, applying [design-psychology.md](design-psychology.md). After each
wireframe: interaction notes, validation notes, and psychology notes.

## Phase 6: Shared components and interaction spec

Component table, responsive strategy, error-handling patterns.

## Phase 7: Cross-reference and completeness

```markdown
| Screen | Requirement § | Key business rules | Psychology applied |
```

## Until a real user tries it, it is a hypothesis

Everything above can be produced from documents alone. Say so in the spec: mark it unvalidated
until at least one real user has walked the key flows (a paper or clickable prototype is enough),
and record what changed after.

## Output and handoff

One markdown file next to the spec (for example `ui-spec.md`). Structure and quality checklist:
[output-format.md](output-format.md).

- The **interaction notes** (happy path and error states per screen) are the input for test design
  → `sdlc-qe`.
- Building the screens is a separate step with your own UI tooling; this skill stops at the spec.

## Product context

The skill is a general engine. Product-specific conventions (design system, naming) load from
that product's own reference files, and only when the work is for that product. Never
carry one product's conventions into another's design.

Reply in the language the user writes in.
