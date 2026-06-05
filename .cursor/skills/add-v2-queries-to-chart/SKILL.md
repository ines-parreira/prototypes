---
name: add-v2-queries-to-chart
description: Adds v2 query factories to an existing stats scope and wires them into the chart's hook(s). Use after /implement-stats-scope when the scope exists but has no query factories yet.
---
# add-v2-queries-to-chart

Add v2 query factories to an existing stats scope and wire them into a chart's hook(s). This skill handles the step **after** `/implement-stats-scope` — when the scope file exists but has no query factories, and the hook(s) still use v1-only queries.

---

## Step 1 — Identify the hook chain

Read the chart component given as argument (e.g. `AnalyticsAiAgentCoverageRateCard.tsx`). Find the data-fetching hook it uses, then follow imports recursively until reaching the function that **directly** calls one of:

- `useMetricTrend` / `getTrendHook` / `getTrendFetch`
- `useTrendFromMultipleMetricsTrend`
- `useGenericTrend` with custom ratio logic
- `getStatsTrendHook` / `useStatsMetricTrend` / `fetchStatsMetricTrend`
- `useTimeSeries` / `fetchTimeSeries`
- `useMetricPerDimensionV2` / `useTimeSeriesPerDimension`
- `usePostReportingV2`

There may be wrapper hooks (e.g. component → `useCoverageRateTrend` → `useGenericTrend` → `useMetricTrend`). Read each layer and record the file path and function name at each level.

### 1b — Find the fetch counterpart (CSV export)

Every chart card that appears in a report config has a `fetch{Name}Trend` function registered in the `csvProducer` field. This function must also be updated alongside the hook.

To find it: search the report config file(s) that reference the chart component (e.g., `AnalyticsAiAgentShoppingAssistantReportConfig.ts`). Look for the `csvProducer` entry for the chart's key — the `fetch` property points to the fetch function that needs updating.

Record:

- The fetch function name (e.g., `fetchConversionRateTrend`)
- Its file path
- The report config file where it is registered

---

## aiAgent domain cards — scoping check

Apply this section when the chart component lives in:

- `apps/helpdesk/src/pages/aiAgent/analyticsAiAgent/`
- `apps/helpdesk/src/pages/aiAgent/analyticsOverview/charts/`

### a) Check if hook/fetch are shared outside the domain

Use grep/search to find all usages of the identified hook and fetch functions across the codebase.

- If they are **only used within the two aiAgent domain folders** → proceed normally (update them in-place).
- If they are **also used by files outside these domains** (e.g., imported from `domains/reporting/...` by other pages) → **do not modify the existing hook/fetch**. Instead, create new dedicated functions (see step b).

### b) Create dedicated hook and fetch (when needed)

Naming: `useAiAgent{MetricName}Trend` / `fetchAiAgent{MetricName}Trend`

Place the new file alongside the chart component or in a co-located `metrics/` or `hooks/` subfolder within the same domain folder.

### c) Check the feature flag

Look at the layout config file(s) that reference the chart (e.g., `aiAgentShoppingAssistantLayoutConfig.ts`). Check whether the chart entry has `requiresFeatureFlag: true`.

- **`requiresFeatureFlag: true`** → the chart is behind a feature flag, so implement **v2 only** (use Pattern D: `getStatsTrendHook` / `getTrendFetch` with the v2 factory, no v1 fallback).
- **No feature flag** → implement **both v1 and v2** using the standard dual-path approach (Pattern A or C as applicable).

---

## Step 2 — Check scope existence

Determine the scope name from the hook name or chart name (e.g. `useCoverageRateTrend` → `aiAgentCoverageRate`).

Look for `apps/helpdesk/src/domains/reporting/models/scopes/{scopeName}.ts`.

- If the scope file does **not** exist → stop and tell the user:
    > The scope file `{scopeName}.ts` does not exist. Please run `/implement-stats-scope` first.
- If it exists → check whether the scope file already exports a `{metricName}QueryFactoryV2` (or `{metricName}QueryV2Factory`). If it does, skip to Step 5.

---

## Step 3 — Determine the hook pattern

Identify which pattern the innermost hook uses:

| Pattern                        | Key function                                            | Description                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Simple trend**           | `getTrendHook` / `getTrendFetch` / `useMetricTrend`     | Single v1 query factory, optionally takes a v2 factory as second arg                                                                                                                     |
| **B — Multiple metrics trend** | `useTrendFromMultipleMetricsTrend`                      | v1 returns multiple measures; picks one by key                                                                                                                                           |
| **C — Computed/ratio trend**   | `useGenericTrend` with custom ratio logic               | Metric derived from 2+ separate queries. Two variants: **C-fetch** (v1 uses fetch functions → `useState`/`useDeepEffect`) or **C-hooks** (v1 uses React hooks → `enabled` flag approach) |
| **D — Pure v2 trend**          | `getStatsTrendHook` / `useStatsMetricTrend`             | No v1 fallback (new or already v2-only)                                                                                                                                                  |
| **E — Time series**            | `useTimeSeries` / `fetchTimeSeries`                     | Time-bucketed data, accepts optional `queryV2` second arg                                                                                                                                |
| **F — Per-dimension**          | `useMetricPerDimensionV2` / `useTimeSeriesPerDimension` | Broken down by agent, channel, etc.                                                                                                                                                      |

If the pattern is ambiguous, read the relevant hook implementation (e.g. `domains/reporting/hooks/useMetricTrend.ts`) for clues.

---

## Step 4 — Identify / add METRIC_NAMES entry

The v2 query factory requires a `METRIC_NAMES.*` constant (passed to `.defineMetricName()`).

Read `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts` and check:

1. Does the relevant `METRIC_NAMES.*` constant exist?
2. Does `METRIC_NAMES_BY_SCOPE[MetricScope.{ScopeEnumName}]` exist? Does it reference this metric name?

**Key naming convention:** `{REPORT_NAME}_{TAB_NAME}_{METRIC_NAME}` — all uppercase with `_` separators. The tab segment is only included when the metric lives under a specific tab within the report. Examples:

- Coverage rate in the AI Agent → All agents tab: `AI_AGENT_ALL_AGENTS_COVERAGE_RATE`
- First response time in the Support Performance Overview report (no tab): `SUPPORT_PERFORMANCE_OVERVIEW_FIRST_RESPONSE_TIME`

The string value is the kebab-case equivalent (e.g. `AI_AGENT_ALL_AGENTS_COVERAGE_RATE` → `'ai-agent-all-agents-coverage-rate'`).

**aiAgent report config prefix lookup table:**

| Report config file                                                                             | `METRIC_NAMES` prefix          |
| ---------------------------------------------------------------------------------------------- | ------------------------------ |
| `aiAgentShoppingAssistantLayoutConfig.ts` / `AnalyticsAiAgentShoppingAssistantReportConfig.ts` | `AI_AGENT_SHOPPING_ASSISTANT_` |
| `AnalyticsAiAgentAllAgentsReportConfig.ts`                                                     | `AI_AGENT_ALL_AGENTS_`         |
| `AnalyticsAiAgentSupportAgentReportConfig.ts`                                                  | `AI_AGENT_SUPPORT_AGENT_`      |
| `AnalyticsOverviewReportConfig.ts`                                                             | `AI_AGENT_OVERVIEW_`           |

Example: `ConversionRate` card in `AnalyticsAiAgentShoppingAssistantReportConfig.ts` → key is `AI_AGENT_SHOPPING_ASSISTANT_CONVERSION_RATE`, string value `'ai-agent-shopping-assistant-conversion-rate'`.

If the constant is missing:

- Ask the user which report and tab (if any) the metric belongs to, then derive the key following the convention above. Confirm with the user before adding.
- Add it to `METRIC_NAMES` in `metricNames.ts` in the appropriate comment section (grouped by report).
- Add `[MetricScope.{ScopeEnumName}]: [METRIC_NAMES.{METRIC_NAMES_KEY}]` to `METRIC_NAMES_BY_SCOPE` (replacing the empty array if an entry already exists).

---

## Step 5 — Add query factory to scope file

Read the scope file to understand its structure, then append the query factory.

The factory name uses the pattern: `{metricName}QueryV2Factory` where `{metricName}` is the camelCase hook subject (e.g. `coverageRate` → `coverageRateQueryV2Factory`).

```typescript
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'

export const {metricName} = {scopeName}Scope
    .defineMetricName(METRIC_NAMES.{METRIC_NAMES_KEY})
    .defineQuery(({ ctx }) => ({
        measures: ['{primaryMeasure}'] as const,
    }))

export const {metricName}QueryV2Factory = (ctx: {ScopeEnumName}Context) =>
    {metricName}.build(ctx)
```

**`defineQuery` body depends on the pattern:**

