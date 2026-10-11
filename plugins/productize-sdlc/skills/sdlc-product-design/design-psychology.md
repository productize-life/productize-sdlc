# Human psychology in design

Examples below use an expense-approval product. Swap in your own domain.

## Cognitive load

Working memory is small (often estimated at about four chunks), and how much fits depends on familiarity and grouping. Treat every unnecessary element as a cost, not the number as a budget.

| Principle | Application | Example |
|---|---|---|
| Chunking | Group related fields | Expense form: "Details" / "Receipt" / "Approval" |
| Progressive disclosure | Show only what is needed now | Claim list → click → detail panel |
| Recognition over recall | Show options instead of asking people to remember | Category dropdown, not free text |
| Sensible defaults | Pre-fill common values | Currency defaults to the company's |
| Proximity | Keep related items together | Validate button next to the field it checks |

## Decision architecture

| Technique | When | Example |
|---|---|---|
| Default option | A recommended choice exists | Default approver = the requester's manager |
| Friction for danger | Prevent accidental destruction | Deleting a submitted claim → two-step confirm |
| Social proof | Users are unsure | "Most claims in this category attach a receipt" (aggregate, true, no names) |
| Loss aversion | Motivate action | "Unsaved changes will be lost" on leaving a half-filled form |
| Anchoring | Set expectations | Show the policy limit next to the amount field |

## Behavior-driven patterns

- **Habit loop** (trigger → action → reward): a receipt prompt → one tap to upload → an
  immediate "submitted" with a timestamp.
- **Error prevention over error recovery:** disable the button until preconditions are met,
  validate inline as people type, preview the impact before a destructive action.
- **Fitts's law** (bigger and closer is faster): make primary actions large and easy to reach.
  Use your platform's touch-target guideline for the size (for example Material's 48dp); that
  number comes from the guideline, not from the law.
- **Hick's law** (more equally likely options take longer to choose from): cut and order choices,
  show a sensible default, and split long flows into steps. There is no universal maximum count.

## Persuasion models

**Fogg (B = M × A × T):**

| Factor | Strategy | Example |
|---|---|---|
| Motivation | Show why it matters | "Attach the receipt now so the approver doesn't send it back" |
| Ability | Reduce steps | A claim needs three fields |
| Trigger | Prompt at the right moment | Notify the approver when a claim arrives |

**EAST:** Easy (pre-fill from context, auto-calculate) · Attractive (summary cards with clear
status colors) · Social (true, aggregate norms only) · Timely (prompt when the task is due, not
before).

## ⛔ Limits on nudges (apply before using anything above)

- Every nudge states the benefit **to the user**. If the benefit is only to the business, drop it.
- No made-up or unverifiable social proof. No fake urgency or countdowns that are not real.
- No peer headcounts or named comparisons without consent; use aggregates.
- In workplace tools, a nudge that pressures an employee about their own pay, time or
  performance needs an explicit privacy and fairness review, not just a design review.

## Patterns by audience

- **Admin (desktop-first):** data table + modal, sidebar navigation, chunked forms.
- **Approver (responsive):** card-based queue, summary first.
- **Submitter (mobile-first):** big buttons, bottom navigation, one-handed use.

## Sources

Chunking and working memory: George Miller (1956), Nelson Cowan (2001) · Fitts's law: Paul
Fitts (1954) · Hick's law: William Edmund Hick (1952) and Ray Hyman (1953) · Behavior model
B = MAT: BJ Fogg · EAST: the Behavioural Insights Team · Nudges and choice architecture: Richard
Thaler and Cass Sunstein, *Nudge*. These are heuristics; check them against your own users.
