# Interview and discovery framework

## A.1 The Mom Test: extract real needs

Ask about actual behavior, not hypothetical preferences. People misjudge what they want; accounts
of what they already did are still biased by memory and social desirability, but they are far more
reliable than predictions. (After Rob Fitzpatrick, *The Mom Test*.)

| Category | Question | Why it works |
|---|---|---|
| Current workflow | "How do you do this part today?" | Shows the real workflow |
| Time and frequency | "How often? How many minutes?" | Gives a performance target |
| Pain points | "When did this last go wrong?" | Reveals error states and recovery |
| Workarounds | "What shortcut have you found?" | A workaround is an unmet need |
| Worst case | "What is the worst case you have hit?" | Gives edge cases |
| Stakeholders | "Who else needs to see this?" | Finds hidden personas |
| Success | "If this were great, how would your day change?" | Gives the desired outcome |

**Avoid:** "Would you want this?" (always yes), "Is this UI OK?" (leading), "How many reports do
you need?" (invites bloat).

## A.2 Five Whys (from the Toyota Production System)

When a requirement feels surface-level, dig to the root.

```
"We want an Export button" → Why? → "To send it to my manager" → Why not view it in the app?
→ "My manager has no account" → Why? → "Seats are expensive"
→ Root need: a read-only viewer role, not Export
```

Apply it to overly specific requests, duplicated functionality, and anything with no JTBD behind it.

## A.3 Structured clarification

- **Round 1, context and personas:** who are the users, what do they use today, what is the main pain?
- **Round 2, behavior and environment:** devices, location, network constraints, existing design system?
- **Round 3, expectations and scope:** fidelity level, reference products, v1 vs v2?

Each round is a topic, not a message: ask its questions **one per message**, in order.

## A.4 Domain expert track

Read the requirements first, then list the gaps: rules not fully explained, edge cases not covered,
ambiguous terms. For each business rule ask: "In the UI, how is this shown, how is it entered, and
what is validated?"

## A.5 Engineering track

Ask after the screen map (Phase 4), before wireframes (Phase 5).

| Topic | Question | Design impact |
|---|---|---|
| Data volume | "How many rows in production?" | Pagination vs infinite scroll |
| Response time | "How long does the API take?" | Loading state, skeletons |
| Real-time | "Does it need to be live?" | Push vs polling |
| Offline | "Is it used without a connection?" | Offline-first design |
| Concurrent edits | "Can two people edit at once?" | Conflict and locking UI |
| Export | "How long does a 10k-row export take?" | Async progress vs instant |

Rule of thumb: shows data → ask volume and speed. Accepts input → ask validation and concurrency.
Mobile → ask offline and payload.
