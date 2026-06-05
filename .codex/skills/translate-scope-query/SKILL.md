---
name: translate-scope-query
description: >-
  Analytics copilot prototype. Takes a natural language question about customer
  metrics and determines whether it can be answered with existing scopes in the
  Notion "New Stats API Metrics" database. If yes, generates the TypeScript
  query or queries. If not, explains what is missing. Designed for engineers and
  PMs exploring what customer-facing analytics questions we can already surface.
---
# translate-scope-query

Answer a natural language analytics question using the existing scopes layer.

## Usage

```
/translate-scope-query <natural language question>
```

**Example questions:**
- "What was the automation rate of store X?"
- "Compare automation rate and success rate over time."
- "What is the median decrease in first response time for the AI Agent Sales skill?"
- "Show me handover interactions per channel for the last period."

---

## Step 1 — Parse the question

Identify ALL of the following (there may be more than one of each):

| Concept | What to look for |
|---|---|
| **Metrics** | What is being measured (automation rate, FRT, coverage rate, success rate, handovers, etc.). There can be multiple — list each. |
| **Filter values** | Specific entities mentioned: store ID/name, skill name, channel, date range, engagement type, integration. |
| **Grouping / breakdown** | "per channel", "by skill", "broken down by feature" |
| **Timeseries** | "over time", "trend", "how did X evolve", "per day/week/month", "compare over time" |
| **Comparison** | Two or more metrics side by side, or the same metric across two segments |
| **Aggregation** | average vs median, if specified |

---

## Step 2 — Check the codebase first

For each metric identified in Step 1, search for an existing scope file in:

```
apps/helpdesk/src/domains/reporting/models/scopes/
```

Use `Glob` with patterns derived from the metric name (try both camelCase and
partial name fragments, e.g. `*automationRate*`, `*handover*`, `*coverageRate*`).

**Run all Glob searches in parallel.**

If a file is found, read it immediately to extract:
- The scope variable name (e.g. `overallAutomationRateScope`)
- The declared `measures`, `filters`, `dimensions`, `timeDimensions`, `order`

Also read `apps/helpdesk/src/domains/reporting/models/scopes/constants.ts` for
enums relevant to any filter values mentioned (skill names, feature types, etc.).

> Only proceed to Step 3 for metrics whose scope file was **not** found in the
> codebase, or where the codebase file lacks the parameters needed to answer
> the question.

---

## Step 3 — Look up missing scopes in Notion

**Only for metrics not resolved in Step 2**, fetch the New Stats API Metrics
database — the single source of truth for all available scopes:

```
mcp__claude_ai_Notion__notion-fetch({
  id: "https://www.notion.so/gorgias/24e1ae2178f580f380cdc5be095c4af6"
})
```

Find the best-matching page by `Name` or `API endpoint (scope)`. Fetch **all
candidate pages in parallel**.

For each candidate page, fetch all its `Implementation details` pages
**in parallel**. Each detail page title follows:

```
<Scope Name> - <Type> - <Parameter Name>
```

Collect per scope:
- **Measures** — what can be computed
- **Filters** — what can narrow the data (with their parameter names)
- **Dimensions** — what the data can be grouped by
- **Time Dimensions** — whether timeseries is supported

Do not search any other Notion database or external source.

---

## Step 4 — Feasibility check

Using the scope parameters collected from either the codebase (Step 2) or
Notion (Step 3), determine for EACH intent from Step 1 whether it is satisfiable:

### ✅ Answerable
The scope exists AND has the required measure/filter/dimension.

### ⚠️ Partially answerable
The scope exists but is missing a specific filter or dimension needed to fully
answer the question (e.g. the user asks "by store" but `storeIntegrationId` is
not a dimension for this scope).

### ❌ Not answerable
No scope covers the metric, or a required capability is entirely absent.

**Always output a feasibility table before generating any code:**

```
| Intent | Scope | Feasible? | Gap (if any) |
|--------|-------|-----------|--------------|
| Automation rate for store X | overallAutomationRate | ✅ | — |
| Success rate over time | (no matching scope found) | ❌ | No success rate scope exists yet |
| Compare both over time | — | ⚠️ | Second metric not available |
```

If the question is fully ❌, stop here and explain what scope or parameter
would need to be added for it to become answerable. Do NOT generate code.

---

## Step 5 — Generate queries

Generate one query block per metric. For multi-metric / comparison questions,
generate all queries together with a note that they should be called in parallel.

### Query patterns

**Single value (e.g. "What is the automation rate?")**
```typescript
export const <queryName> = <scopeVariable>
    .defineMetricName(METRIC_NAMES.<METRIC_NAME_CONSTANT>)
    .defineQuery(() => ({
        measures: ['<measureName>'],
    }))
```

