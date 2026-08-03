# Issue Tracker — {project/fleet name}

> Fill this in once; skills in `productize-sdlc` read it as the source of truth for tracker
> mechanics. Template by [Productize.life](https://productize.life).

## Tracker

- **Which tracker**: {Linear / GitHub Issues / local markdown / other}
- **Where**: {team/project/repo identifiers}
- **Access**: {which CLI/MCP/API agents use}

## States (use your tracker's real states — don't invent new ones)

| State | Meaning in your pipeline |
|---|---|
| {Backlog} | not prioritized |
| {Todo} | ready to start (subject to the approval gate below) |
| {In Progress} | an agent/human is working |
| {In Review} | done, waiting for the human — also where HOLD/blocked items sit if you have no Blocked state |
| {Done / Canceled / Duplicate} | terminal |

## Labels

- **Executor** (who runs it): {e.g. agent-on-workstation / autonomous-box / human-only}
- **Kind**: {Bug / Improvement / Feature — use existing if present}
- **Pipeline** (create deliberately, once): `ready-for-agent`, `needs-triage`, `needs-info`, `wontfix`
  (+ `wayfinder:*` set if you use big-effort planning)
- **Track** (if multi-product): {e.g. a label per product context}

## Human-approval gate (load-bearing — define yours explicitly)

{Example: "auto-run happens only when: label = agent-executor AND state = Todo AND the issue's
creator is the human owner. Agent-authored briefs therefore never auto-run — the human must touch
the issue to start it."}

Rules that follow from your gate:
1. {…}
2. {code/irreversible work routes to which lane — e.g. HOLD + a human reviews, or a separate implementer lane}

## PR surface (optional)

{Where PRs live and how agents read them — e.g. "GitHub via `gh`; triage reads PRs on demand"}

## Wayfinding operations (only if you use big-effort planning)

- Map issue = one issue labelled {wayfinder:map}; children = decision tickets {wayfinder:research /
  prototype / grilling / task}
- Claim = assignee: {how an agent claims the map}
- Frontier = tickets whose blockers are all done; resolve at most one ticket per session (research exempt)
- Human-in-loop tickets ({grilling/prototype}) resolve only through the live human — agents never
  stand in; use your handoff mechanism to reach them
- A finished map hands off to spec synthesis — never straight to implementation

## Triage operations

- Entry: label `needs-triage` → categorise with kind labels
- Verify bugs by reproducing from the reporter's steps (wrap commands for remote machines)
- Every agent comment starts with the AI disclaimer (see `sdlc-triage`)
- Ready = `ready-for-agent` + executor label + state {Todo} — subject to the approval gate above
