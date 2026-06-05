---
name: configure-managed-dashboard
description: Configure a "managed" analytics dashboard rendered by DashboardLayoutRenderer (e.g. Performance Overview). Has sub-modes for (A) adding the standardized value/breakdown/timeseries query factories on the scope, (B) wiring a new TrendCard component, its ReportConfig entry, the default layout slot, and the shared trend-card tests, and (C) wiring a configurable bar/line graph (page-specific dimension config, graph component, ReportConfig entry, layout section, tests). Use when adding a metric card or a configurable chart to a managed dashboard such as Performance Overview.
---
# configure-managed-dashboard

This skill configures a **managed dashboard** — a dashboard rendered by `DashboardLayoutRenderer` from `@repo/reporting`, whose layout, charts, and CSV export are declared via `ReportConfig` + a `DashboardLayoutConfig` (e.g. `PerformanceOverviewReport`).

It composes three sub-modes you can run independently:

- **Mode A — Add query factories** to a scope using `getGenericQueries`, with standardized metric names and tests.
- **Mode B — Configure a trend card**: create a new chart component, register it in `ReportConfig.charts`, add it to the `defaultLayoutConfig`, and wire up the trend-card tests.
- **Mode C — Configure a configurable graph (bar / line)**: reuse the generic `configurableChartUtils` wrappers to create a page-specific dimension config + graph component, register it in `ReportConfig.charts`, add a graph section to the `defaultLayoutConfig`, and wire up the config + component tests.

For breakdown **tables**, delegate to `/add-metric-table` — but note that skill currently targets `analyticsOverview` / `analyticsAiAgent`; see **Future extensions**.

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

2. **Mode** — `add-query-factories` (A), `configure-trend-card` (B), `configure-configurable-graph` (C), or a combination. If the user asked for "a new trend card" assume A+B in that order; if they asked for "a configurable chart / bar chart / line chart" assume A+C in that order (the graph's `queryFactory` comes from Mode A's triplet). Otherwise ask:
    > "Do you want to (A) add the value/breakdown/timeseries query factories, (B) configure a trend card component + dashboard wiring, (C) configure a configurable bar/line graph + dashboard wiring, or a combination?"

