---
name: configurable-graph-builder
description: Add a new metric to a ConfigurableGraph chart, replace an existing chart with a ConfigurableGraph, or create a new ConfigurableGraph chart from scratch. Handles scope query factories, metric name registration, chart config, and tests for both line and bar chart types.
---
# Configurable graph builder

This skill adds a new metric to an existing chart component, replaces an existing non-configurable chart with a `ConfigurableGraph`, or creates a brand new chart component using `ConfigurableGraph`.

## When to Use

Apply this skill when the user asks to:

- Add a new metric to an analytics configurable graph
- Extend a `ConfigurableGraph` line or bar chart with an additional data series
- Replace an existing chart with a configurable graph
- Create a brand new configurable graph component from scratch

---

## Step 0 — Gather Required Information

Before doing anything, determine the **mode** and confirm all required inputs. Ask for anything missing.

### Determine mode

Ask if not obvious from the user's request:

> "Are you **adding a metric to an existing configurable graph**, **replacing an existing non-configurable chart** with a configurable one, or **creating a new configurable graph from scratch**?"

---

### Mode A — Adding a metric to an existing configurable graph

Confirm all four inputs:

1. **Metric name** — Human-readable label, e.g. `Deflection rate`.
2. **Scope file** — Path to the existing scope file, e.g. `domains/reporting/models/scopes/overallAutomationRate.ts`.
3. **Configurable graph component file** — Path to the configurable graph component that holds the metrics config constant, e.g. `pages/aiAgent/analyticsOverview/components/AnalyticsOverviewConfigurableLineGraph/AnalyticsOverviewConfigurableLineGraph.tsx`.
4. **Chart type** — `line` or `bar`. Infer from the component file name if obvious (`ConfigurableLineGraph`/`ConfigurableLine` → `line`, `ConfigurableBarGraph`/`ConfigurableBar` → `bar`), otherwise ask.

Then follow **Steps 1–7 (Mode A)** below.

---

### Mode B — Creating a new configurable graph

Confirm all inputs:

1. **Metric name(s)** — One or more human-readable metric names for the initial metrics, e.g. `Deflection rate`.
2. **Scope file(s)** — Path(s) to the scope file(s) for each metric.
3. **Component name** — PascalCase name for the new component, e.g. `AnalyticsAiAgentDeflectionConfigurableLine`.
4. **Component location** — Directory where the component should live, e.g. `pages/aiAgent/analyticsAiAgent/charts/`.
5. **Chart type** — `line` or `bar`. Infer from the component name if obvious, otherwise ask.
6. **Filters hook** — Which filters hook to use. Default: `useAiAgentStatsFilters` from `pages/aiAgent/hooks/useAiAgentStatsFilters`.

Then follow **Steps 1–7 (Mode B)** below.

---

### Mode C — Replacing an existing chart with a configurable graph

Use this mode when the chart already exists but is not yet a `ConfigurableGraph`. Unlike older revamp PRs, there is no longer a deprecated fallback — the old implementation is removed and replaced outright. Feature-flag gating of the dashboard action menu is handled inside `AiAgentConfigurableGraphWrapper`.

Confirm all inputs:

1. **Existing component file** — Path to the chart component to replace.
2. **Metric name(s)** — Human-readable label(s) for the initial metric(s), e.g. `Total sales`.
3. **Scope file** — Path to the scope file for the metric(s). If it doesn't exist yet, run `/implement-stats-scope` first.
4. **Chart type** — `line` or `bar`. Infer from the component name if obvious, otherwise ask.
5. **Filters hook** — Which filters hook to use. Default: `useAiAgentStatsFilters` from `pages/aiAgent/hooks/useAiAgentStatsFilters`.

Then follow **Steps 1–7 (Mode C)** below.

---

## Mode A — Add a metric to an existing configurable graph

### Step 1 — Read and understand the existing scope and component

Read `<scope-file>` to understand:

- The `MetricScope` key used (e.g. `MetricScope.OverallAutomationRate`)
- The available `measures` in `defineScope`
- For `line`: confirm `timeDimensions` is present (required for the timeseries query)

Read `<configurable-graph-component-file>` to understand:

- The existing metrics config constant name (e.g. `OVERVIEW_LINE_CHART_METRICS`)
- The config type in use (`LineChartMetricConfig[]` or `BarChartMetricConfig[]`)
- The `measure` + `metricFormat` conventions used by existing entries
- Which extras are passed through `getLineChartGraphConfig` / `getBarChartGraphConfig` (`stores` from `useStoreIntegrations`, `costSavedPerInteraction` from `useMoneySavedPerInteractionWithAutomate`)

---

### Step 2 — Add metric names to `metricNames.ts`

File: `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`

**For `line`** — add one entry:

```ts
AI_AGENT_DYNAMIC_<METRIC_SLUG>_TIMESERIES: 'ai-agent-dynamic-<metric-slug>-timeseries',
```

**For `bar`** — add one entry:

```ts
AI_AGENT_DYNAMIC_<METRIC_SLUG>: 'ai-agent-dynamic-<metric-slug>',
```

Then add the entries to `METRIC_NAMES_BY_SCOPE` under the correct `MetricScope` key.

---

### Step 3 — Add query factories to the scope file

Before making any changes:

1. **Check if the factories already exist** — search for the needed factories in `<scope-file>`. For `line`, that's `dynamic<MetricName>TimeseriesQueryFactoryV2`; for `bar`, `dynamic<MetricName>QueryFactoryV2`. If the required factory is already exported, skip this step entirely.

2. **Check if a non-dynamic query for the same measure already exists** — look for any `export const` using the same `measures: ['<measureName>']` with a custom `filters` or extra query fields in its `defineQuery` body (e.g. `aiAgentAutomationRate` hardcodes an `automationFeatureType` filter). If found, carry those same filters into the new dynamic queries via `createScopeFilters`. If not found, omit `filters`.

Append to `<scope-file>`:

**For `line`** — add only the timeseries query:

```ts
export const dynamic<MetricName>Timeseries = <scope>
    .defineMetricName(METRIC_NAMES.AI_AGENT_DYNAMIC_<METRIC_SLUG>_TIMESERIES)
    .defineQuery(({ ctx, config }) => ({
        measures: ['<measureName>'],
        // filters: createScopeFilters({ ...ctx.filters, <field>: <value> }, config),
        time_dimensions: [
            {
                dimension: 'eventDatetime',
                granularity: ctx.granularity,
            },
        ],
        dimensions: ctx.dimensions,
        limit: 10000,
    }))

export const dynamic<MetricName>TimeseriesQueryFactoryV2 = (ctx: Context) =>
    dynamic<MetricName>Timeseries.build(ctx)
```

**For `bar`** — add only the breakdown query:

```ts
export const dynamic<MetricName> = <scope>
    .defineMetricName(METRIC_NAMES.AI_AGENT_DYNAMIC_<METRIC_SLUG>)
    .defineQuery(({ ctx, config }) => ({
        measures: ['<measureName>'],
        // filters: createScopeFilters({ ...ctx.filters, <field>: <value> }, config),
        dimensions: ctx.dimensions,
    }))

export const dynamic<MetricName>QueryFactoryV2 = (ctx: Context) =>
    dynamic<MetricName>.build(ctx)
```

**Important:** Only `line` needs `time_dimensions`. If no custom filters exist, use `({ ctx })` and omit the `filters` field entirely.

---

### Step 4 — Add the metric config to the configurable graph component

Add a new entry to the metrics config constant and import the new factory functions.

**For `line`**:

```ts
{
    measure: '<measureName>',
    name: '<metric-name>',
    metricFormat: '<format>' as const,
    interpretAs: 'more-is-better' as const,
    timeSeriesQueryFactory: dynamic<MetricName>TimeseriesQueryFactoryV2,
    dimensions: ['overall', 'channel', 'storeIntegrationId', 'automationFeatureType'],
},
```

**For `bar`**:

```ts
{
    measure: '<measureName>',
    name: '<metric-name>',
    metricFormat: '<format>' as const,
    interpretAs: 'more-is-better' as const,
    queryFactory: dynamic<MetricName>QueryFactoryV2,
    dimensions: ['channel', 'storeIntegrationId', 'automationFeatureType'],
},
```