**Filtered to a specific entity (e.g. "for store X")**
```typescript
export const <queryName> = <scopeVariable>
    .defineMetricName(METRIC_NAMES.<METRIC_NAME_CONSTANT>)
    .defineQuery(({ ctx, config }) => ({
        measures: ['<measureName>'],
        filters: createScopeFilters(
            {
                ...ctx.filters,
                storeIntegrationId: withLogicalOperator([<storeId>]),
            },
            config,
        ),
    }))
```

> Note: when the question references a named entity ("store X", "AI Agent Sales")
> without a concrete ID, use a placeholder like `STORE_ID` or the matching enum
> constant from `constants.ts` (e.g. `AutomationSkillType.AiAgentSales`).

**Breakdown by dimension (e.g. "per channel", "by skill")**
```typescript
.defineQuery(() => ({
    measures: ['<measureName>'],
    dimensions: ['<dimensionName>'],
}))
```

**Timeseries (e.g. "over time", "trend")**
```typescript
.defineQuery(({ ctx }) => ({
    measures: ['<measureName>'],
    time_dimensions: [
        {
            dimension: 'eventDatetime',
            granularity: ctx.granularity,
        },
    ],
}))
```

**Filter + dimension combined**
```typescript
.defineQuery(({ ctx, config }) => ({
    measures: ['<measureName>'],
    dimensions: ['<dimensionName>'],
    filters: [
        ...createScopeFilters(ctx.filters, config),
        {
            member: '<filterMember>',
            operator: LogicalOperatorEnum.ONE_OF,
            values: [ConstantEnum.Value],
        },
    ] as any,
}))
```

**Comparison / multi-metric**

Generate each query separately with a clear label, then add:

> These two queries should be called in parallel and the results combined on the
> client side to render a comparison view.

### If a scope file does not exist yet

Output the `defineScope` block first, then the query. Add:

> ⚠️ This scope is not yet implemented in the frontend. Run
> `/implement-stats-scope` with the corresponding Linear ticket before using
> this query.

---

## Step 6 — Plain-English summary

After all code blocks, provide a short summary:

1. **What we can answer** — restate which part(s) of the question are covered and how
2. **What we cannot answer yet** — any gaps, with a brief note on what would be needed (a new scope, a new dimension, etc.)
3. **Caveats** — e.g. "store filtering uses `storeIntegrationId` (numeric ID), not a store name — you'll need to resolve the ID from the store name first"

---

## Query building reference

| Filter key | Enum / source | Example value |
|---|---|---|
| `automationFeatureType` | `AutomationFeatureType` in `constants.ts` | `AutomationFeatureType.AiAgent` |
| `aiAgentSkill` | `AutomationSkillType` in `constants.ts` | `AutomationSkillType.AiAgentSales` |
| `agentId` | `useAIAgentUserId` hook — see note below | `withLogicalOperator([AI_AGENT_ID])` |
| `storeIntegrationId` | numeric ID | `withLogicalOperator([storeId])` |
| `channel` | string | `withLogicalOperator(['email'])` |
| `periodStart` / `periodEnd` | always in `ctx.filters` | handled by `createScopeFilters` |

### Filtering by AI Agent via `agentId`

Some scopes expose an `agentId` filter instead of (or in addition to) `aiAgentSkill`
or `automationFeatureType`. When the question asks to scope data to the AI Agent
and the target scope supports `agentId` as a filter, use:

```typescript
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'

// In a component or hook:
const aiAgentUserId = useAIAgentUserId()
```

Then pass `aiAgentUserId` as the `agentId` filter value. The hook resolves the
AI Agent's numeric user ID by finding the bot account with role `UserRole.Bot`
whose email matches `AUTOMATION_BOT_EMAIL_ACROSS_ALL_ACCOUNTS`.

**When to prefer `agentId` over `automationFeatureType` / `aiAgentSkill`:**
- The scope lists `agentId` as a filter but does NOT list `automationFeatureType` or `aiAgentSkill`
- The question is about activity attributed to the AI Agent user (e.g. messages sent, handle time) rather than AI automation features

**When to prefer `automationFeatureType` / `aiAgentSkill`:**
- The scope is specifically an AI Agent automation scope (overallAutomationRate, handoverInteractions, etc.) and lists those filters explicitly

---

## Reference files

| File | Purpose |
|---|---|
| `apps/helpdesk/src/domains/reporting/models/scopes/overallAutomationRate.ts` | Canonical example with multiple query patterns |
| `apps/helpdesk/src/domains/reporting/models/scopes/constants.ts` | Skill, feature type, and other filter enums |
| `apps/helpdesk/src/domains/reporting/models/scopes/utils.ts` | `createScopeFilters` |
| `apps/helpdesk/src/domains/reporting/models/queryFactories/utils.ts` | `withLogicalOperator` |
| `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts` | `METRIC_NAMES` + `MetricScope` enum |
| `apps/helpdesk/src/domains/reporting/hooks/automate/useAIAgentUserId.ts` | `useAIAgentUserId` / `useAIAgentUser` — resolves the AI Agent's numeric user ID |
| Notion DB `24e1ae2178f580f380cdc5be095c4af6` | All scopes with measures / filters / dimensions |
