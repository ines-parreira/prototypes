---
name: configure-managed-dashboard
description: >-
  Configure a "managed" analytics dashboard rendered by DashboardLayoutRenderer
  (e.g. Performance Overview). Has sub-modes for (A) adding the standardized
  value/breakdown/timeseries query factories on the scope and (B) wiring a new
  TrendCard component, its ReportConfig entry, the default layout slot, and the
  shared trend-card tests. Use when adding a metric card to a managed dashboard
  such as Performance Overview.
---
# configure-managed-dashboard

This skill configures a **managed dashboard** — a dashboard rendered by `DashboardLayoutRenderer` from `@repo/reporting`, whose layout, charts, and CSV export are declared via `ReportConfig` + a `DashboardLayoutConfig` (e.g. `PerformanceOverviewReport`).

It composes two sub-modes you can run independently:

- **Mode A — Add query factories** to a scope using `getGenericQueries`, with standardized metric names and tests.
- **Mode B — Configure a trend card**: create a new chart component, register it in `ReportConfig.charts`, add it to the `defaultLayoutConfig`, and wire up the trend-card tests.

In the future this skill will also delegate to `/configurable-graph-builder` and `/add-metric-table` for graph and table chart types. For now it covers KPI trend cards only.

---

## Step 0 — Gather required inputs

Always confirm these before doing anything else. Ask if missing.

1. **Target dashboard** — Which managed dashboard the work is for. Required for path resolution and metric-name prefix. Examples:
    - `Performance Overview` →
        - report config: `domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig.ts`
        - layout config: `domains/reporting/pages/performance/overview/config/defaultLayoutConfig.ts`
        - kpi charts dir: `domains/reporting/pages/performance/overview/charts/kpiCharts/`
        - trend-card tests: `domains/reporting/pages/performance/overview/charts/kpiCharts/tests/PerformanceOverviewTrendCards.spec.tsx`
        - `METRIC_NAMES` prefix: `PERFORMANCE_OVERVIEW_`
    - If the dashboard's paths can't be inferred from the name, **ask the user** for the four locations above (report config, layout config, kpi charts dir, trend-card tests file) plus the metric-name prefix.

2. **Mode** — `add-query-factories`, `configure-trend-card`, or both. If the user asked for "a new trend card" assume both, in that order. Otherwise ask:
    > "Do you want to (A) add the value/breakdown/timeseries query factories, (B) configure the trend card component + dashboard wiring, or both?"

Then run the matching mode(s) below.

---

## Mode A — Add query factories (value + breakdown + timeseries)

Adds the standardized `getGenericQueries(...)` triplet to an existing scope file, plus tests covering each shape.

### A.1 — Confirm inputs

Ask for any that are missing:

1. **Scope file** — Existing scope file under `domains/reporting/models/scopes/`. If it doesn't exist yet, stop and tell the user to run `/implement-stats-scope` first.
2. **Metric subject** — Short camelCase identifier used as the JS prefix for the exported factories, e.g. `averageCsat`, `firstResponseTime`. The exports will be `{subject}ValueQueryFactoryV2`, `{subject}BreakdownQueryFactoryV2`, `{subject}TimeseriesQueryFactoryV2`.
3. **Primary measure(s)** — The scope measure(s) shared by all three shapes. Inferable from the existing scope `measures` tuple; if multiple are plausible, confirm.
4. **Time dimension** — One value from the scope's `timeDimensions` tuple, used as the timeseries shape's `dimension`. Usually `createdDatetime` for ticket / survey scopes. If the scope has multiple time dimensions, confirm.
5. **Breakdowns needed** — Which dimensions need a dedicated per-dimension metric name override. If the user did not say, ask:
    > "Which dimensions should get a dedicated breakdown metric name (e.g. `channel`, `agentId`)? Leave empty if none."
6. **Timeseries dimensions needed** — Same question for the timeseries shape:
    > "Which dimensions should get a dedicated timeseries metric name?"

Use `getGenericQueries` from `domains/reporting/models/scopes/utils`; see its JSDoc and the **Reference** section below for behavior of the override maps.

### A.2 — Register metric names

In `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`, add `METRIC_NAMES` entries in the dashboard's existing section (look for the comment block matching the prefix from Step 0).

**Naming convention:** `{PREFIX}_{SUBJECT}_{SHAPE}` for the base triplet, and `{PREFIX}_{SUBJECT}_{SHAPE}_PER_{DIMENSION}` for per-dimension overrides. All uppercase, `_` separators; the string value is the kebab-case equivalent.

