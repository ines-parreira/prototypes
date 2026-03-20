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
- Replace an existing chart with a configurable graph (preserving the old chart as a deprecated fallback)
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
3. **Configurable graph component file** — Path to the configurable graph component that holds the metrics config constant, e.g. `pages/aiAgent/analyticsOverview/components/AutomationLineChart/AutomationLineChart.tsx`.
4. **Chart type** — `line` or `bar`. Infer from the component file name if obvious (`LineChart` → `line`, `ComboChart`/`BarChart` → `bar`), otherwise ask.

Then follow **Steps 1–7 (Mode A)** below.

---

### Mode B — Creating a new configurable graph

Confirm all inputs:

1. **Metric name(s)** — One or more human-readable metric names for the initial metrics, e.g. `Deflection rate`.
2. **Scope file(s)** — Path(s) to the scope file(s) for each metric.
3. **Component name** — PascalCase name for the new component, e.g. `DeflectionRateLineConfigurableGraph`.
4. **Component location** — Directory where the component should live, e.g. `pages/aiAgent/analyticsOverview/components/`.
5. **Chart type** — `line` or `bar`. Infer from the component name if obvious, otherwise ask.
6. **Filters hook** — Which filters hook to use. Default: `useAutomateFilters` from `domains/reporting/hooks/automate/useAutomateFilters`.

Then follow **Steps 1–7 (Mode B)** below.

---

### Mode C — Replacing an existing chart with a configurable graph

Use this mode when the chart already exists but is not yet a `ConfigurableGraph`. The old implementation is preserved as a deprecated fallback behind a feature flag using `ConfigurableGraphWrapper`.

Confirm all inputs:

1. **Existing component file** — Path to the chart component to replace, e.g. `pages/aiAgent/analyticsAiAgent/charts/TotalSalesByProductComboChart/TotalSalesByProductComboChart.tsx`.
2. **Metric name(s)** — Human-readable label(s) for the initial metric(s), e.g. `Total sales`.
3. **Scope file** — Path to the scope file for the metric(s). If it doesn't exist yet, run `/implement-stats-scope` first.
4. **Chart type** — `line` or `bar`. Infer from the component name if obvious, otherwise ask.
5. **Filters hook** — Which filters hook to use. Default: `useAutomateFilters` from `domains/reporting/hooks/automate/useAutomateFilters`.

Then follow **Steps 1–7 (Mode C)** below.

---

## Mode A — Add a metric to an existing configurable graph

### Step 1 — Read and understand the existing scope and component

Read `<scope-file>` to understand:
- The `MetricScope` key used (e.g. `MetricScope.OverallAutomationRate`)
- The available `measures` in `defineScope`
- For `line`: confirm `timeDimensions` is present (required for the timeseries query)

Read `<configurable-graph-component-file>` to understand:
- The existing metrics config constant name (e.g. `AUTOMATION_LINE_CHART_METRICS`)
- The config type in use (`LineChartMetricConfig[]` or `BarChartMetricConfig[]`)
- The `measure` + `metricFormat` conventions used by existing entries

---

### Step 2 — Add metric names to `metricNames.ts`

File: `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`

**For `line`** — add two entries (trend + timeseries):
```ts
AI_AGENT_DYNAMIC_<METRIC_SLUG>: 'ai-agent-dynamic-<metric-slug>',
AI_AGENT_DYNAMIC_<METRIC_SLUG>_TIMESERIES: 'ai-agent-dynamic-<metric-slug>-timeseries',
```

**For `bar`** — add one entry (trend only):
```ts
AI_AGENT_DYNAMIC_<METRIC_SLUG>: 'ai-agent-dynamic-<metric-slug>',
```

Then add the entries to `METRIC_NAMES_BY_SCOPE` under the correct `MetricScope` key.

---

### Step 3 — Add query factories to the scope file

Before making any changes:

1. **Check if the factories already exist** — search for `dynamic<MetricName>QueryFactoryV2` in `<scope-file>`. If both the trend factory and (for `line`) the timeseries factory are already exported, skip this step entirely.

2. **Check if a non-dynamic query for the same measure already exists** — look for any `export const` using the same `measures: ['<measureName>']` with a custom `filters` or extra query fields in its `defineQuery` body (e.g. `aiAgentAutomationRate` hardcodes an `automationFeatureType` filter). If found, carry those same filters into the new dynamic queries via `createScopeFilters`. If not found, omit `filters`.

Append to `<scope-file>`:

**For `line`** — add both trend and timeseries:

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