For derived metrics (e.g. `costSaved`) reuse an existing `queryFactory` and add a `valueTransform` that reads from `extra` (`costSavedPerInteraction`, `stores`, …). See `OVERVIEW_BAR_CHART_METRICS` for the canonical example.

---

### Step 5 — Write scope tests

In the scope's `tests/` directory, add `describe` blocks following the patterns in `overallAutomationRate.spec.ts` and `overallAutomatedInteractions.spec.ts`.

**For `line`** — add two blocks (timeseries query, factory).

**For `bar`** — add two blocks (breakdown query, factory).

See **Scope Test Patterns** in the reference section at the bottom.

---

### Step 6 — Write chart component tests

Update the existing spec file for the chart component. The component now renders `AiAgentConfigurableGraphWrapper`, which internally calls `useFlagWithLoading` and `useDashboardContext` (from `@repo/reporting`). Spec files mock those modules, **not** the wrapper component itself.

Top-of-file mock skeleton (applies to both `line` and `bar`):

```ts
import { useFlagWithLoading } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock, render } from '@repo/testing'
import { screen } from '@testing-library/react'

import { useListStores } from '@gorgias/helpdesk-queries'

import { ReportingGranularity } from 'domains/reporting/models/types'
import * as aiAgentStatsFiltersHooks from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { get<Line|Bar>ChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { <ComponentName> } from '../<ComponentName>'

jest.mock('@repo/feature-flags')
jest.mock('@gorgias/helpdesk-queries', () => ({
    ...jest.requireActual('@gorgias/helpdesk-queries'),
    useListStores: jest.fn(),
    useUpdateAnalyticsManagedDashboard: jest.fn(() => ({
        mutate: jest.fn(),
        isLoading: false,
    })),
    useListAnalyticsManagedDashboards: jest.fn(() => ({
        data: undefined,
        isLoading: false,
    })),
}))
jest.mock('@repo/reporting', () => ({
    ...jest.requireActual('@repo/reporting'),
    useDashboardContext: jest.fn().mockReturnValue(null),
}))
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    get<Line|Bar>ChartGraphConfig: jest.fn(),
}))
const get<Line|Bar>ChartGraphConfigMock = assumeMock(get<Line|Bar>ChartGraphConfig)
const useListStoresMock = assumeMock(useListStores)
const useFlagWithLoadingMocked = assumeMock(useFlagWithLoading)
```

And in `beforeEach`, set up the stats filters mock, the chart config mock, the stores list, and the feature flag:

```ts
beforeEach(() => {
    jest.spyOn(
        aiAgentStatsFiltersHooks,
        'useAiAgentStatsFilters',
    ).mockReturnValue({
        statsFilters: {
            period: { start_datetime: '...', end_datetime: '...' },
        },
        userTimezone: 'UTC',
        granularity: ReportingGranularity.Day,
    })
    useListStoresMock.mockReturnValue({ data: [] } as any)
    ;(get < Line) |
        (Bar > ChartGraphConfigMock.mockReturnValue([defaultMetricConfig]))
    useFlagWithLoadingMocked.mockReturnValue({ value: true, isLoading: false })
})
```

- **For `line`**: use `ConfigurableGraphType.TimeSeries` for `'overall'` and `ConfigurableGraphType.MultipleTimeSeries` for breakdown dimensions in the `defaultDimension` mock.
- **For `bar`**: use `ConfigurableGraphType.Donut` in the `defaultDimension` mock.

If adding a second metric to a chart that previously had only one, add a metric selector test. This test **must** override the mock to return two metrics — with only one metric mocked, no selector button renders:

```ts
it('should render metric selector when multiple metrics are present', () => {
    const secondMetricConfig: ConfigurableGraphMetricConfig = {
        ...defaultMetricConfig,
        measure: '<second-measure>',
        name: '<second-metric-name>',
        // bar only — omit for line:
        // useTrendData: jest.fn().mockReturnValue({
        //     isFetching: false,
        //     isError: false,
        //     data: { value: 100, prevValue: 80 },
        // }),
    }
    get<Line|Bar>ChartGraphConfigMock.mockReturnValue([defaultMetricConfig, secondMetricConfig])

    render(<ChartComponent />)

    expect(
        screen.getByRole('button', { name: /<first-metric-name>/i }),
    ).toBeInTheDocument()
})
```