Then run the matching mode(s) below. When running A first, the factories it produces feed B (`valueQueryFactory` + `timeseriesQueryFactory`) and C (`breakdownQueryFactory` for bar, `timeseriesQueryFactory` for line).

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
| `hooks/useStatsMetricTimeSeries.ts`      | line data hooks + `TimeSeriesFactory` (the line `queryFactory` type)                                                                                  |

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
    return (
        <ConfigurableGraph metrics={metrics} analyticsChartId={chartId ?? ''} />
    )
}
```

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
2. **Component spec** (`<ComponentName>.spec.tsx`) — `jest.mock` `useStatsFilters` and the data hook, partially mock `@repo/reporting` only for `useDashboardContext`, install `ResizeObserver` + `Element.prototype.getAnimations` shims (`ConfigurableGraph` needs them), render, and assert the chart's labels/values appear. Reference: `PerformanceOverviewConfigurableBarGraph.spec.tsx`.

Do **not** mock `@gorgias/axiom`, the router, TanStack Query, or the SDK query packages. Use accessible queries (`getByText`, `getByRole`) — no `data-testid`.

### C.8 — Verify

```bash
pnpm --filter @repo/helpdesk test -- getPerformanceConfigurable PerformanceOverviewConfigurable
```

Use the package `typecheck` script (tsgo). For a new chart type or layout change, run the app and confirm the graph renders and the measure/dimension selectors behave.

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

| File                                                                                                                                                                           | Role                                                                      |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------- |
| `apps/helpdesk/src/domains/reporting/models/scopes/satisfactionSurveys.ts`                                                                                                     | Reference scope with `getGenericQueries`                                  |
| `apps/helpdesk/src/domains/reporting/models/scopes/tests/satisfactionSurveys.spec.ts`                                                                                          | Reference triplet tests (Mode A)                                          |
| `apps/helpdesk/src/domains/reporting/models/scopes/utils.ts`                                                                                                                   | `getGenericQueries`, `getValueQuery`, etc.                                |
| `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`                                                                                                                     | `METRIC_NAMES` + `METRIC_NAMES_BY_SCOPE`                                  |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard.tsx`                                                                  | Reference trend-card component (Mode B)                                   |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/PerformanceOverviewReportConfig.ts`                                                                            | Reference `ReportConfig` + chart enum                                     |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/PerformanceOverviewReport.tsx`                                                                                 | Reference managed-dashboard page entry                                    |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/config/defaultLayoutConfig.ts`                                                                                 | Reference `DashboardLayoutConfig`                                         |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/kpiCharts/tests/PerformanceOverviewTrendCards.spec.tsx`                                                 | Reference shared trend-card spec                                          |
| `apps/helpdesk/src/domains/reporting/pages/convert/constants/ConvertPerformanceOverviewConfig.ts`                                                                              | Alternative local `title + hint` config map                               |
| `apps/helpdesk/src/domains/reporting/config/metricTooltipDefinitions.ts`                                                                                                       | `METRIC_TOOLTIPS` registry                                                |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricTrend.ts`                                                                                                             | `getStatsTrendHook`, `getStatsTrendFetch`                                 |
| `apps/helpdesk/src/domains/reporting/hooks/useReportingTrendCardProps.ts`                                                                                                      | Trend-card props builder                                                  |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/barChartConfig.ts`                                                                                           | Generic bar-chart config + fetch (Mode C)                                 |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/lineChartConfig.ts`                                                                                          | Generic line-chart config + fetch (Mode C)                                |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/formatters.ts`                                                                                               | Chart data formatters incl. `formatTimeSeriesDate` (Mode C)               |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/tests/formatters.spec.ts`                                                                                    | Generic formatter tests — granularity branches (Mode C)                   |
| `apps/helpdesk/src/domains/reporting/utils/configurableChartUtils/tests/lineChartConfig.spec.ts`                                                                               | Generic line fetch/config tests — empty-metrics guard + fallback (Mode C) |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricBreakdownPerDimension.ts`                                                                                             | Bar data hook + `DimensionBreakdownFactory`                               |
| `apps/helpdesk/src/domains/reporting/hooks/useStatsMetricTimeSeries.ts`                                                                                               | Line data hooks + `TimeSeriesFactory`                                     |
| `apps/helpdesk/src/domains/reporting/pages/performance/utils/getPerformanceConfigurableBarGraphConfig.ts`                                                                      | Reference page-specific bar config (Mode C)                               |
| `apps/helpdesk/src/domains/reporting/pages/performance/overview/charts/configurableGraphs/PerformanceOverviewConfigurableBarGraph/PerformanceOverviewConfigurableBarGraph.tsx` | Reference graph component (Mode C)                                        |

---

## Future extensions

- **Breakdown table**: delegate to `/add-metric-table` — but note that skill currently targets `analyticsOverview` / `analyticsAiAgent`; the table-section paths for other managed dashboards may need to be wired first.

This is not yet implemented as a mode of this skill; do not attempt it here without an updated skill spec.

---

## Key conventions

- Metric-name prefix matches the dashboard, e.g. `PERFORMANCE_OVERVIEW_*`. String value is the kebab-case equivalent.
- **Every chart id** in `<report-config-file>` (trend cards, tables, and configurable graphs alike) is prefixed with the page/dashboard slug — `performance-overview-…`, or `channels-email-…` on a `Channels > Email` dashboard — matching the other ids in the same config and the `METRIC_NAMES` prefix. The rest of the id describes the chart, not its current breakdown dimension.
- Export the `*QueryFactory` forms only — `valueQueryFactory`, `breakdownQueryFactory`, `timeseriesQueryFactory` — all named `*QueryFactoryV2`. They are plain `(ctx) => BuiltQuery` functions; never export the `breakdownQuery`/`timeseriesQuery` handles or call `.build` in consumers.
- Always destructure with renames in the scope file: `valueQueryFactory: {subject}ValueQueryFactoryV2`, `breakdownQueryFactory: {subject}BreakdownQueryFactoryV2`, etc. — never use the raw names.
- Trend-card tests live in the shared `*TrendCards.spec.tsx` driven by `testCases`; add a row, don't write a new spec file.
- Absolute imports only (`domains/...`); no `../` relative paths.
- No comments unless the WHY is non-obvious.