export const dynamic<MetricName>Timeseries = <scope>
    .defineMetricName(METRIC_NAMES.AI_AGENT_DYNAMIC_<METRIC_SLUG>_TIMESERIES)
    .defineQuery(({ ctx, config }) => ({
        measures: ['<measureName>'],
        // same filters as trend query if present
        time_dimensions: [
            {
                dimension: 'eventDatetime',
                granularity: ctx.granularity,
            },
        ],
        dimensions: ctx.dimensions,
    }))

export const dynamic<MetricName>TimeseriesQueryFactoryV2 = (ctx: Context) =>
    dynamic<MetricName>Timeseries.build(ctx)
```

**For `bar`** — add only the trend query:

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

**Important:** Only `line` needs `time_dimensions`. The trend query must never include it. If no custom filters exist, use `({ ctx })` and omit the `filters` field entirely.

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
    trendQueryFactory: dynamic<MetricName>QueryFactoryV2,
    timeSeriesQueryFactory: dynamic<MetricName>TimeseriesQueryFactoryV2,
    dimensions: ['overall', 'channel', 'automationFeatureType'],
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
    dimensions: ['channel', 'automationFeatureType'],
},
```

---

### Step 5 — Write scope tests

In the scope's `tests/` directory, add `describe` blocks following the patterns in `overallAutomationRate.spec.ts` and `overallAutomatedInteractions.spec.ts`.

**For `line`** — add three blocks (trend query, timeseries query, factory).

**For `bar`** — add two blocks (trend query, factory).

See **Scope Test Patterns** in the reference section at the bottom.

---

### Step 6 — Write chart component tests

Update the existing spec file for the chart component.

**First, check which wrapper the existing component uses** — read the component file:
- If it uses `ConfigurableGraphWrapper` (converted via Mode C), add the mocks for `@repo/feature-flags`, `useSaveConfigurableGraphSelection`, `useDashboardContext`, and `DEPRECATED_<ComponentName>` as shown below.
- If it uses `ConfigurableGraph` directly (created via Mode B), add only the mocks for `useSaveConfigurableGraphSelection`, `useDashboardContext`, and `ChartsActionMenu` — no feature flag mock needed.

For a `ConfigurableGraphWrapper`-based component, the spec must include these mocks at the top:

```ts
import { useFlag } from '@repo/feature-flags'
import { assumeMock } from '@repo/testing'

jest.mock('@repo/feature-flags')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext',
    () => ({
        useDashboardContext: jest.fn().mockReturnValue(null),
    }),
)
jest.mock(
    '<component-path>/DEPRECATED_<ComponentName>',
    () => ({
        DEPRECATED_<ComponentName>: () => <div>Deprecated chart</div>,
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    get<Line|Bar>ChartGraphConfig: jest.fn(),
}))
const get<Line|Bar>ChartGraphConfigMock = assumeMock(get<Line|Bar>ChartGraphConfig)
const useFlagMocked = assumeMock(useFlag)
```

And in `beforeEach`, enable the new charts feature flag:

```ts
beforeEach(() => {
    // ... other setup ...
    useFlagMocked.mockReturnValue(true)
})
```

- **For `line`**: use `ConfigurableGraphType.TimeSeries` for `'overall'` and `ConfigurableGraphType.MultipleTimeSeries` for `'channel'`/`'automationFeatureType'` in the `defaultDimension` mock.
- **For `bar`**: use `ConfigurableGraphType.Donut` in the `defaultDimension` mock.

If adding a second metric to a chart that previously had only one, add a metric selector test. This test **must** override the mock to return two metrics — with only one metric mocked, no selector button renders:

```ts
it('should render metric selector when multiple metrics are present', () => {
    const secondMetricConfig: ConfigurableGraphMetricConfig = {
        ...defaultMetricConfig,
        measure: '<second-measure>',
        name: '<second-metric-name>',
        useTrendData: jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: 100, prevValue: 80 },
        }),
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
pnpm test @repo/helpdesk <scope-spec-filename>
pnpm test @repo/helpdesk <chart-component-spec-filename>
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

Create `<component-location>/<ComponentName>/<ComponentName>.tsx`.

New charts have no deprecated version, so omit the feature flag check and render `ConfigurableGraph` directly.

**For `line`**:

```tsx
import { useMemo } from 'react'

import { ConfigurableGraph } from '@repo/reporting'