---

### Step 7 — Run tests, lint, typecheck, and format

```
pnpm --filter @repo/helpdesk test -- <scope-spec-filename>
pnpm --filter @repo/helpdesk test -- <chart-component-spec-filename>
pnpm lint:affected
pnpm typecheck:affected
pnpm format:fix:affected
```

Fix any failures before finishing.

---

## Mode B — Create a new configurable graph from scratch

### Step 1 — Read and understand the scope file(s)

For each scope file, read it to understand:

- The `MetricScope` key and the `scope` variable name
- The available `measures` in `defineScope`
- For `line`: confirm `timeDimensions` is present

---

### Step 2 — Add metric names to `metricNames.ts`

Same as Mode A Step 2. Repeat for each metric.

---

### Step 3 — Add query factories to the scope file(s)

Same as Mode A Step 3. Repeat for each metric across each scope file.

---

### Step 4 — Create the configurable graph component

Create `<component-location>/<ComponentName>/<ComponentName>.tsx`. New charts always render `AiAgentConfigurableGraphWrapper` (aliased as `ConfigurableGraphWrapper`) — the wrapper owns the `ConfigurableGraph` render, the feature-flag check for the dashboard action menu, and `ChartsActionMenu` wiring. The chart component itself only computes the metrics config and passes through dashboard props.

**For `line`**:

```tsx
import { useMemo } from 'react'

import { dynamic<MetricName>TimeseriesQueryFactoryV2 } from '<scope-file-path>'
import type { ChartConfig, DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { AiAgentConfigurableGraphWrapper as ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/AiAgentConfigurableGraphWrapper'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import {
    getLineChartGraphConfig,
    useStoreIntegrations,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { LineChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

export const <CHART_NAME>_METRICS: LineChartMetricConfig[] = [
    {
        measure: '<measureName>',
        name: '<metric-name>',
        metricFormat: '<format>' as const,
        interpretAs: 'more-is-better' as const,
        timeSeriesQueryFactory: dynamic<MetricName>TimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'storeIntegrationId', 'automationFeatureType'],
    },
]

export const <ComponentName> = ({ chartId, dashboard, chartConfig }: Props) => {
    const { statsFilters, userTimezone, granularity } = useAiAgentStatsFilters()
    const stores = useStoreIntegrations()

    const metrics = useMemo(
        () =>
            getLineChartGraphConfig(
                <CHART_NAME>_METRICS,
                statsFilters,
                userTimezone,
                granularity,
                { stores },
            ),
        [statsFilters, userTimezone, granularity, stores],
    )

    return (
        <ConfigurableGraphWrapper
            metrics={metrics}
            analyticsChartId={chartId ?? ''}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}
```

**For `bar`** — same structure but use `getBarChartGraphConfig` + `BarChartMetricConfig`, omit `granularity` from the filters destructure and `useMemo` deps, and pass extras as `{ stores, costSavedPerInteraction }` when any metric needs `costSaved`-style derivations (then also call `useMoneySavedPerInteractionWithAutomate(AGENT_COST_PER_TICKET)`).

---

### Step 5 — Write scope tests

Same as Mode A Step 5. See **Scope Test Patterns** in the reference section.

---

### Step 6 — Write chart component tests

Create `<component-location>/<ComponentName>/tests/<ComponentName>.spec.tsx`. Use the same mock skeleton and `beforeEach` setup as Mode A Step 6 — there is no deprecated-chart variant. Suggested spec structure:

```tsx
describe('<ComponentName>', () => {
    const defaultDimension = {
        id: 'overall',                          // 'automationFeatureType' for bar
        name: 'Overall',                        // 'Feature' for bar
        configurableGraphType: ConfigurableGraphType.TimeSeries,  // Donut for bar
        useChartData: jest.fn().mockReturnValue({ data: [...], isLoading: false }),
    }

    const defaultMetricConfig: ConfigurableGraphMetricConfig = {
        measure: '<measureName>',
        name: '<metric-name>',
        metricFormat: '<format>',
        interpretAs: 'more-is-better',
        // bar only — omit for line (configurable line charts do not render a trend):
        // useTrendData: jest.fn().mockReturnValue({
        //     isFetching: false,
        //     isError: false,
        //     data: { value: <mockValue>, prevValue: <lowerValue> },
        // }),
        dimensions: [defaultDimension],
    }

    beforeAll(() => {
        global.ResizeObserver = class ResizeObserver {
            observe() {}
            unobserve() {}
            disconnect() {}
        }
        Element.prototype.getAnimations = function () { return [] }
    })

    beforeEach(() => { /* setup as in Mode A Step 6 */ })
    afterEach(() => { jest.clearAllMocks() })

    it('should render the metric title', () => { ... })
    it('should render responsive container for chart', () => { ... })

    // bar only — configurable line charts no longer show a trend:
    it('should render the metric value from trend data', () => { ... })
    it('should render the trend badge', () => { ... })
    it('should render with positive trend icon', () => { ... })
    it('should render with negative trend icon when trend is negative', () => { ... })
    it('should render loading skeleton when trend data is fetching', () => { ... })

    // line only — assert the absence of the trend area:
    it('should not render a trend badge', () => {
        const { container } = render(<ComponentName />)
        const icons = container.querySelectorAll('svg')
        const hasTrendIcon = Array.from(icons).some((icon) =>
            icon.getAttribute('aria-label')?.includes('trending'),
        )
        expect(hasTrendIcon).toBe(false)
    })

    // When the metrics config consumes extras like `stores`, also assert wiring:
    it('should pass stores from useListStores to get<Line|Bar>ChartGraphConfig', () => { ... })
})
```

The dashboard action menu is rendered by `AiAgentConfigurableGraphWrapper`, so its presence/absence is covered by the wrapper's own tests — don't re-test it from each chart spec.

---

### Step 7 — Run tests, lint, typecheck, and format

```
pnpm --filter @repo/helpdesk test -- <scope-spec-filename>
pnpm --filter @repo/helpdesk test -- <ComponentName>.spec.tsx
pnpm lint:affected
pnpm typecheck:affected
pnpm format:fix:affected
```

Fix any failures before finishing.

---

## Mode C — Replace an existing chart with a configurable graph

### Step 1 — Read the existing component

Read `<existing-component-file>` to understand:

- The existing component name (e.g. `TotalSalesByProductComboChart`)
- Which hooks, props, and logic it contains — confirm there is no behavior worth preserving outside what the configurable graph already covers
- The existing spec file location

There is no longer a deprecated fallback pattern: the old implementation is removed in this mode, **not** preserved behind a feature flag.

---

### Step 2 — Add metric names to `metricNames.ts`

Same as Mode A Step 2. Add one entry per metric, and add them to `METRIC_NAMES_BY_SCOPE` under the correct `MetricScope` key.

---

### Step 3 — Add query factories to the scope file

Same as Mode A Step 3. Append the query factory exports to the scope file.

---

### Step 4 — Rewrite the main component

Replace the contents of `<existing-component-file>` with a component that uses `AiAgentConfigurableGraphWrapper` (see the Mode B Step 4 template). Keep the file path and exported component name stable so import sites elsewhere don't need updates.

---

### Step 5 — Delete the old spec file

The previous spec validated the old chart's internals; with the configurable replacement the assertions no longer apply. Delete `<component-dir>/tests/<ComponentName>.spec.tsx` and replace it in Step 7 with a new spec written against the configurable graph.

---

### Step 6 — Write scope tests

Same as Mode A Step 5. Add `describe` blocks for each new query factory in the scope's `tests/` directory.

---

### Step 7 — Write the new chart component spec

Create `<component-dir>/tests/<ComponentName>.spec.tsx` following Mode B Step 6. No `DEPRECATED_<ComponentName>` mock or deprecated-fallback test is needed.

---

### Step 8 — Run tests, lint, typecheck, and format

```
pnpm --filter @repo/helpdesk test -- <scope-spec-filename>
pnpm --filter @repo/helpdesk test -- <ComponentName>.spec.tsx
pnpm lint:affected
pnpm typecheck:affected
pnpm format:fix:affected
```