For Performance Overview with subject `averageCsat`:

```ts
PERFORMANCE_OVERVIEW_AVERAGE_CSAT_VALUE:
    'performance-overview-average-csat-value',
PERFORMANCE_OVERVIEW_AVERAGE_CSAT_BREAKDOWN:
    'performance-overview-average-csat-breakdown',
PERFORMANCE_OVERVIEW_AVERAGE_CSAT_BREAKDOWN_PER_CHANNEL:
    'performance-overview-average-csat-breakdown-per-channel',
PERFORMANCE_OVERVIEW_AVERAGE_CSAT_BREAKDOWN_PER_AGENT:
    'performance-overview-average-csat-breakdown-per-agent',
PERFORMANCE_OVERVIEW_AVERAGE_CSAT_TIMESERIES:
    'performance-overview-average-csat-timeseries',
PERFORMANCE_OVERVIEW_AVERAGE_CSAT_TIMESERIES_PER_CHANNEL:
    'performance-overview-average-csat-timeseries-per-channel',
```

> ⚠️ The override-map keys (e.g. `channel`, `agentId`) must match the dimension name they describe in the metric-name suffix. Watch for typos like `agentId` mapped to `..._PER_CHANNEL` — the build will pass but the metric string will be misleading. Read each pair back to the user before writing if anything looks off.

