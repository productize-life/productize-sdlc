# Source playbooks

The `sdlc-code-why` skill uses one investigator per available evidence category, each reading a single source-specific playbook below. The playbooks are concrete examples for common MCPs or app connectors. Use a playbook only when that source is connected and authenticated, except for source control history, which is always available through the repo.

| Category | Playbook | Example MCP it documents |
|---|---|---|
| Source control history | [`code-archaeology.md`](./sources/code-archaeology.md) | git, `gh` |
| Issue / ticket tracker | [`linear.md`](./sources/linear.md) | Linear, or adapt for Jira, GitHub Issues, Plane, Shortcut |
| Long-form documents | [`notion.md`](./sources/notion.md) | Optional: Notion, or adapt for Confluence, Google Docs, Coda |
| Real-time team chat | [`slack.md`](./sources/slack.md) | Optional: Slack, or adapt for Discord, Microsoft Teams, Mattermost |
| Infrastructure observability | [`datadog.md`](./sources/datadog.md) | Optional: Datadog, or adapt for New Relic, Honeycomb, Grafana, Splunk |
| Error / exception tracking | [`sentry.md`](./sources/sentry.md) | Optional: Sentry, or adapt for Rollbar, Bugsnag, Airbrake |
| Product analytics warehouse | [`databricks.md`](./sources/databricks.md) | Optional: Databricks SQL, or adapt for Snowflake, BigQuery, ClickHouse, dbt |

Cross-cutting:

- [`incident-postmortem.md`](./sources/incident-postmortem.md). Add this if the target code looks defensive (null checks, retry, timeout, rate limit, feature flag, egress guard, OOM handler) and at least one incident-capable source is connected.