import { use<Domain>Filters } from '<filters-hook-path>'
import {
    dynamic<MetricName>QueryFactoryV2,
    dynamic<MetricName>TimeseriesQueryFactoryV2,
} from '<scope-file-path>'
import { useSaveConfigurableGraphSelection } from 'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection'
import { ChartsActionMenu } from 'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu'
import type { ChartConfig, DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { useDashboardContext } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext'
import { getLineChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { LineChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

const <CHART_NAME>_METRICS: LineChartMetricConfig[] = [
    {
        measure: '<measureName>',
        name: '<metric-name>',
        metricFormat: '<format>' as const,
        interpretAs: 'more-is-better' as const,
        trendQueryFactory: dynamic<MetricName>QueryFactoryV2,
        timeSeriesQueryFactory: dynamic<MetricName>TimeseriesQueryFactoryV2,
        dimensions: ['overall', 'channel', 'automationFeatureType'],
    },
]

export const <ComponentName> = ({ chartId, dashboard, chartConfig }: Props) => {
    const { statsFilters, userTimezone, granularity } = use<Domain>Filters()
    const dashboardContext = useDashboardContext()
    const { onSelect } = useSaveConfigurableGraphSelection({
        chartId: chartId ?? '',
        dashboardId: dashboardContext?.dashboardId,
        tabId: dashboardContext?.tabId,
        tabName: dashboardContext?.tabName,
        layoutConfig: dashboardContext?.layoutConfig ?? { sections: [] },
    })
    const savedItem = dashboardContext?.layoutConfig?.sections
        .flatMap((s) => s.items)
        .find((item) => item.chartId === (chartId ?? ''))

    const metrics = useMemo(
        () => getLineChartGraphConfig(<CHART_NAME>_METRICS, statsFilters, userTimezone, granularity),
        [statsFilters, userTimezone, granularity],
    )

    return (
        <ConfigurableGraph
            key={`${savedItem?.chartId}-${dashboardContext?.isLoaded ?? false}`}
            metrics={metrics}
            onSelect={onSelect}
            initialMeasure={savedItem?.measures?.[0]}
            initialDimension={savedItem?.dimensions?.[0]}
            actionMenu={
                chartId && chartConfig ? (
                    <ChartsActionMenu
                        chartId={chartId}
                        dashboard={dashboard}
                        chartName={chartConfig.label}
                    />
                ) : undefined
            }
        />
    )
}
```

**For `bar`** — same structure but use `getBarChartGraphConfig` + `BarChartMetricConfig`, omit `granularity` from the filters destructure, and omit it from the `useMemo` deps and the config util call.

---

### Step 5 — Write scope tests

Same as Mode A Step 5. See **Scope Test Patterns** in the reference section.

---

### Step 6 — Write chart component tests

Create `<component-location>/<ComponentName>/tests/<ComponentName>.spec.tsx`.

New charts have no deprecated fallback, so omit the deprecated chart test and `useFlag` mock. Follow this spec structure:

```tsx
import { render, screen } from '@testing-library/react'
import { assumeMock } from '@repo/testing'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'

import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { <ComponentName> } from '<component-path>'
import { get<Line|Bar>ChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext',
    () => ({
        useDashboardContext: jest.fn().mockReturnValue(null),
    }),
)
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
    () => ({
        ChartsActionMenu: () => (
            <div aria-label="charts-action-menu">Charts Action Menu</div>
        ),
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    get<Line|Bar>ChartGraphConfig: jest.fn(),
}))
const get<Line|Bar>ChartGraphConfigMock = assumeMock(get<Line|Bar>ChartGraphConfig)

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
        useTrendData: jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: <mockValue>, prevValue: <lowerValue> },
        }),
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

    beforeEach(() => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: { period: { start_datetime: '...', end_datetime: '...' } },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        get<Line|Bar>ChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
    })

    afterEach(() => { jest.clearAllMocks() })

    it('should render the metric title', () => { ... })
    it('should render the metric value from trend data', () => { ... })
    it('should render the trend badge', () => { ... })
    it('should render with positive trend icon', () => { ... })
    it('should render with negative trend icon when trend is negative', () => { ... })
    it('should render responsive container for chart', () => { ... })
    it('should render loading skeleton when trend data is fetching', () => { ... })

    describe('ChartsActionMenu', () => {
        it('should render ChartsActionMenu when chartId and chartConfig are provided', () => { ... })
        it('should not render ChartsActionMenu when chartId is not provided', () => { ... })
        it('should not render ChartsActionMenu when chartConfig is not provided', () => { ... })
    })
})
```

---

### Step 7 — Run tests, lint, typecheck, and format

```
pnpm test @repo/helpdesk <scope-spec-filename>
pnpm test @repo/helpdesk <ComponentName>.spec.tsx
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
- Which hooks, props, and logic it contains — these move to the deprecated file
- The existing spec file location

---

### Step 2 — Move the old component to a deprecated file