**Do not add these new metric names to `METRIC_NAMES_BY_SCOPE`.** That map exists only to route V1 metric names to the P1/P2/P3 V1→V2 migration feature flag in `core/flags/utils/newApiMetricFlags.ts`. Metrics built with `getGenericQueries` are V2-only and have no V1 counterpart, so they have nothing to migrate; any unmapped name falls through `resolveMetricFlag` to `ReportingUnsortedMetricMigration`, which defaults to the new API. Adding V2-only names to the map is dead weight at best and misleading at worst (it implies a migration that doesn't exist). The map will be decommissioned once the V1→V2 migration finishes; don't grow it.

### A.3 — Add the triplet to the scope file

Append to the end of the scope file. Use the existing reference in `domains/reporting/models/scopes/satisfactionSurveys.ts` (the `averageCsat*QueryFactoryV2` block).

```ts
const {subject}BaseQuery = () => ({
    measures: ['{primaryMeasure}'] as const,
})

export const {
    valueQueryFactory: {subject}ValueQueryFactoryV2,
    breakdownQuery: {subject}BreakdownQueryFactoryV2,
    timeseriesQueryFactory: {subject}TimeseriesQueryFactoryV2,
} = getGenericQueries({scope}Scope, {subject}BaseQuery, {
    valueMetricName: METRIC_NAMES.{PREFIX}_{SUBJECT}_VALUE,
    breakdownMetricName: METRIC_NAMES.{PREFIX}_{SUBJECT}_BREAKDOWN,
    breakdownDimensionMetricNames: {
        // omit this key entirely if none provided
        channel: METRIC_NAMES.{PREFIX}_{SUBJECT}_BREAKDOWN_PER_CHANNEL,
        agentId: METRIC_NAMES.{PREFIX}_{SUBJECT}_BREAKDOWN_PER_AGENT,
    },
    timeseriesMetricName: METRIC_NAMES.{PREFIX}_{SUBJECT}_TIMESERIES,
    timeseriesDimensionMetricNames: {
        channel: METRIC_NAMES.{PREFIX}_{SUBJECT}_TIMESERIES_PER_CHANNEL,
    },
    timeDimension: '{timeDimension}',
})
```

**Naming caveats — read carefully:**

- The destructure renames `valueQueryFactory` and `timeseriesQueryFactory` (functions: `(ctx) => BuiltQuery`) but **`breakdownQuery` is a routing handle** `{ config, build }`, not a function. Callers invoke `.build(ctx)`. The exported name still uses the `QueryFactoryV2` suffix for consistency, even though the value is not a plain factory function. This is the convention established in `satisfactionSurveys.ts`; keep it.
- Override maps are optional — omit them entirely (don't pass `breakdownDimensionMetricNames: {}`) when the user said no breakdowns are needed.

### A.4 — Tests

Add tests in `domains/reporting/models/scopes/tests/{scopeFile}.spec.ts`. Group them under a new `describe('performance overview {subject} triplet', ...)` (or whatever dashboard the metric belongs to) inside the existing `QueryV2Factory methods` block.

> ⚠️ **Granularity in the test context** — The value and breakdown shapes both auto-inject `time_dimensions` _only when_ `ctx.granularity` is set. Many older scope specs (e.g. `resolutionTime.spec.ts`) define a shared `context` _without_ `granularity` because their pre-existing factories don't depend on it. **Don't reuse that bare context for the triplet tests** — define a local `granularContext = { ...context, granularity: 'day' as AggregationWindow }` inside the new `describe` block and assert against it, or your value/breakdown assertions will silently miss `time_dimensions`. Import `AggregationWindow` from `domains/reporting/models/stat/types` if it isn't already.

Required cases — pattern matches `satisfactionSurveys.spec.ts:451-525`:

1. **Value** — `{subject}ValueQueryFactoryV2(granularContext)` returns the expected shape: `metricName`, `scope`, `measures`, `timezone`, period `filters`, and auto-injected `time_dimensions` (the value shape inherits the scope's first time dimension when `ctx.granularity` is set — assert it).
2. **Breakdown default (unmapped dim)** — Call `.build({...ctx, dimensions: ['<unmapped dim>']})` and assert the full query with the default `metricName`. Choose a dimension that is **not** in `breakdownDimensionMetricNames`.
3. **Breakdown per-dimension overrides** — One `it.each(...)` row per mapped dimension, asserting `.metricName` equals the kebab-case override (only this field needs checking — the shape mirrors case 2).
4. **Breakdown multi-dim fallback** — `.build({...ctx, dimensions: ['<mapped>', '<other>']})` resolves to the default metric name (single-dim only routes; multi-dim falls back).
5. **Timeseries default** — `{subject}TimeseriesQueryFactoryV2({...ctx, dimensions: []})` returns the full shape including `time_dimensions: [{ dimension: '<timeDimension>', granularity: 'day' }]` and `limit: 10000`.
6. **Timeseries per-dimension overrides** — One assertion per mapped timeseries dimension on `.metricName`.

Import all three factories. Remember to call `.build(ctx)` on the breakdown export.

Reference: `apps/helpdesk/src/domains/reporting/models/scopes/tests/satisfactionSurveys.spec.ts` (the `performance overview average CSAT triplet` describe block).

### A.5 — Verify

```bash
pnpm --filter @repo/helpdesk test -- {scopeFile}.spec.ts
```

Use the package `typecheck` script (tsgo) for type errors — never invoke `tsc` directly.

---

## Mode B — Configure a trend card

Wires a new KPI trend card into a managed dashboard. Assumes the value + (optional) timeseries query factories from Mode A already exist.

### B.1 — Confirm inputs

1. **Card name** — PascalCase, ends in `Card`, e.g. `OverviewAverageCSATCard`. Used as the component name and the basis for the chart enum value.
2. **Chart enum value** — kebab-case string used as the `ChartType.Card` id in the dashboard's chart enum, e.g. `performance-overview-average-csat-card`. Derive from the card name; confirm.
3. **Value query factory** — Existing `*ValueQueryFactoryV2` (from Mode A or already in the scope).
4. **Timeseries query factory** — Existing `*TimeseriesQueryFactoryV2`. Optional: if the card is value-only without inline sparkline, omit `timeSeriesView`.
5. **Tooltip / label source** — Either an existing `METRIC_TOOLTIPS.*` entry (preferred when the dashboard's other cards use it — Performance Overview does) or a new entry to add.
    - If new: add to `domains/reporting/config/metricTooltipDefinitions.ts` under the dashboard's section (look for a comment like `// Performance overview`).
    - Alternative: a local `OverviewMetricConfig: Record<ChartEnum, { title; hint }>` map co-located with the report config (see `domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig.ts` for the pattern). Use this only if the dashboard already follows it.
6. **Metric format** — `'decimal' | 'integer' | 'percentage' | 'currency' | ...` (`MetricTrendFormat`). Default `'decimal'` for CSAT-like scores.
7. **Interpret as** — `'more-is-better' | 'less-is-better' | 'neutral'`. Most KPI cards are `'more-is-better'`.

### B.2 — Create the card component

Path: `<kpi-charts-dir>/<CardName>.tsx`.

Reference: `domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard.tsx`.

```tsx
import { TrendCard } from '@repo/reporting'

import { useReportingTrendCardProps } from 'domains/reporting/hooks/useReportingTrendCardProps'
import { getStatsTrendHook } from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    {subject}TimeseriesQueryFactoryV2,
    {subject}ValueQueryFactoryV2,
} from 'domains/reporting/models/scopes/{scopeFile}'
import type { DashboardChartProps } from 'domains/reporting/pages/dashboards/types'

export const {CardName} = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const trendCardProps = useReportingTrendCardProps({
        useTrend: getStatsTrendHook({subject}ValueQueryFactoryV2),
        chartConfig: chartConfig!,
        isAiAgentTrendCard: false,
        chartId,
        dashboard,
        timeSeriesView: {
            queryFactory: {subject}TimeseriesQueryFactoryV2,
        },
    })

    return <TrendCard {...trendCardProps} />
}
```

Conventions:

- Always use absolute imports via `domains/...` aliases — never `../`. (Project rule.)
- `isAiAgentTrendCard: false` for non-AI-Agent managed dashboards.
- Omit `timeSeriesView` entirely if no timeseries factory exists.
- Do not add comments unless logic is non-obvious.

### B.3 — Register the chart in `ReportConfig`

Open `<report-config-file>` (e.g. `PerformanceOverviewReportConfig.ts`).

1. Add a new value to the dashboard's chart enum:

    ```ts
    export enum PerformanceOverviewChart {
        AverageCSATCard = 'performance-overview-average-csat-card',
        {CardEnumKey} = '{chart-enum-value}',
    }
    ```

2. Import the new component and (if used) its tooltip config + value factory for CSV export.
3. Add an entry under `charts`:

    ```ts
    [{ChartEnum}.{CardEnumKey}]: {
        chartComponent: {CardName},
        label: METRIC_TOOLTIPS.{tooltipKey}.title, // or local config title
        csvProducer: [
            {
                type: DataExportFormat.Trend,
                fetch: getStatsTrendFetch({subject}ValueQueryFactoryV2),
                metricFormat: '{metricFormat}',
            },
        ],
        tooltipConfig: METRIC_TOOLTIPS.{tooltipKey},
        chartType: ChartType.CardWithTimeseries, // use ChartType.Card if no timeSeriesView
        metricFormat: '{metricFormat}',
        interpretAs: '{interpretAs}',
    },
    ```

`getStatsTrendFetch` is imported from `domains/reporting/hooks/useStatsMetricTrend`. The fetch must use the **same value factory** as the card's `useTrend` so the CSV export stays consistent with on-screen numbers.

### B.4 — Add to the default layout

Open `<layout-config-file>` (e.g. `config/defaultLayoutConfig.ts`).

Append a new item to the appropriate `sections[].items` array (usually the `kpis` section for KPI cards):

```ts
{
    chartId: {ChartEnum}.{CardEnumKey},
    gridSize: 3,
    visibility: true,
},
```

`gridSize` follows the dashboard's existing grid scale (most managed dashboards use a 12-column grid with `gridSize: 3` per KPI card → 4 cards per row). If the section is empty or uses a different grid, ask the user.

### B.5 — Tests

Open `<trend-cards-spec-file>` (e.g. `PerformanceOverviewTrendCards.spec.tsx`).

This file drives all trend-card tests through a `testCases` array consumed by `describe.each`. Add one entry per new card:

```ts
{
    name: '{CardName}',
    Component: {CardName},
    config: {
        label: '{Label}',
        tooltipConfig: {
            title: '{Title}',
            caption: '{Caption}',
        },
        metricFormat: '{metricFormat}',
        value: <sample number>,
        prevValue: <sample number>,
    },
    timeSeriesView: { queryFactory: expect.any(Function) }, // omit if no timeSeriesView
    // drillDownMetricName: '{name}', // include only if the card has a drilldown
},
```

The shared `describe.each` already asserts that `useReportingTrendCardProps` is called with the right shape and that the result flows into `TrendCard`. No new `it` blocks are needed unless the card has unique behavior.

> ⚠️ **Audit existing testCases entries when you re-run the spec.** The shared assertion uses strict `toHaveBeenCalledWith({ ..., ...(timeSeriesView ? { timeSeriesView } : {}) })`. If an existing card's component passes `timeSeriesView` to `useReportingTrendCardProps` but its `testCases` entry omits the property, the test will fail as soon as the spec is re-run. When you add a new card with `timeSeriesView`, scan every neighbor entry, cross-check their component's `useReportingTrendCardProps(...)` call, and add the missing `timeSeriesView: { queryFactory: expect.any(Function) }` line. Same rule applies to `drillDownMetricName`.

Reference: `domains/reporting/pages/performance/overview/charts/kpiCharts/tests/PerformanceOverviewTrendCards.spec.tsx`.

### B.6 — Verify

```bash
pnpm --filter @repo/helpdesk test -- {trendCardsSpec}
```

Manually verify the card renders by running the app and navigating to the dashboard if the change is non-trivial (new chart type, new tooltip, layout change).

---

## Reference — `getGenericQueries` behavior

From `domains/reporting/models/scopes/utils.ts`:

- Returns `{ valueQuery, valueQueryFactory, breakdownQuery, breakdownQueryFactory, timeseriesQuery, timeseriesQueryFactory }`.
- `valueQueryFactory` and `timeseriesQueryFactory` are `(ctx) => BuiltQuery`.
- `breakdownQuery` and `timeseriesQuery` are **routing handles** `{ config, build(ctx) }` that route via `ctx.dimensions`:
    - 0 or 2+ dimensions → default metric name.
    - 1 dimension matching `{breakdown,timeseries}DimensionMetricNames` → override metric name.
    - 1 unmapped dimension → default metric name.
- The value shape auto-injects `time_dimensions: [{ dimension: scope.timeDimensions[0], granularity: ctx.granularity }]` when `ctx.granularity` is set. Tests must assert this; it surprises people who expect the value query to be "just the number."
- The timeseries shape pins the `timeDimension` from the options to its `time_dimensions` and sets `limit: 10000`.

---

## Critical reference files

| File                                                                                                                           | Role                                        |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| `apps/helpdesk/src/domains/reporting/models/scopes/satisfactionSurveys.ts`                                                     | Reference scope with `getGenericQueries`    |
| `apps/helpdesk/src/domains/reporting/models/scopes/tests/satisfactionSurveys.spec.ts`                                          | Reference triplet tests (Mode A)            |
| `apps/helpdesk/src/domains/reporting/models/scopes/utils.ts`                                                                   | `getGenericQueries`, `getValueQuery`, etc.  |
| `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`                                                                     | `METRIC_NAMES` + `METRIC_NAMES_BY_SCOPE`    |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard.tsx`                  | Reference trend-card component (Mode B)     |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig.ts`                            | Reference `ReportConfig` + chart enum       |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/PerformanceOverviewReport.tsx`                                 | Reference managed-dashboard page entry      |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/config/defaultLayoutConfig.ts`                                 | Reference `DashboardLayoutConfig`           |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/kpiCharts/tests/PerformanceOverviewTrendCards.spec.tsx` | Reference shared trend-card spec            |
| `apps/helpdesk/src/domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig.ts`                              | Alternative local `title + hint` config map |
| `apps/helpdesk/src/domains/reporting/config/metricTooltipDefinitions.ts`                                                       | `METRIC_TOOLTIPS` registry                  |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricTrend.ts`                                                             | `getStatsTrendHook`, `getStatsTrendFetch`   |
| `apps/helpdesk/src/domains/reporting/hooks/useReportingTrendCardProps.ts`                                                      | Trend-card props builder                    |

---

## Future extensions

- **Configurable graph chart**: delegate to `/configurable-graph-builder` — pass the dashboard's report config, layout config, and the metric to add.
- **Breakdown table**: delegate to `/add-metric-table` — but note that skill currently targets `analyticsOverview` / `analyticsAiAgent`; the table-section paths for other managed dashboards may need to be wired first.

These are not yet implemented as Mode C / Mode D of this skill; do not attempt them here without an updated skill spec.

---

## Key conventions

- Metric-name prefix matches the dashboard, e.g. `PERFORMANCE_OVERVIEW_*`. String value is the kebab-case equivalent.
- Factory export names use `QueryFactoryV2` suffix even for the breakdown routing handle, for consistency with the satisfaction-surveys reference.
- Always destructure with renames in the scope file: `valueQueryFactory: {subject}ValueQueryFactoryV2`, etc. — never use the raw names.
- Trend-card tests live in the shared `*TrendCards.spec.tsx` driven by `testCases`; add a row, don't write a new spec file.
- Absolute imports only (`domains/...`); no `../` relative paths.
- No comments unless the WHY is non-obvious.
