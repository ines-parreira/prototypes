---
name: configure-managed-dashboard
description: >-
  Configure a "managed" analytics dashboard rendered by DashboardLayoutRenderer
  (e.g. Performance Overview). Has sub-modes for (A) adding the standardized
  value/breakdown/timeseries query factories on the scope, (B) wiring a new
  TrendCard component, its ReportConfig entry, the default layout slot, and the
  shared trend-card tests, (C) wiring a configurable bar/line graph
  (page-specific dimension config, graph component, ReportConfig entry, layout
  section, tests), (D) wiring a metric breakdown table (shared metric config,
  columns, per-dimension data + download hooks, custom-dashboard-aware
  component, ReportConfig entry, layout section, tests), (E) exposing the
  dashboard's reports in the custom-dashboard chart picker (reports-config
  section, lookup-helper wiring, feature-flag gating, AvailableChartIds union,
  tests), and (F) scaffolding a brand-new managed dashboard from scratch (route,
  page entry, ReportConfig, layout, constants, CSV export hook). Use when adding
  a metric card, configurable chart, or breakdown table to a managed dashboard
  such as Performance Overview, when making its charts addable to custom
  dashboards, or when creating a new managed dashboard.
---
# configure-managed-dashboard

This skill configures a **managed dashboard** — a dashboard rendered by `DashboardLayoutRenderer` from `@repo/reporting`, whose layout, charts, and CSV export are declared via `ReportConfig` + a `DashboardLayoutConfig` (e.g. `PerformanceOverviewReport`).

It composes six sub-modes you can run independently:

- **Mode A — Add query factories** to a scope using `getGenericQueries`, with standardized metric names and tests.
- **Mode B — Configure a trend card**: create a new chart component, register it in `ReportConfig.charts`, add it to the `defaultLayoutConfig`, and wire up the trend-card tests.
- **Mode C — Configure a configurable graph (bar / line)**: reuse the generic `configurableChartUtils` wrappers to create a page-specific dimension config + graph component, register it in `ReportConfig.charts`, add a graph section to the `defaultLayoutConfig`, and wire up the config + component tests.
- **Mode D — Configure a breakdown table**: build the shared metric config, columns, per-dimension data + download hooks, and a custom-dashboard-aware `ReportingMetricBreakdownTable` component, register it in `ReportConfig.charts`, add a table section to the `defaultLayoutConfig`, and wire up the tests.
- **Mode E — Expose the dashboard's reports in custom dashboards**: register the dashboard's `ReportConfig`(s) in a reports-config section, wire that section into the `config.ts` lookup helpers, gate picker visibility behind the dashboard's feature flag, extend `AvailableChartIds`, and add tests. Run this when the managed dashboard's charts should also be addable to a user's custom dashboard via the "Add chart" modal.
- **Mode F — Create a new managed dashboard from scratch**: scaffold the route, page entry, `ReportConfig`, default layout, constants, and CSV export hook for a brand-new dashboard, then run A–E to fill it in.

For AI-Agent breakdown tables (`analyticsOverview` / `analyticsAiAgent`) there is also the dedicated `/add-metric-table` skill; Mode D here is the managed-dashboard equivalent (Performance Overview style).

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

2. **Mode** — `add-query-factories` (A), `configure-trend-card` (B), `configure-configurable-graph` (C), `configure-breakdown-table` (D), `expose-in-custom-dashboards` (E), `create-new-dashboard` (F), or a combination. Infer when the ask is unambiguous: "a new trend card" → A+B; "a configurable chart / bar / line chart" → A+C; "a breakdown table" → A+D; "enable custom dashboards for X" → E; "a brand-new dashboard / analytics page" → F (then A–E). Otherwise ask:
    > "Do you want to (A) add query factories, (B) configure a trend card, (C) a configurable bar/line graph, (D) a breakdown table, (E) expose the dashboard's reports in custom dashboards, (F) scaffold a brand-new managed dashboard, or a combination?"

Then run the matching mode(s) below. When running A first, the factories it produces feed B (`valueQueryFactory` + `timeseriesQueryFactory`), C (`breakdownQueryFactory` for bar, `timeseriesQueryFactory` for line), and D (`breakdownQueryFactory`). Run F first when the dashboard doesn't exist yet; run E last, after the charts it exposes exist.

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
    breakdownQueryFactory: {subject}BreakdownQueryFactoryV2,
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

