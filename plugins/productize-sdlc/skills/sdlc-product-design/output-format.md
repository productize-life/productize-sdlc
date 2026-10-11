# Output Format

## File Structure

Single markdown file (for example `ui-spec.md`, next to the spec):

```
§0 Document Structure
§1 JTBD — per persona
§2 User Journey Maps — core flows (with cognitive annotations)
§3 Screen Map + Navigation
§4-§N Lo-fi Wireframes — grouped by persona
§(N+1) Shared Components + Interaction Spec
Appendix: Screen → Requirement cross-reference
```

## Wireframe Template

```
┌──────────────────────────────────────────────┐
│  Breadcrumb > Screen Title        [Actions]  │
├──────────────────────────────────────────────┤
│                                              │
│  [Layout content — tables, forms, cards]     │
│                                              │
└──────────────────────────────────────────────┘
```

After each wireframe include:
- Interaction notes (click/tap behavior)
- Validation notes (errors and display)
- Psychology notes (which principles applied and why)

## Quality Checklist

- [ ] Interview questions asked (or answered from docs)
- [ ] 5 Whys applied to ambiguous requirements
- [ ] Every persona has JTBD with performance targets
- [ ] Every critical flow has a journey map whose steps answer expectation, wayfinding and decision as checkable lines
- [ ] Every nudge passes the limits in design-psychology.md (user benefit stated, no fake proof or urgency)
- [ ] The spec is marked as unvalidated until at least one real user has walked the key flows
- [ ] Every screen maps to at least one requirement section
- [ ] Every requirement section with UI implications has a screen
- [ ] Wireframes show real field names from data model
- [ ] Interaction notes cover happy path + error states
- [ ] Psychology principles applied and annotated
- [ ] Mobile screens are mobile-first (not desktop shrunk)
- [ ] Navigation structure fits existing product pattern
- [ ] Cross-reference table is complete