- **Patterns A / B / D / E / F**: list the primary measure from the scope's `measures` array.
- **Pattern C (computed ratio)**: use the scope's single computed measure directly (e.g. `coverageRate`). The v2 API computes the ratio server-side — no need to fetch two measures. Explain this to the user.
- **For time series (Pattern E)**: add `timeDimensions` with `granularity: ctx.granularity`:
    ```typescript
    .defineQuery(({ ctx }) => ({
        measures: ['{primaryMeasure}'] as const,
        timeDimensions: [{ dimension: '{timeDimensionName}', granularity: ctx.granularity }] as const,
    }))
    ```
- **For per-dimension (Pattern F)**: add `dimensions` from the scope's `dimensions` array.

---

## Step 6 — Wire up the hook

Update the hook file(s) identified in Step 1 to import the new factory and thread it through.

### Pattern A — `getTrendHook` / `getTrendFetch`

File: typically `domains/reporting/hooks/metricTrends.ts` or a dedicated hook file.

```typescript
// Add import:
import { {metricName}QueryV2Factory } from 'domains/reporting/models/scopes/{scopeName}'

// Before:
export const use{Name}Trend = getTrendHook(v1QueryFactory)
export const fetch{Name}Trend = getTrendFetch(v1QueryFactory)

// After:
export const use{Name}Trend = getTrendHook(v1QueryFactory, {metricName}QueryV2Factory)
export const fetch{Name}Trend = getTrendFetch(v1QueryFactory, {metricName}QueryV2Factory)
```

### Pattern B — `useTrendFromMultipleMetricsTrend`

```typescript
useTrendFromMultipleMetricsTrend(
    filters, timezone,
    v1QueryFactory, V1Measure,
    {metricName}QueryV2Factory, '{v2MeasureName}',
)
```

### Pattern C — Computed / ratio trend

First determine which sub-variant applies by checking whether the v1 path uses plain fetch functions (promise-based) or React hooks.

#### C-fetch — v1 path is fully promise-based (e.g. `useAIAgentAutomationRateTrend`)

Add a v2 branch inside the `fetchXxxTrend` helper that calls `fetchStatsMetricTrend` when `stage === 'live' || stage === 'complete'`. Keep the v1 path as the fallback branch using the existing `useState` + `useDeepEffect` approach.

Reference: `apps/helpdesk/src/domains/reporting/hooks/automate/useAIAgentAutomationRateTrend.ts` lines 26–69:

- Lines 26–44: hook side (`useState` + `useDeepEffect` with `useStatsMetricTrend`)
- Lines 52–69: fetch side (`fetchStatsMetricTrend` in the v2 branch)

#### C-hooks — v1 path uses React hooks (e.g. `useGenericTrend`, `useMetricTrend`, `useAllTickets`)

Hooks rules forbid conditional hook calls, so both v1 and v2 paths must be called **unconditionally**. Use `useGetNewStatsFeatureFlagMigration` synchronously to compute `isV2`, then guard each path with `enabled`:

```typescript
const stage = useGetNewStatsFeatureFlagMigration(metricName)
const isV2 = stage === 'live' || stage === 'complete'

const v1Trend = useGenericTrend(
    {
        a: useHookA(filters, timezone, !isV2),
        b: useMetricTrend(..., !isV2),
    },
    transformer,
    !isV2,
)

const v2Trend = useStatsMetricTrend(
    queryV2Factory({ filters, timezone }),
    queryV2Factory({ filters: { ...filters, period: getPreviousPeriod(filters.period) }, timezone }),
    isV2,
)

return isV2 ? v2Trend : v1Trend
```

**Note:** `enabled` params are already present in `useMetricTrend` (5th param), `useStatsMetricTrend` (3rd param), `useGenericTrend` (3rd param), and all `getTrendHook`-based hooks including `useAllTickets` (3rd param) — no need to add them.

Reference: `apps/helpdesk/src/domains/reporting/hooks/automate/useCoverageRateTrend.ts`

### Pattern D — Pure v2

```typescript
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import { {metricName}QueryV2Factory } from 'domains/reporting/models/scopes/{scopeName}'

export const use{Name}Trend = getStatsTrendHook({metricName}QueryV2Factory)
```

### Pattern E — Time series (`useTimeSeries`)

```typescript
import { {metricName}QueryV2Factory } from 'domains/reporting/models/scopes/{scopeName}'

// Before:
return useTimeSeries(v1TimeSeriesQuery(filters, timezone, granularity))

// After:
return useTimeSeries(
    v1TimeSeriesQuery(filters, timezone, granularity),
    {metricName}QueryV2Factory({ filters, timezone, granularity: granularity as AggregationWindow }),
)
```