Fix any failures before finishing.

---

## Reference — Scope Test Patterns

### For `line` — two blocks (timeseries only)

```ts
describe('dynamic<MetricName>Timeseries', () => {
    it('creates query with time_dimensions using granularity from context', () => {
        expect(dynamic<MetricName>Timeseries.build({ ...context, granularity: 'day' as AggregationWindow, dimensions: [] })).toEqual({
            metricName: 'ai-agent-dynamic-<metric-slug>-timeseries',
            scope: '<scope-name>',
            measures: ['<measureName>'],
            time_dimensions: [{ dimension: 'eventDatetime', granularity: 'day' }],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
            limit: 10000,
        })
    })
    it('creates query with the provided dimensions', () => { ... })
})

describe('dynamic<MetricName>TimeseriesQueryFactoryV2', () => {
    it('returns the same result as calling build directly', () => { ... })
    it('returns query with time_dimensions when granularity is provided', () => { ... })
    it('returns query with the provided dimensions', () => { ... })
})
```

### For `bar` — two blocks

```ts
describe('dynamic<MetricName>', () => {
    it('creates query without dimensions when no dimension provided', () => { ... })
    it('creates query with the provided dimension', () => { ... })
})

describe('dynamic<MetricName>QueryFactoryV2', () => {
    it('returns query with empty dimensions when no dimension provided', () => { ... })
    it('returns query with the provided dimension', () => { ... })
    it('returns the same result as calling build directly with the dimension', () => { ... })
})
```

---

## Key Conventions

|                            | `line`                                                                  | `bar`                                                        |
| -------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------ |
| Config type                | `LineChartMetricConfig`                                                 | `BarChartMetricConfig`                                       |
| Config util                | `getLineChartGraphConfig`                                               | `getBarChartGraphConfig`                                     |
| Query factories            | `timeSeriesQueryFactory` only (no trend)                                | `queryFactory` only                                          |
| Metric names               | One (`slug-timeseries` only)                                            | One (`slug` only)                                            |
| Dimensions                 | `['overall', 'channel', 'storeIntegrationId', 'automationFeatureType']` | `['channel', 'storeIntegrationId', 'automationFeatureType']` |
| Chart types in tests       | `TimeSeries` / `MultipleTimeSeries`                                     | `Donut`                                                      |
| `granularity` in component | Yes (filters destructure + useMemo deps)                                | No                                                           |
| Trend header in chart      | No — `ConfigurableGraph` hides the trend area                           | Yes — driven by `useTrendData`                               |

- **Metric name slug**: kebab-case, prefixed with `ai-agent-dynamic-`, e.g. `ai-agent-dynamic-deflection-rate`
- **`as const`**: Use on `metricFormat` and `interpretAs` in the metrics config array
- **Module-level constant**: Keep the metrics array at module scope, not inside the component
- **`metricFormat`**: `'decimal-to-percent'` for rates/percentages, `'decimal'` for raw counts, `'duration'` for time-saved measures, `'currency-precision-1'` for cost-saved derived metrics
- **Wrapper component**: All AI Agent configurable charts render through `AiAgentConfigurableGraphWrapper` (from `pages/aiAgent/analyticsOverview/components/AiAgentConfigurableGraphWrapper`). The wrapper owns the `useFlagWithLoading` feature-flag check for the dashboard action menu and the `ChartsActionMenu` render — chart components do not call these directly.
- **Dashboard context**: `useDashboardContext` is exported from `@repo/reporting`. Chart specs mock it via `jest.mock('@repo/reporting', ...)`.
- **Extras**: `getLineChartGraphConfig` / `getBarChartGraphConfig` accept an optional final argument `{ stores, costSavedPerInteraction }`. Pull `stores` from `useStoreIntegrations()` and `costSavedPerInteraction` from `useMoneySavedPerInteractionWithAutomate(AGENT_COST_PER_TICKET)` when any metric needs them. Specs assert this wiring by mocking `useListStores` from `@gorgias/helpdesk-queries` and checking the final argument passed to the config util.