- Destructure all three as the **factory functions** (`valueQueryFactory`, `breakdownQueryFactory`, `timeseriesQueryFactory`), each `(ctx) => BuiltQuery`. Callers invoke them directly — `factory(ctx)`, never `factory.build(ctx)`. `getGenericQueries` also returns the underlying routing handles (`breakdownQuery`, `timeseriesQuery` — shape `{ config, build }`); **don't export those.** The factory is just `(ctx) => handle.build(ctx)`, so the function form is equivalent and keeps every consumer (cards, bar charts, breakdown tables) on one calling convention. This matches `aiAgentAutomatedInteractions.ts` and the post-refactor Performance Overview scopes.
- Override maps are optional — omit them entirely (don't pass `breakdownDimensionMetricNames: {}`) when the user said no breakdowns are needed.

### A.4 — Tests

Add tests in `domains/reporting/models/scopes/tests/{scopeFile}.spec.ts`. Group them under a new `describe('performance overview {subject} triplet', ...)` (or whatever dashboard the metric belongs to) inside the existing `QueryV2Factory methods` block.

> ⚠️ **Granularity in the test context** — The value and breakdown shapes both auto-inject `time_dimensions` _only when_ `ctx.granularity` is set. Many older scope specs (e.g. `resolutionTime.spec.ts`) define a shared `context` _without_ `granularity` because their pre-existing factories don't depend on it. **Don't reuse that bare context for the triplet tests** — define a local `granularContext = { ...context, granularity: 'day' as AggregationWindow }` inside the new `describe` block and assert against it, or your value/breakdown assertions will silently miss `time_dimensions`. Import `AggregationWindow` from `domains/reporting/models/stat/types` if it isn't already.

Required cases — pattern matches `satisfactionSurveys.spec.ts:451-525`:

1. **Value** — `{subject}ValueQueryFactoryV2(granularContext)` returns the expected shape: `metricName`, `scope`, `measures`, `timezone`, period `filters`, and auto-injected `time_dimensions` (the value shape inherits the scope's first time dimension when `ctx.granularity` is set — assert it).
2. **Breakdown default (unmapped dim)** — Call `{subject}BreakdownQueryFactoryV2({...ctx, dimensions: ['<unmapped dim>']})` and assert the full query with the default `metricName`. Choose a dimension that is **not** in `breakdownDimensionMetricNames`.
3. **Breakdown per-dimension overrides** — One `it.each(...)` row per mapped dimension, asserting `.metricName` equals the kebab-case override (only this field needs checking — the shape mirrors case 2).
4. **Breakdown multi-dim fallback** — `{subject}BreakdownQueryFactoryV2({...ctx, dimensions: ['<mapped>', '<other>']})` resolves to the default metric name (single-dim only routes; multi-dim falls back).
5. **Timeseries default** — `{subject}TimeseriesQueryFactoryV2({...ctx, dimensions: []})` returns the full shape including `time_dimensions: [{ dimension: '<timeDimension>', granularity: 'day' }]` and `limit: 10000`.
6. **Timeseries per-dimension overrides** — One assertion per mapped timeseries dimension on `.metricName`.

Import all three factories and call each directly as `factory(ctx)` — the breakdown export is now a plain factory function, **not** a handle, so there is no `.build`.

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
2. **Chart enum value** — kebab-case string used as the `ChartType.Card` id in the dashboard's chart enum, prefixed with the page/dashboard slug (e.g. `performance-overview-average-csat-card`; see **Key conventions**). Derive from the card name; confirm.
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

## Mode C — Configure a configurable graph (bar / line)

Wires a configurable **bar** chart (metric broken down by a dimension) and/or **line** chart (metric over time, optionally split by a dimension) into a managed dashboard. Assumes the query factories from Mode A already exist: **bar needs `*BreakdownQueryFactoryV2`**, **line needs `*TimeseriesQueryFactoryV2`** (both plain factory functions — see Mode A).

### C.0 — Reuse the generic chart utilities; never recreate them

The page-agnostic machinery already lives in `domains/reporting/utils/configurableChartUtils/` and `domains/reporting/hooks/`. **Import and wrap these — do not copy or reimplement them.**

| File                                              | Provides                                                                                                                                              |
| ------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------- |
| `utils/configurableChartUtils/barChartConfig.ts`  | `BarChartMetricConfig`, `BarChartDimensionDefinition`, `getBarChartGraphConfig`, `createBarChartFetch`                                                |
| `utils/configurableChartUtils/lineChartConfig.ts` | `LineChartMetricConfig`, `LineChartDimensionDefinition`, `LineChartDimension`, `OVERALL_DIMENSION`, `getLineChartGraphConfig`, `createLineChartFetch` |
| `utils/configurableChartUtils/formatters.ts`      | `toChartData`, `toTimeSeriesData`, `toMultipleTimeSeriesData`, `formatTimeSeriesDate`, `formatPeriod`                                                 |
| `hooks/useStatsMetricBreakdownPerDimension.ts`    | bar data hook + `DimensionBreakdownFactory` (the bar `queryFactory` type)                                                                             |
| `hooks/useStatsMetricTimeSeries.ts`               | line data hooks + `TimeSeriesFactory` (the line `queryFactory` type)                                                                                  |

Key differences between the two chart kinds:

- **Bar** breaks down by real dimensions only. Each `BarChartDimensionDefinition` carries a `graphType: ConfigurableGraphType.Bar | ConfigurableGraphType.Donut`. The metric's `queryFactory` is a `DimensionBreakdownFactory` → pass the scope's `*BreakdownQueryFactoryV2`.
- **Line** plots over time. It supports the synthetic `OVERALL_DIMENSION` (`'overall'`, a single line, modelled separately from real breakdown dimensions) plus real breakdown dimensions (one line per dimension value). The metric's `queryFactory` is a `TimeSeriesFactory` → pass the scope's `*TimeseriesQueryFactoryV2`. Line dimension definitions have no `graphType`.

> ⚠️ **If you _edit_ a generic util (not just wrap it), maintain its own spec** in `utils/configurableChartUtils/tests/`. These are shared across every dashboard, so a missed branch regresses all of them. In particular:
>
> - `formatTimeSeriesDate` (in `formatters.ts`) has a branch per `ReportingGranularity` — add a case for every branch (`Day`/default, `Month`, `Hour`) **and** the omitted-granularity fallback whenever you touch it.
> - `createLineChartFetch` / `createBarChartFetch` have an empty-metrics guard (`if (!metric) return { files: {} }`) and an unknown-saved-value fallback (to `metrics[0]` / first dimension) — cover both: assert the guard returns `{ files: {} }` and calls no fetch, and that the fallback fetches the first metric.

### C.1 — Confirm inputs

1. **Chart kind** — bar, line, or both.
2. **Metrics to plot** — for each: `measure` (string id), `name` (display label, usually `METRIC_TOOLTIPS.{x}.title`), `metricFormat` (`MetricTrendFormat`), `dimensions`, and `queryFactory`. Multiple metrics share one chart (the user picks via the measure selector).
3. **Dimensions** — which breakdown dimension(s) the chart offers (e.g. `channel`). For line, confirm whether `overall` is included (it usually is, and is the default first entry).
4. **Query factories** — confirm each metric's `*BreakdownQueryFactoryV2` (bar) / `*TimeseriesQueryFactoryV2` (line) exists. If not, run Mode A first.

### C.2 — Page-specific dimension config + wrappers

Create (or extend, if it already exists) one file per chart kind under the dashboard's `pages/.../utils/`:

- Bar: `getPerformanceConfigurableBarGraphConfig.ts`
- Line: `getPerformanceConfigurableLineGraphConfig.ts`

Each declares the page's dimension union, a dimension-definition registry, and thin wrappers over the generic `get*GraphConfig` / `create*ChartFetch`. Reference: `pages/performance/utils/getPerformanceConfigurableBarGraphConfig.ts` and `...LineGraphConfig.ts`.

```ts
// Bar
export type PerformanceBarDimension = 'channel'
export type PerformanceBarChartMetricConfig =
    BarChartMetricConfig<PerformanceBarDimension>

const PERFORMANCE_BAR_DIMENSIONS: Record<
    PerformanceBarDimension,
    BarChartDimensionDefinition
> = {
    channel: {
        label: 'Channel',
        graphType: ConfigurableGraphType.Bar,
        formatName: (value) => humanizeChannel(value),
    },
}

export const getPerformanceConfigurableBarGraphConfig = (
    metrics: PerformanceBarChartMetricConfig[],
    statsFilters: StatsFilters,
    timezone: string,
) =>
    getBarChartGraphConfig(
        metrics,
        PERFORMANCE_BAR_DIMENSIONS,
        statsFilters,
        timezone,
    )

export const createPerformanceBarChartFetch = (
    metrics: PerformanceBarChartMetricConfig[],
) => createBarChartFetch(metrics, PERFORMANCE_BAR_DIMENSIONS)
```

For line, the registry is keyed by `LineChartDimension<PerformanceLineDimension>` so it must include the `overall` entry, and `getLineChartGraphConfig` / `createLineChartFetch` take an extra `granularity` argument:

```ts
const PERFORMANCE_LINE_DIMENSIONS: Record<
    LineChartDimension<PerformanceLineDimension>,
    LineChartDimensionDefinition
> = {
    overall: { label: 'Overall', formatName: (value) => value },
    channel: {
        label: 'Channel',
        formatName: (value) => humanizeChannel(value),
    },
}
```

To support a new breakdown dimension later, extend the union, add a registry entry, and list it on a metric's `dimensions` — the `queryFactory` type enforces that the metric's scope actually supports it.

### C.3 — Graph component + metrics list

Create the component under `<charts-dir>/configurableGraphs/<ComponentName>/<ComponentName>.tsx`. It exports the metrics array (`PERFORMANCE_OVERVIEW_CHANNEL_{BAR,LINE}_METRICS`) and a component that memoizes the config and renders `<ConfigurableGraph>`. Reference: `pages/performance/overview/charts/configurableGraphs/PerformanceOverviewConfigurableBarGraph/PerformanceOverviewConfigurableBarGraph.tsx` (+ `...LineGraph.tsx`).

```tsx
export const PERFORMANCE_OVERVIEW_CHANNEL_BAR_METRICS: PerformanceBarChartMetricConfig[] =
    [
        {
            measure: 'resolutionTime',
            name: METRIC_TOOLTIPS.resolutionTime.title,
            metricFormat: 'duration',
            dimensions: ['channel'],
            queryFactory: resolutionTimeBreakdownQueryFactoryV2, // *TimeseriesQueryFactoryV2 for line
        },
        // ...one entry per metric
    ]

export const PerformanceOverviewConfigurableBarGraph = ({
    chartId,
    dashboard,
    chartConfig,
}: DashboardChartProps) => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters() // + granularity for line
    const metrics = useMemo(
        () =>
            getPerformanceConfigurableBarGraphConfig(
                PERFORMANCE_OVERVIEW_CHANNEL_BAR_METRICS,
                cleanStatsFilters,
                userTimezone,
            ),
        [cleanStatsFilters, userTimezone],
    )

    const actionMenu =
        chartId && chartConfig ? (
            <ChartsActionMenu
                chartId={chartId}
                dashboard={dashboard}
                chartName={chartConfig.label}
            />
        ) : undefined

    return (
        <ConfigurableGraph
            metrics={metrics}
            analyticsChartId={chartId ?? ''}
            actionMenu={actionMenu}
        />
    )
}
```

> ⚠️ **Custom-dashboard wiring is required** (it's what lets the graph be managed from a custom dashboard — "Add to dashboard", remove, etc.). Accept `dashboard` and `chartConfig` from `DashboardChartProps`, build an `actionMenu` from `ChartsActionMenu` **only when both `chartId` and `chartConfig` are present** (i.e. the chart is on a dashboard, not the standalone managed page), and pass it to `ConfigurableGraph` via the `actionMenu` prop. Import `ChartsActionMenu` from `domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu`. Unlike breakdown tables (Mode D), graphs do **not** pass `exportCsvAction` here — their CSV export is driven by the ReportConfig `csvProducer` (C.4).

Conventions: bar metrics may centralize their `queryFactory` map (see `pages/performance/overview/config/breakdownTableMetrics.ts`'s `PERFORMANCE_OVERVIEW_METRIC_FACTORIES`, shared with the breakdown tables); the line graph imports `*TimeseriesQueryFactoryV2` from the scopes directly. Line components also read `granularity` from `useStatsFilters` and pass it through.

### C.4 — Register the chart in `ReportConfig`

In `<report-config-file>`:

1. Add an enum value: `ConfigurableBarGraph = 'performance-overview-configurable-bar-graph'` (and/or `ConfigurableLineGraph`). Follow the page-prefixed chart-id rule (see **Key conventions**), and keep the rest **dimension-agnostic** — name it after the chart kind (`configurable-bar-graph`), not the current breakdown dimension, since a configurable chart is expected to gain more dimensions over time.
2. Import the component, its `*_METRICS` array, the `createPerformance{Bar,Line}ChartFetch` wrapper, and the chart description constant.
3. Add a `charts` entry:

    ```ts
    [{ChartEnum}.ConfigurableBarGraph]: {
        chartComponent: PerformanceOverviewConfigurableBarGraph,
        label: 'Configurable bar chart for performance metrics',
        csvProducer: [
            {
                type: DataExportFormat.ConfigurableBarGraph, // ConfigurableLineGraph for line
                fetch: createPerformanceBarChartFetch(PERFORMANCE_OVERVIEW_CHANNEL_BAR_METRICS),
            },
        ],
        chartType: ChartType.Graph,
        description: PERFORMANCE_BAR_CHART_DESCRIPTION,
    },
    ```

    Graph entries carry no `tooltipConfig` / `metricFormat` / `interpretAs` (those are per-metric, inside the metrics array). The CSV `fetch` must use the **same metrics array** as the component so the export matches the screen.

### C.5 — Add to the default layout

In `<layout-config-file>`, add the chart(s) to a graph section. If no graph section exists yet, add one (`type: ChartType.Graph`); two graphs side by side use `gridSize: 6` each on the 12-column grid. Reference: the `visualizations` section in `pages/performance/overview/config/defaultLayoutConfig.ts`.

```ts
{
    id: 'visualizations',
    type: ChartType.Graph,
    items: [
        { chartId: {ChartEnum}.ConfigurableBarGraph, gridSize: 6, visibility: true },
        { chartId: {ChartEnum}.ConfigurableLineGraph, gridSize: 6, visibility: true },
    ],
},
```

> ℹ️ Place the new section in the default layout at the position you want it for **all** users. `mergeWithDefaults` (in `@repo/reporting`) now orders a user's persisted layout by the default section order and inserts newly-introduced sections at their default position (saved sections absent from the defaults are dropped) — so a section added between `kpis` and `breakdown` lands there even for users with an older saved layout.

### C.6 — Chart description constants

Add the description string(s) to the dashboard's `constants.ts`. Keep bar/line descriptions in sync by deriving the shared metric list once. Reference: `pages/performance/overview/constants.ts`.

```ts
const PERFORMANCE_CHART_METRICS =
    'resolution time, first response time, messages per ticket, average CSAT'

export const PERFORMANCE_BAR_CHART_DESCRIPTION = `Performance metrics per channel: ${PERFORMANCE_CHART_METRICS}.`
export const PERFORMANCE_LINE_CHART_DESCRIPTION = `Performance metrics over time: ${PERFORMANCE_CHART_METRICS}.`
```

### C.7 — Tests

Two specs per chart kind:

1. **Config spec** (`utils/tests/getPerformanceConfigurable{Bar,Line}GraphConfig.spec.ts`) — `jest.mock` the data hook (`useStatsMetricBreakdownPerDimension` for bar; `useStatsMetricTimeSeries` + `...PerDimension` for line), call the `get*Config` helper, then assert (a) one config per metric with the expected dimension shape (`id`, `name`, `configurableGraphType`), and (b) `renderHook(() => config[i].dimensions[j].useChartData())` returns the humanized/formatted data and reflects loading state. Reference: `getPerformanceConfigurableBarGraphConfig.spec.ts`.
2. **Component spec** (`<ComponentName>.spec.tsx`) — `jest.mock` `useStatsFilters` and the data hook, partially mock `@repo/reporting` only for `useDashboardContext`, install `ResizeObserver` + `Element.prototype.getAnimations` shims (`ConfigurableGraph` needs them), render, and assert the chart's labels/values appear. **Also cover the `actionMenu` custom-dashboard wiring** (C.5): `jest.mock` `ChartsActionMenu` and give it a recognizable return value (`mockReturnValue(<div>ChartsActionMenu</div>)`), then assert in an `action menu` describe block that (a) passing both `chartId` and `chartConfig` renders it and forwards the right props — `expect(ChartsActionMenuMock.mock.calls[0][0]).toEqual(expect.objectContaining({ chartId, dashboard, chartName: chartConfig.label }))` — and (b) it is **not** rendered (and the mock is never called) when `chartConfig` is missing, and likewise when `chartId` is missing. Reference: `PerformanceOverviewConfigurableBarGraph.spec.tsx` / `...LineGraph.spec.tsx`.

Do **not** mock `@gorgias/axiom`, the router, TanStack Query, or the SDK query packages. Use accessible queries (`getByText`, `getByRole`) — no `data-testid`.

### C.8 — Verify

```bash
pnpm --filter @repo/helpdesk test -- getPerformanceConfigurable PerformanceOverviewConfigurable
```

Use the package `typecheck` script (tsgo). For a new chart type or layout change, run the app and confirm the graph renders and the measure/dimension selectors behave.

---

## Mode D — Configure a breakdown table

Wires a metric **breakdown table** (one row per dimension value — agent, channel, …; one column per metric) into a managed dashboard, rendered by `ReportingMetricBreakdownTable` from `@repo/reporting`. Assumes the `*BreakdownQueryFactoryV2` factories from Mode A already exist for every metric the table shows.

This mode reuses the shared per-dimension data machinery — **do not hand-roll fetching.** A table is five co-located pieces plus the usual `ReportConfig` + layout wiring:

| Piece                                                         | Responsibility                                                                                                    |
| ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `config/breakdownTableMetrics.ts` (shared, one per dashboard) | metric-key union, `*_METRIC_FACTORIES` map, `*EntityMetrics` row type, row builder, `MetricColumnConfig[]`        |
| `<Table>/columns.tsx`                                         | `NameColumnConfig[]` (the entity column) + table title/description + the metric columns export                    |
| `hooks/<dim>Breakdown/use<Table>Metrics.ts`                   | assembles rows via `useEntityMetrics`; also exports a `fetch…Metrics` + `fetch…AsConfigurableTable` for CSV       |
| `hooks/<dim>Breakdown/useDownload<Table>Data.ts`              | `useState`/`useEffect` wrapper around `fetch<Table>Metrics` → `{ files, fileName, isLoading }` (no shared cache)  |
| `<Table>/<Table>.tsx`                                         | the custom-dashboard-aware component (hoists the download data, feeds both the action menu and the shared button) |

Reference (channel breakdown, end to end): `pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable/` + `pages/performance/overview/config/breakdownTableMetrics.ts` + `hooks/channelBreakdown/`. The agent variant (`PerformanceOverviewAgentTable`) is the same shape with a per-agent name column and `enableSearch`.

### D.1 — Confirm inputs

1. **Breakdown entity** — what each row represents (e.g. `channel`, `agent`). Drives the name column, the data-source hook, and the chart-id slug.
2. **Metrics (columns)** — the metric keys to show; each needs a `*BreakdownQueryFactoryV2` (Mode A) and a `METRIC_TOOLTIPS.*` entry for its column header.
3. **Chart enum value** — kebab-case, page-prefixed, e.g. `performance-overview-channel-table` (see **Key conventions**).

### D.2 — Shared metric config (`config/breakdownTableMetrics.ts`)

Create once per dashboard and reuse across every table (and the configurable bar graph). It declares:

- `type {Prefix}MetricKey` — union of metric keys.
- `{PREFIX}_METRIC_FACTORIES: Record<{Prefix}MetricKey, ChannelBreakdownFactory>` — maps each key to its `*BreakdownQueryFactoryV2` (use `satisfies` so a missing/extra key is a type error). This map is the single source of truth shared by the bar graph (Mode C) and every breakdown table.
- `type {Prefix}EntityMetrics = { entity: string } & Record<{Prefix}MetricKey, number | null>` and a `build{Prefix}EntityRow(entityData)(entity)` row builder.
- `hasAnyMetricValue(row)` — drops all-null rows.
- `{PREFIX}_BREAKDOWN_METRIC_COLUMNS: MetricColumnConfig[]` — `{ accessorKey, label: METRIC_TOOLTIPS.x.title, tooltipConfig, metricFormat, loadingStateKeys }` per metric.

Reference: `pages/performance/overview/config/breakdownTableMetrics.ts`.

### D.3 — Columns file (`<Table>/columns.tsx`)

```tsx
export const PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS: NameColumnConfig[] = [
    { accessor: 'entity', label: 'Channel', formatName: humanizeChannel },
]

export const PERFORMANCE_OVERVIEW_CHANNEL_TABLE = {
    title: 'Channel',
    description: 'Performance metrics per channel: …',
}

export const PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS =
    PERFORMANCE_OVERVIEW_BREAKDOWN_METRIC_COLUMNS
```

For an agent-style table the name column resolves a display name + avatar from the store (`humanizeAgent`, `getAvatarProps`) and is built with `useMemo` inside the component instead of being a static export — see `PerformanceOverviewAgentTable`.

### D.4 — Data hook (`hooks/<dim>Breakdown/use<Table>Metrics.ts`)

Build a `Record<{Prefix}MetricKey, EntityMetricConfig>` by mapping `{PREFIX}_METRIC_FACTORIES` through the entity helper (`useMetricPerChannel` / `fetchMetricPerChannel` for channels), then feed it to `useEntityMetrics`, collect the entity list, `assembleEntityRows(entities, build{Prefix}EntityRow(entityData))`, and `.filter(hasAnyMetricValue)`. Return `{ data, isLoading, isError, loadingStates }`.

In the **same file** export the CSV producers used by the ReportConfig:

- `fetch{Table}Metrics(filters, timezone)` → `{ fileName, files }` (mirrors the hook but via `fetchEntityMetrics`, formats rows with `formatMetricValue` + `createCsv`).
- `fetch{Table}AsConfigurableTable: ConfigurableGraphFetch` → thin wrapper returning `{ files }`.

Reference: `hooks/channelBreakdown/usePerformanceOverviewChannelMetrics.ts`.

### D.5 — Download data hook (`hooks/<dim>Breakdown/useDownload<Table>Data.ts`)

CSV download for the standalone managed page is driven by a single data hook that wraps `fetch{Table}Metrics` in `useState`/`useEffect` and returns `{ files, fileName, isLoading }`. Reference: `hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData.ts`.

```ts
export const useDownloadPerformanceOverviewChannelData = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const [result, setResult] = useState<{
        fileName: string
        files: Record<string, string>
    }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetchPerformanceOverviewChannelMetrics(cleanStatsFilters, userTimezone)
            .then(({ fileName, files }) => setResult({ fileName, files }))
            .catch((error) =>
                reportError(error, {
                    tags: { team: SentryTeam.CPLT_ANALYTICS_FRONTEND },
                }),
            )
            .finally(() => setIsLoading(false))
    }, [cleanStatsFilters, userTimezone])

    return {
        files: result?.files ?? {},
        fileName: result?.fileName ?? '',
        isLoading,
    }
}
```

> ⚠️ **This hook has no shared cache** — it's a plain `useState`/`useEffect` fetch, so every render that calls it fires its own request. **Call it exactly once**, in the table component (D.6), and feed both the action-menu export and the standalone download button from that one result. Do **not** create per-table `useDownload<Table>Action` / `Download<Table>Button` wrapper components that each call the hook internally — when the standalone button is rendered (page mode) _and_ the action is built (for the menu), the breakdown metrics get fetched twice on every page load and filter change. The shared `useDownloadTableAction` and `DownloadTableButton` (`pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton`) both accept `{ files, fileName, isLoading }` as props precisely so the data can be hoisted — use them directly.

Keep the segment-event constant in the table component file alongside the single hook call:

```ts
const SEGMENT_EVENT_NAME =
    'performance-overview_channel-breakdown-table' as const
```

### D.6 — Table component (`<Table>/<Table>.tsx`) — custom-dashboard-aware

The component **must** carry the full custom-dashboard prop set and swap its standalone download button for an action-menu CSV export when it sits on a dashboard — otherwise the export is unreachable from a custom dashboard. It calls the download data hook **once** (D.5) and feeds that one result into both the action menu's `exportCsvAction` and the standalone `DownloadTableButton`:

```tsx
type Props = {
    chartId?: string
    withChartMenu?: boolean
    dashboard?: DashboardSchema
    chartConfig?: { label: string }
    isCustomDashboard?: boolean
}

export const PerformanceOverviewChannelTable = ({
    chartId,
    withChartMenu,
    dashboard,
    chartConfig,
    isCustomDashboard,
}: Props) => {
    const { data, loadingStates } = usePerformanceOverviewChannelMetrics()
    const downloadData = useDownloadPerformanceOverviewChannelData()
    const exportCsvAction = useDownloadTableAction({
        ...downloadData,
        segmentEventName: SEGMENT_EVENT_NAME,
    })
    const withMenu = withChartMenu && chartId

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={PERFORMANCE_OVERVIEW_CHANNEL_COLUMNS}
            loadingStates={loadingStates}
            DownloadButton={
                !withMenu ? (
                    <DownloadTableButton
                        {...downloadData}
                        segmentEventName={SEGMENT_EVENT_NAME}
                    />
                ) : undefined
            }
            nameColumns={PERFORMANCE_OVERVIEW_CHANNEL_NAME_COLUMNS}
            actionMenu={
                withMenu ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        chartName="Channel"
                        dashboard={dashboard}
                        exportCsvAction={exportCsvAction}
                    />
                ) : undefined
            }
            chartId={chartId}
            isCustomDashboard={isCustomDashboard}
            name={chartConfig?.label}
        />
    )
}
```

Rules (each maps to a real bug if skipped):

- **Call `useDownload<Table>Data()` exactly once** and share `downloadData` between `useDownloadTableAction` and `DownloadTableButton`. Routing the action and the button through separate wrappers that each call the hook double-fetches the breakdown metrics (the hook has no shared cache — see D.5).
- `const withMenu = withChartMenu && chartId`.
- `DownloadButton={!withMenu ? <DownloadTableButton … /> : undefined}` — never render the standalone button alongside the action menu.
- Action menu gets **both** `dashboard` and `exportCsvAction`, so CSV export is reachable from the menu on a custom dashboard.
- Forward `chartId`, `isCustomDashboard`, and `name={chartConfig?.label}`. Entity tables that benefit from a search box (agents) also pass `enableSearch`.
- These props all arrive from `DashboardComponent`, which passes `chartConfig`, `chartId`, `withChartMenu`, `isCustomDashboard`, and (only when `withChartMenu`) `dashboard`.

### D.7 — Register the chart in `ReportConfig`

Add the enum value and a `charts` entry with `chartType: ChartType.Table` and a `ConfigurableTable` CSV producer pointing at the same fetch:

```ts
[{ChartEnum}.ChannelTable]: {
    chartComponent: PerformanceOverviewChannelTable,
    label: PERFORMANCE_OVERVIEW_CHANNEL_TABLE.title,
    csvProducer: [
        {
            type: DataExportFormat.ConfigurableTable,
            fetch: fetchPerformanceOverviewChannelAsConfigurableTable,
        },
    ],
    description: PERFORMANCE_OVERVIEW_CHANNEL_TABLE.description,
    chartType: ChartType.Table,
},
```

### D.8 — Add to the default layout

Add the table to a `ChartType.Table` section (create one with a `tableTitle` if absent). Tables span the grid (`gridSize: 12`) and may declare `visibleColumns` (a subset of the metric `accessorKey`s shown by default):

```ts
{
    id: 'breakdown',
    type: ChartType.Table,
    tableTitle: 'Performance breakdown',
    items: [
        {
            chartId: {ChartEnum}.ChannelTable,
            gridSize: 12,
            visibility: true,
            visibleColumns: ['resolutionTime', 'firstResponseTime', 'messagesPerTicket', 'averageCsat'],
        },
    ],
},
```

### D.9 — Tests

- **Metrics config / columns** are exercised through the component spec; no separate spec needed unless the row builder has non-trivial logic.
- **`<Table>.spec.tsx`** — mock the metrics hook, the download-data hook, and `ChartsActionMenu` (render an extra button when `exportCsvAction` is passed). Assert: the entity name column + humanized names render; metric values format per column; the download button renders and is **disabled while the download-data hook reports `isLoading`** (drive this by overriding the download-data mock to `{ files: {}, fileName: '', isLoading: true }`); the action menu appears only when `chartId` + `withChartMenu`; and **in action-menu mode the CSV export is reachable through the menu while the standalone download button is _not_ rendered**. Use accessible queries, no `data-testid`. Reference: `PerformanceOverviewChannelTable/tests/`.
- There is **no** separate `Download<Table>Button.spec.tsx` — the standalone button is just the shared `DownloadTableButton`, and its loading/render behavior is covered by the table spec above.

### D.10 — Verify

```bash
pnpm --filter @repo/helpdesk test -- {Table}.spec
```

Use the package `typecheck` script (tsgo).

---

## Mode E — Expose the dashboard's reports in custom dashboards

A managed dashboard renders its own page (Modes A–C), but its charts can _also_ be offered in the **custom-dashboard chart picker** (the "Add chart" modal) and rendered on a user's custom dashboard grid. That exposure is wired separately from the managed page and is usually gated behind the dashboard's rollout feature flag.

Run this mode when the user asks to "enable custom dashboards for `<dashboard>`", "make `<dashboard>`'s charts addable to dashboards", or similar. Do **all** of the steps below — skipping the lookup-helper wiring (E.2) is the classic bug: the chart shows in the picker but renders blank / unfiltered once dropped on a dashboard.

Reference implementation: the `Performance` category (`PerformanceOverviewReportConfig` + `ChannelsEmailReportConfig`), gated behind `FeatureFlagKey.RevampOverallPerformanceNewScreens`.

### E.1 — Add a reports-config section in `config.ts`

In `domains/reporting/pages/dashboards/config.ts`, add (or extend) a `*_REPORTS_CONFIG: ReportsModalConfig` array with a single `category` listing one `{ type, config }` entry per report:

```ts
export const PERFORMANCE_REPORTS_CONFIG: ReportsModalConfig = [
    {
        category: 'Performance',
        children: [
            {
                type: PerformanceOverviewChart,
                config: PerformanceOverviewReportConfig,
            },
            {
                type: PerformanceChannelsEmailChart,
                config: ChannelsEmailReportConfig,
            },
        ],
    },
]
```

`type` is the report's chart **enum object** (not a value); `config` is its `ReportConfig`. Import both from the report's config file.

### E.2 — Wire the section into the lookup helpers (same file)

`getComponentConfig`, `getReportConfig`, and `getReportConfigFromPath` each build a sections / reports array. Spread the new config into **every** branch (both the `withLegacyReports` and the default arrays):

```ts
const allSections = withLegacyReports
    ? [
          ...REPORTS_CONFIG,
          ...REVAMPED_REPORTS_CONFIG,
          ...PERFORMANCE_REPORTS_CONFIG,
          ...LEGACY_REPORTS_CONFIG,
      ]
    : [
          ...REPORTS_CONFIG,
          ...REVAMPED_REPORTS_CONFIG,
          ...PERFORMANCE_REPORTS_CONFIG,
      ]
```

These helpers resolve a chart's `chartConfig` / `reportConfig`, the report's filters (`useFiltersFromDashboard`), chart restrictions, and the metric-origin breadcrumb. A chart placed on a custom dashboard won't render or filter unless its report is discoverable here.

> ⚠️ **This wiring is NOT feature-flag gated.** Picker _visibility_ is gated in E.3; the lookups must always resolve so charts already saved on a custom dashboard keep rendering even if the flag is later toggled off.

### E.3 — Gate picker visibility in `useRestrictedReportsConfig.ts`

In `domains/reporting/hooks/dashboards/useRestrictedReportsConfig.ts`, read the dashboard's flag and append the section to the visible config only when enabled:

```ts
const { value: isRevampOverallPerformanceNewScreensEnabled } =
    useFlagWithLoading(FeatureFlagKey.RevampOverallPerformanceNewScreens)

const configWithPerformance = isRevampOverallPerformanceNewScreensEnabled
    ? [...PERFORMANCE_REPORTS_CONFIG, ...baseConfig]
    : baseConfig
```

Then feed `configWithPerformance` (not `baseConfig`) into the downstream restriction `.filter`/`.map`. Keep the existing legacy / AI-Agent visibility branches working on the combined array.

### E.4 — Extend the `AvailableChartIds` union

In `domains/reporting/pages/dashboards/types.ts`, add `typeof <Chart enum>` for each new report's chart enum so the `{ type }` entries from E.1 typecheck:

```ts
| typeof PerformanceOverviewChart
| typeof PerformanceChannelsEmailChart
```

### E.5 — Tests

1. **`dashboards/tests/config.spec.ts`** — add cases per new report:
    - `getComponentConfig(<a chart id>)` resolves to the right `ReportConfig` with `category` set to the new section's category.
    - `getReportConfig(<ReportsIDs.x>)` and `getReportConfigFromPath(<prefix + reportPath>)` each return the config.
    - `getMetricOriginPath(<a chart id>)` returns `{ prefix: '<category>', suffix: <config>.reportName }`. **Derive `suffix` from the config object** (`PerformanceOverviewReportConfig.reportName`), don't hardcode — report names drift (e.g. `'Overview'`, `'Channels > Email'`).
2. **`hooks/dashboards/tests/useRestrictedReportsConfig.spec.ts`** — assert the category is **absent** when the flag is off and **present** (with each report's `config.id`) when the flag (and any prerequisite flags) are on.

### E.6 — Verify

```bash
pnpm --filter @repo/helpdesk test -- dashboards/tests/config.spec useRestrictedReportsConfig.spec
```

Use the package `typecheck` script (tsgo). Breakdown tables exposed this way must follow the custom-dashboard-aware component shape from **Mode D** (action menu + `exportCsvAction`, conditional download button).

---

## Mode F — Create a new managed dashboard from scratch

Scaffolds an empty managed dashboard — the route, page entry, `ReportConfig`, layout, constants, and CSV export hook — so Modes A–E have something to attach charts to. Run this **first** when the user wants a brand-new analytics page (not a new chart on an existing one); then run A (factories) → B/C/D (charts) → E (custom-dashboard exposure) to fill it in.

Reference implementation end to end: `pages/performance/overview/` (`PerformanceOverviewReport.tsx`, `PerformanceOverviewReportConfig.ts`, `config/defaultLayoutConfig.ts`, `constants.ts`, `hooks/useExportPerformanceOverviewToCSV.ts`).

### F.1 — Confirm inputs

1. **Dashboard name + slug** — display title (e.g. `Performance`) and a kebab-case slug used for the route, dashboard id, and metric-name prefix (e.g. `performance-overview`).
2. **Rollout flag** — the `FeatureFlagKey` that gates the route + custom-dashboard exposure, if the dashboard is behind a flag (Performance uses `RevampOverallPerformanceNewScreens`).
3. **Filters** — the optional + persistent filter sets (usually reuse an existing `*_OPTIONAL_FILTERS` constant; `persistent: [FilterKey.Period, FilterKey.AggregationWindow]`).

### F.2 — Route + id registration

- Add the route path to `routes/constants.ts` `STATS_ROUTES` (e.g. `PERFORMANCE_OVERVIEW: 'performance-overview'`).
- Register the `ProtectedRoute` + `Route` in `domains/reporting/routes/StatsRoutes.tsx`, rendering `<App content={<Report>} navbar={StatsNavbarContainer} />`. Gate it behind the rollout flag if there is one (`{isFlagEnabled && (<ProtectedRoute …>)}`).
- Add a `ReportsIDs` entry in `domains/reporting/pages/dashboards/constants.ts`.
- If the dashboard needs a left-nav entry, add it to `StatsNavbarView` (also flag-gated).

### F.3 — Constants (`<page>/constants.ts`)

```ts
export const PERFORMANCE_OVERVIEW_DASHBOARD_ID = 'performance-overview'
export const PERFORMANCE_OVERVIEW_TAB_NAME = 'Overview'

export enum PerformanceOverviewTabs {
    Overview = 'overview',
}
```

Co-locate chart description strings here too (Mode C reuses them).

### F.4 — `ReportConfig` (`<page>/<Name>ReportConfig.ts`)

Start with an **empty `charts: {}`** and an empty chart enum — Modes B/C/D add entries. Wire `id` (the `ReportsIDs` entry), `reportName`, `reportPath: STATS_ROUTES.X`, and `reportFilters`:

```ts
export enum PerformanceOverviewChart {}

export const PerformanceOverviewReportConfig: ReportConfig<PerformanceOverviewChart> =
    {
        id: ReportsIDs.PerformanceOverviewReportConfig,
        reportName: 'Performance',
        reportPath: STATS_ROUTES.PERFORMANCE_OVERVIEW,
        charts: {},
        reportFilters: {
            optional: PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
```

### F.5 — Default layout (`<page>/config/defaultLayoutConfig.ts`)

Declare a `DashboardLayoutConfig<{ChartEnum}>` with the section skeleton you want (`kpis` → `visualizations` → `breakdown`); leave `items: []` until charts exist. Section `type` is a `ChartType` (`Card` / `Graph` / `Table`); table sections carry a `tableTitle`. See the **layout ordering** note in Mode C.5.

### F.6 — CSV export hook (`<page>/hooks/useExport<Name>ToCSV.ts`)

Build the dashboard schema from the default layout and run it through `useDashboardData`:

```ts
export const useExportPerformanceOverviewToCSV = () => {
    const { cleanStatsFilters } = useStatsFilters()
    const { layoutConfig } = useGetManagedDashboardsLayoutConfig({
        dashboardId: PERFORMANCE_OVERVIEW_DASHBOARD_ID,
        defaultLayoutConfig: DEFAULT_PERFORMANCE_OVERVIEW_LAYOUT,
        tabId: PerformanceOverviewTabs.Overview,
    })
    const dashboard = useMemo(
        () =>
            buildDashboardSchemaFromLayout(
                layoutConfig,
                'performance-overview',
            ),
        [layoutConfig],
    )
    const { files, isLoading } = useDashboardData(
        dashboard,
        PerformanceOverviewReportConfig.charts,
    )
    const triggerDownload = useCallback(async () => {
        const fileName = getCsvFileNameWithDates(
            cleanStatsFilters.period,
            'performance-overview',
        ).replace('.csv', '')
        await saveZippedFiles(files, fileName)
    }, [files, cleanStatsFilters.period])
    return { triggerDownload, isLoading }
}
```

### F.7 — Page entry (`<page>/<Name>Report.tsx`)

Compose `AnalyticsPage` (title + `DashboardExportButton` + `FiltersPanelWrapper`) around `DashboardLayoutRenderer`. The renderer is what makes the dashboard "managed" — pass the default layout, the report config, the dashboard id, the tab, `DashboardComponent`, and the `enableCustomDashboards` / `enableTablesPersistence` flags:

```tsx
export const PerformanceOverviewReport = () => {
    useCleanStatsFilters()
    const contentRef = useRef<HTMLDivElement>(null)
    return (
        <AnalyticsPage
            ref={contentRef}
            title="Performance"
            titleExtra={
                <DashboardExportButton
                    contentRef={contentRef}
                    useCsvExport={useExportPerformanceOverviewToCSV}
                />
            }
            filtersSlot={
                <FiltersPanelWrapper
                    persistentFilters={
                        PerformanceOverviewReportConfig.reportFilters.persistent
                    }
                    optionalFilters={
                        PerformanceOverviewReportConfig.reportFilters.optional
                    }
                    compact
                />
            }
        >
            <DashboardLayoutRenderer
                defaultLayoutConfig={DEFAULT_PERFORMANCE_OVERVIEW_LAYOUT}
                reportConfig={PerformanceOverviewReportConfig}
                dashboardId={PERFORMANCE_OVERVIEW_DASHBOARD_ID}
                tabId={PerformanceOverviewTabs.Overview}
                tabName={PERFORMANCE_OVERVIEW_TAB_NAME}
                DashboardComponent={DashboardComponent}
                enableCustomDashboards
                enableTablesPersistence
            />
        </AnalyticsPage>
    )
}
```

### F.8 — Verify

Run the app behind the rollout flag and confirm the route renders an empty managed dashboard (filters + export button, no charts yet). Then proceed to Modes A–E. Use the package `typecheck` script (tsgo).

---

## Reference — `getGenericQueries` behavior

From `domains/reporting/models/scopes/utils.ts`:

- Returns `{ valueQuery, valueQueryFactory, breakdownQuery, breakdownQueryFactory, timeseriesQuery, timeseriesQueryFactory }`.
- **Always export the `*QueryFactory` forms** (`valueQueryFactory`, `breakdownQueryFactory`, `timeseriesQueryFactory`) — all three are plain `(ctx) => BuiltQuery` functions and consumers call them directly.
- `breakdownQuery` and `timeseriesQuery` are the underlying **routing handles** `{ config, build(ctx) }`; the matching `*QueryFactory` is just `(ctx) => handle.build(ctx)`. There is no behavioral difference — export the factory and ignore the handle.
- Routing (driven by `ctx.dimensions`, applies whichever form you call):
    - 0 or 2+ dimensions → default metric name.
    - 1 dimension matching `{breakdown,timeseries}DimensionMetricNames` → override metric name.
    - 1 unmapped dimension → default metric name.
- The value shape auto-injects `time_dimensions: [{ dimension: scope.timeDimensions[0], granularity: ctx.granularity }]` when `ctx.granularity` is set. Tests must assert this; it surprises people who expect the value query to be "just the number."
- The timeseries shape pins the `timeDimension` from the options to its `time_dimensions` and sets `limit: 10000`.

---

## Critical reference files

| File                                                                                                                                                                           | Role                                                                                                                                                                    |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `apps/helpdesk/src/domains/reporting/models/scopes/satisfactionSurveys.ts`                                                                                                     | Reference scope with `getGenericQueries`                                                                                                                                |
| `apps/helpdesk/src/domains/reporting/models/scopes/tests/satisfactionSurveys.spec.ts`                                                                                          | Reference triplet tests (Mode A)                                                                                                                                        |
| `apps/helpdesk/src/domains/reporting/models/scopes/utils.ts`                                                                                                                   | `getGenericQueries`, `getValueQuery`, etc.                                                                                                                              |
| `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`                                                                                                                     | `METRIC_NAMES` + `METRIC_NAMES_BY_SCOPE`                                                                                                                                |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard.tsx`                                                                  | Reference trend-card component (Mode B)                                                                                                                                 |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig.ts`                                                                            | Reference `ReportConfig` + chart enum                                                                                                                                   |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/PerformanceOverviewReport.tsx`                                                                                 | Reference managed-dashboard page entry (Mode F)                                                                                                                         |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/config/defaultLayoutConfig.ts`                                                                                 | Reference `DashboardLayoutConfig`                                                                                                                                       |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/constants.ts`                                                                                                  | Reference dashboard id / tab / descriptions (Mode F)                                                                                                                    |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/hooks/useExportPerformanceOverviewToCSV.ts`                                                                    | Reference managed CSV export hook (Mode F)                                                                                                                              |
| `apps/helpdesk/src/domains/reporting/routes/StatsRoutes.tsx`                                                                                                                   | Route registration (Mode F)                                                                                                                                             |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/kpiCharts/tests/PerformanceOverviewTrendCards.spec.tsx`                                                 | Reference shared trend-card spec                                                                                                                                        |
| `apps/helpdesk/src/domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig.ts`                                                                              | Alternative local `title + hint` config map                                                                                                                             |
| `apps/helpdesk/src/domains/reporting/config/metricTooltipDefinitions.ts`                                                                                                       | `METRIC_TOOLTIPS` registry                                                                                                                                              |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricTrend.ts`                                                                                                             | `getStatsTrendHook`, `getStatsTrendFetch`                                                                                                                               |
| `apps/helpdesk/src/domains/reporting/hooks/useReportingTrendCardProps.ts`                                                                                                      | Trend-card props builder                                                                                                                                                |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/barChartConfig.ts`                                                                                           | Generic bar-chart config + fetch (Mode C)                                                                                                                               |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/lineChartConfig.ts`                                                                                          | Generic line-chart config + fetch (Mode C)                                                                                                                              |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/formatters.ts`                                                                                               | Chart data formatters (Mode C)                                                                                                                                          |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricBreakdownPerDimension.ts`                                                                                             | Bar data hook + `DimensionBreakdownFactory`                                                                                                                             |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricTimeSeries.ts`                                                                                                        | Line data hooks + `TimeSeriesFactory`                                                                                                                                   |
| `apps/helpdesk/src/domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig.ts`                                                                      | Reference page-specific bar config (Mode C)                                                                                                                             |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/configurableGraphs/PerformanceOverviewConfigurableBarGraph/PerformanceOverviewConfigurableBarGraph.tsx` | Reference graph component (Mode C)                                                                                                                                      |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/config/breakdownTableMetrics.ts`                                                                               | Shared metric config: factories map, row builder, columns (Mode D)                                                                                                      |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable/`                                                       | Reference breakdown table (component + columns, hoists the download data once) (Mode D)                                                                                 |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics.ts`                                                | Reference per-dimension data hook + CSV fetch (Mode D)                                                                                                                  |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData.ts`                                           | Reference download-data hook (uncached `useState`/`useEffect`; call once) (Mode D)                                                                                      |
| `apps/helpdesk/src/pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton.tsx`                                                                                  | Shared `useDownloadTableAction` / `DownloadTableButton` (Mode D)                                                                                                        |
| `apps/helpdesk/src/pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/AllAgentsPerformanceByChannelTable.tsx`                                        | Custom-dashboard-aware breakdown table — ⚠️ legacy: still uses per-table download wrappers that double-fetch; follow `PerformanceOverviewChannelTable` instead (Mode D) |
| `apps/helpdesk/src/domains/reporting/pages/dashboards/config.ts`                                                                                                               | Reports-config sections + lookup helpers (Mode E)                                                                                                                       |
| `apps/helpdesk/src/domains/reporting/pages/dashboards/tests/config.spec.ts`                                                                                                    | Reference lookup-helper tests (Mode E)                                                                                                                                  |
| `apps/helpdesk/src/domains/reporting/hooks/dashboards/useRestrictedReportsConfig.ts`                                                                                           | Flag-gated picker visibility (Mode E)                                                                                                                                   |
| `apps/helpdesk/src/domains/reporting/pages/dashboards/types.ts`                                                                                                                | `AvailableChartIds` union (Mode E)                                                                                                                                      |
| `apps/helpdesk/src/domains/reporting/pages/dashboards/DashboardComponent.tsx`                                                                                                  | Passes chart props (`chartConfig`, `withChartMenu`, `isCustomDashboard`, `dashboard`)                                                                                   |

---

## Related skills

- `/add-metric-table` — the AI-Agent analytics table scaffolder (`analyticsOverview` / `analyticsAiAgent`). For managed dashboards (Performance Overview style), use **Mode D** here instead; the two follow the same `ReportingMetricBreakdownTable` shape but differ in data-hook helpers and registration paths.
- `/implement-stats-scope` — run first when a metric's scope file doesn't exist yet (Mode A prerequisite).

---

## Key conventions

- Metric-name prefix matches the dashboard, e.g. `PERFORMANCE_OVERVIEW_*`. String value is the kebab-case equivalent.
- **Every chart id** in `<report-config-file>` (trend cards, tables, and configurable graphs alike) is prefixed with the page/dashboard slug — `performance-overview-…`, or `channels-email-…` on a `Channels > Email` dashboard — matching the other ids in the same config and the `METRIC_NAMES` prefix. The rest of the id describes the chart, not its current breakdown dimension.
- Export the `*QueryFactory` forms only — `valueQueryFactory`, `breakdownQueryFactory`, `timeseriesQueryFactory` — all named `*QueryFactoryV2`. They are plain `(ctx) => BuiltQuery` functions; never export the `breakdownQuery`/`timeseriesQuery` handles or call `.build` in consumers.
- Always destructure with renames in the scope file: `valueQueryFactory: {subject}ValueQueryFactoryV2`, `breakdownQueryFactory: {subject}BreakdownQueryFactoryV2`, etc. — never use the raw names.
- Trend-card tests live in the shared `*TrendCards.spec.tsx` driven by `testCases`; add a row, don't write a new spec file.
- Absolute imports only (`domains/...`); no `../` relative paths.
- No comments unless the WHY is non-obvious.