### Pattern F — Per-dimension

Pass the v2 factory as the optional second argument to `useMetricPerDimensionV2` or `useTimeSeriesPerDimension`. Consult the hook signature for exact parameter names.

---

## Step 7 — Add / update tests

For every hook file that was modified, find or create a test file (e.g. `use{Name}Trend.spec.ts` alongside the hook).

**Required test cases:**

- When the v2 feature flag stage is `'live'`, the hook calls the v2 factory (not the v1 query).
- When the flag stage is `'off'`, the hook falls back to v1.

**Reference test patterns:**

- `domains/reporting/hooks/tests/` — for trend hook patterns
- `domains/reporting/hooks/automate/` — for automate-style hook patterns (Pattern B / C)

If a scope test file already exists at `domains/reporting/models/scopes/tests/{scopeName}.spec.ts`, verify it still passes — no new cases are needed unless the factory changes filter behavior.

**For Pattern C-hooks**: mock the sub-hooks directly rather than fetch functions. Use `renderHook` without `waitFor` (everything is synchronous). Mock:

- `useGetNewStatsFeatureFlagMigration` → controls `isV2`
- `useStatsMetricTrend` (default export) → v2 path result
- v1 sub-hooks (`useAllTickets`, `useMetricTrend` default export, `useGetCustomTicketsFieldsDefinitionData`) → v1 path stubs

Reference: `apps/helpdesk/src/domains/reporting/hooks/automate/test/useCoverageRateTrend.spec.ts`

---

## Step 8 — Verify

Run tests for modified files:

```bash
pnpm test @repo/helpdesk {scopeName}.spec
pnpm test @repo/helpdesk {hookName}.spec
```

Check TypeScript errors in test files using IDE diagnostics (more reliable than `pnpm typecheck` for `.spec.ts` files):

```
mcp__ide__getDiagnostics({ uri: "file:///path/to/...spec.ts" })
```

Run typecheck for non-test source files:

```bash
pnpm typecheck @repo/helpdesk
```

Fix formatting:

```bash
pnpm format:fix @repo/helpdesk
```

---

## Critical reference files

| File                                                                                  | Role                                                            |
| ------------------------------------------------------------------------------------- | --------------------------------------------------------------- |
| `apps/helpdesk/src/domains/reporting/models/scopes/{scopeName}.ts`                    | **Add query factory here**                                      |
| `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`                            | `METRIC_NAMES` constants + `METRIC_NAMES_BY_SCOPE`              |
| `apps/helpdesk/src/domains/reporting/hooks/metricTrends.ts`                           | Pattern A wiring (`getTrendHook` / `getTrendFetch`)             |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricTrend.ts`                    | Pattern D: `getStatsTrendHook`, `fetchStatsMetricTrend`         |
| `apps/helpdesk/src/domains/reporting/hooks/useTimeSeries.ts`                          | Pattern E: `useTimeSeries` accepts optional `queryV2`           |
| `apps/helpdesk/src/domains/reporting/hooks/useMetricPerDimension.ts`                  | Pattern F: per-dimension hooks                                  |
| `apps/helpdesk/src/domains/reporting/hooks/automate/automationTrends.ts`              | Pattern B reference                                             |
| `apps/helpdesk/src/domains/reporting/hooks/automate/useAIAgentAutomationRateTrend.ts` | **Pattern C-fetch reference** (lines 26–69)                     |
| `apps/helpdesk/src/domains/reporting/hooks/automate/useCoverageRateTrend.ts`          | **Pattern C-hooks reference** (hooks-compliant v1/v2 dual path) |
| `apps/helpdesk/src/domains/reporting/models/scopes/firstResponseTime.ts`              | Scope file with query factories — structural reference          |
| `apps/helpdesk/src/domains/reporting/models/scopes/scope.ts`                          | `defineScope`, `Context`, `BuiltQuery` types                    |

---

## Key conventions

- **Query factory export name**: `{metricName}QueryFactoryV2` (camelCase + `QueryFactoryV2` suffix)
- **Intermediate builder**: `{metricName}` (the `MetricBuilder` chain result, before `.build()`)
- **Context type**: `{ScopeEnumName}Context` — imported from the scope file
- **`{metricName}`** is the camelCase hook subject (e.g. `coverageRate`, `firstResponseTime`)
- Do NOT add comments to generated code unless the logic is genuinely non-obvious