Create `<component-dir>/DEPRECATED_<ComponentName>.tsx` and copy the full existing implementation into it, renaming the exported component to `DEPRECATED_<ComponentName>`.

Do not modify the logic — this file is a verbatim copy of the old implementation under a new name.

---

### Step 3 — Add metric names to `metricNames.ts`

Same as Mode A Step 2. Add one entry per metric (for `bar`) or two entries per metric (for `line`), and add them to `METRIC_NAMES_BY_SCOPE` under the correct `MetricScope` key.

---

### Step 4 — Add query factories to the scope file

Same as Mode A Step 3. Append the query factory exports to the scope file.

---

### Step 5 — Rewrite the main component

Replace the contents of `<existing-component-file>` with a component that uses `ConfigurableGraphWrapper`:

```tsx
import { useMemo } from 'react'

import { use<Domain>Filters } from '<filters-hook-path>'
import { dynamic<MetricName>QueryFactoryV2 } from '<scope-file-path>'
import type { ChartConfig, DashboardSchema } from 'domains/reporting/pages/dashboards/types'
import { ConfigurableGraphWrapper } from 'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/ConfigurableGraphWrapper'
import { get<Line|Bar>ChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import type { <Line|Bar>ChartMetricConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

import { DEPRECATED_<ComponentName> } from './DEPRECATED_<ComponentName>'

type Props = {
    chartId?: string
    dashboard?: DashboardSchema
    chartConfig?: ChartConfig
}

const <CHART_NAME>_METRICS: <Line|Bar>ChartMetricConfig[] = [
    {
        measure: '<measureName>',
        name: '<metric-name>',
        metricFormat: '<format>' as const,
        interpretAs: 'more-is-better' as const,
        // bar: queryFactory; line: trendQueryFactory + timeSeriesQueryFactory
        queryFactory: dynamic<MetricName>QueryFactoryV2,
        // bar: ['channel']; line: ['overall', 'channel', 'automationFeatureType']
        dimensions: ['channel'],
    },
]

export const <ComponentName> = ({ chartId, dashboard, chartConfig }: Props) => {
    const { statsFilters, userTimezone } = use<Domain>Filters()  // add granularity for line
    const metrics = useMemo(
        () => get<Line|Bar>ChartGraphConfig(<CHART_NAME>_METRICS, statsFilters, userTimezone),
        [statsFilters, userTimezone],
    )

    return (
        <ConfigurableGraphWrapper
            metrics={metrics}
            analyticsChartId={chartId ?? ''}
            DeprecatedChart={DEPRECATED_<ComponentName>}
            chartId={chartId}
            dashboard={dashboard}
            chartConfig={chartConfig}
        />
    )
}
```

---

### Step 6 — Write scope tests

Same as Mode A Step 5. Add `describe` blocks for each new query factory in the scope's `tests/` directory.

---

### Step 7 — Write chart component tests

Move the existing spec file to `<component-dir>/tests/DEPRECATED_<ComponentName>.spec.tsx` (renaming it to match the deprecated component). Do not modify its contents.

Then create a new `<component-dir>/tests/<ComponentName>.spec.tsx` for the new configurable component. Follow the same `defaultDimension` / `defaultMetricConfig` setup pattern as Mode B Step 6, but add the `@repo/feature-flags` mock and `DEPRECATED_<ComponentName>` mock, and include the deprecated fallback test:

```tsx
import { useFlag } from '@repo/feature-flags'
import type { ConfigurableGraphMetricConfig } from '@repo/reporting'
import { ConfigurableGraphType } from '@repo/reporting'
import { assumeMock } from '@repo/testing'
import { render, screen } from '@testing-library/react'

import * as statsHooks from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { <ComponentName> } from '<component-path>'
import { get<Line|Bar>ChartGraphConfig } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

jest.mock('@repo/feature-flags')
jest.mock(
    'domains/reporting/hooks/managed-dashboards/useSaveConfigurableGraphSelection',
    () => ({
        useSaveConfigurableGraphSelection: () => ({ onSelect: jest.fn() }),
    }),
)
jest.mock(
    'pages/aiAgent/analyticsOverview/components/DashboardLayoutRenderer/DashboardContext',
    () => ({
        useDashboardContext: jest.fn().mockReturnValue(null),
    }),
)
jest.mock(
    '<component-path>/DEPRECATED_<ComponentName>',
    () => ({
        DEPRECATED_<ComponentName>: () => <div>Deprecated chart</div>,
    }),
)
jest.mock('pages/aiAgent/utils/aiAgentMetrics.utils', () => ({
    ...jest.requireActual('pages/aiAgent/utils/aiAgentMetrics.utils'),
    get<Line|Bar>ChartGraphConfig: jest.fn(),
}))
const get<Line|Bar>ChartGraphConfigMock = assumeMock(get<Line|Bar>ChartGraphConfig)
const useFlagMocked = assumeMock(useFlag)

describe('<ComponentName>', () => {
    const mockChartData = [
        { name: 'Email', value: 5000 },
        { name: 'Chat', value: 3000 },
    ]

    const defaultDimension = {
        id: 'channel',
        name: 'Channel',
        configurableGraphType: ConfigurableGraphType.Donut,  // TimeSeries for line
        useChartData: jest.fn().mockReturnValue({
            data: mockChartData,
            isLoading: false,
        }),
    }

    const defaultMetricConfig: ConfigurableGraphMetricConfig = {
        measure: '<measureName>',
        name: '<metric-name>',
        metricFormat: '<format>',
        interpretAs: 'more-is-better',
        useTrendData: jest.fn().mockReturnValue({
            isFetching: false,
            isError: false,
            data: { value: <mockValue>, prevValue: <lowerValue> },
        }),
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

    beforeEach(() => {
        jest.spyOn(statsHooks, 'useStatsFilters').mockReturnValue({
            cleanStatsFilters: {
                period: {
                    start_datetime: '2024-01-01',
                    end_datetime: '2024-01-31',
                },
            },
            userTimezone: 'UTC',
            granularity: ReportingGranularity.Day,
        })
        get<Line|Bar>ChartGraphConfigMock.mockReturnValue([defaultMetricConfig])
        useFlagMocked.mockReturnValue(true)
    })

    afterEach(() => { jest.clearAllMocks() })

    it('should render the metric title', () => { ... })
    it('should render the metric value from trend data', () => { ... })
    it('should render the trend badge', () => { ... })
    it('should render with positive trend icon', () => { ... })
    it('should render with negative trend icon when trend is negative', () => { ... })
    it('should render all channel legend items', () => { ... })
    it('should render responsive container for chart', () => { ... })
    it('should render loading skeleton when trend data is fetching', () => { ... })

    it('should render deprecated chart when feature flag is disabled', () => {
        useFlagMocked.mockReturnValue(false)

        render(<ComponentName />)

        expect(screen.getByText('Deprecated chart')).toBeInTheDocument()
    })
})
```

---

### Step 8 — Run tests, lint, typecheck, and format

```
pnpm test @repo/helpdesk <scope-spec-filename>
pnpm test @repo/helpdesk <ComponentName>.spec.tsx
pnpm lint:affected
pnpm typecheck:affected
pnpm format:fix:affected
```

Fix any failures before finishing.

---

## Reference — Scope Test Patterns

### For `line` — three blocks

```ts
describe('dynamic<MetricName>', () => {
    it('creates query without dimensions when no dimension provided', () => {
        expect(dynamic<MetricName>.build({ ...context, dimensions: [] })).toEqual({
            metricName: 'ai-agent-dynamic-<metric-slug>',
            scope: '<scope-name>',
            measures: ['<measureName>'],
            dimensions: [],
            timezone: 'utc',
            filters: periodFilters,
        })
    })
    it('creates query with the provided dimension', () => { ... })
})

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

| | `line` | `bar` |
|---|---|---|
| Config type | `LineChartMetricConfig` | `BarChartMetricConfig` |
| Config util | `getLineChartGraphConfig` | `getBarChartGraphConfig` |
| Query factories | `trendQueryFactory` + `timeSeriesQueryFactory` | `queryFactory` only |
| Metric names | Two (`slug` + `slug-timeseries`) | One (`slug` only) |
| Dimensions | `['overall', 'channel', 'automationFeatureType']` | `['channel', 'automationFeatureType']` |
| Chart types in tests | `TimeSeries` / `MultipleTimeSeries` | `Donut` |
| `granularity` in component | Yes (filters destructure + useMemo deps) | No |

- **Metric name slug**: kebab-case, prefixed with `ai-agent-dynamic-`, e.g. `ai-agent-dynamic-deflection-rate`
- **`as const`**: Use on `metricFormat` and `interpretAs` in the metrics config array
- **Module-level constant**: Keep the metrics array at module scope, not inside the component
- **`metricFormat`**: `'decimal-to-percent'` for rates/percentages, `'decimal'` for raw counts
- **Mode B (new chart)**: Renders `ConfigurableGraph` directly with dashboard context wiring — no `DEPRECATED_` fallback, no feature flag
- **Mode C (replacement)**: Uses `ConfigurableGraphWrapper` — preserves old chart as `DEPRECATED_<ComponentName>` behind a feature flag
