# Updating from upstream

This pack is a **patch layer** over [mattpocock/skills](https://github.com/mattpocock/skills).
Upstream moves; here is how to stay honest about drift.

## The three update kinds (know which one you're doing)

| Kind | What moves | Where it bites |
|---|---|---|
| Upstream released a new version | his skills change under your patches | your patch silently reverts, or your drift log rots |
| You improved a patched skill | your patch gets better | the registry + CROSSWALK must record it same-turn |
| Upstream absorbed your patch | the reason for the patch disappears | retire the patch back to upstream-as-is |

## Drift check (run periodically, record it)

1. Note the upstream commit you last verified (CROSSWALK.md, provenance section).
2. Fetch upstream and diff each patched skill against its upstream counterpart:
   `sdlc-implement` ↔ `implement` · `sdlc-merge-resolve` ↔ `resolving-merge-conflicts` ·
   `sdlc-triage` ↔ `triage`.
3. For each diff: is it still *just our patch*, or did upstream move? If upstream moved, decide
   per hunk: keep our patch, adopt the upstream change, or both.
4. Record the check in **your registry's drift-check log** (date + upstream commit + verdict), and
   update CROSSWALK.md's verified-commit line.

## Rules

- **Never edit upstream files** — this pack layers beside them; the patch skills quote the
  upstream text they modify so drift stays visible.
- **Same-turn updates**: any patch change updates CROSSWALK.md + the registry supersede log in the
  same turn.
- **Retire patches that upstream absorbed**: move the skill back to "adopt as-is", add a supersede
  row (old patched → upstream current, reason, date).
- **Version bump on every release of this pack** (`plugin.json` → `version`) — unchanged versions
  don't propagate to installed users.

## Rule zero: fetch before you compare

Never diff against your memory of upstream. Fetch the current upstream first; compare against
what is actually there, dated and committed.
