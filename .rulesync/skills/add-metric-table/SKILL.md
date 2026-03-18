---
name: add-metric-table
description: Add a new analytics metric breakdown table to the AI Agent Analytics Overview dashboard. Scaffolds scope queries, per-metric hooks, aggregator hook, download hook, component files, report config entry, and layout config entry.
---

# Add Metric Breakdown Table

Create a new analytics breakdown table for the AI Agent Analytics Overview dashboard. The table shows the standard 5 metrics (overall automation rate, automated interactions, handover interactions, cost saved, time saved) broken down by a new dimension (e.g., per flow, per skill, per channel).

## How to use this skill

Ask the user for the following information if not already provided:

1. **Table name** – e.g., `FlowsBreakdown` (PascalCase, used for component and hook names)
2. **Dimension name** – the API dimension key, e.g., `flowId`, `aiAgentSkill`, `channel`
3. **Entity source** – one of:
    - **Dynamic** – entities are fetched at runtime from an API (e.g., workflow configurations). Ask which query to use, e.g., `useGetWorkflowConfigurations()` / `fetchWorkflowConfigurations()` from `models/workflows/queries.ts`, and which field to use as the entity key (e.g., `id`, `internal_id`)
    - **Static** – a fixed list of known entity keys (e.g., `['cancel_order', 'return_item']`). Ask for the full list.
4. **Entity display names** – how to get human-readable labels:
    - For **dynamic** entities: which field on the fetched object holds the name (e.g., `name`)
    - For **static** entities: a `Record<EntityKey, string>` map, or `null` if raw keys should be displayed as-is
5. **Feature name column label** – e.g., `Flow name`, `Skill`, `Channel`
6. **Automation feature type filter** – the `AutomationFeatureType` enum value to filter by (from `domains/reporting/models/scopes/constants.ts`), or `null` if no feature filter is needed
7. **Handover metric** – which entity value(s) support handover counts (or `all` or `none`)
8. **Segment event name** – string for the download button's segment event, e.g., `ai-agent_overview_flows-breakdown-table`
9. **Dashboard section** – whether to add to the existing `breakdown` section or a new section in `defaultLayoutConfig.ts`

---

## Step-by-step implementation

### Step 1 – Add scope query factories

For each of the 5 standard metrics, add a new query factory to the relevant scope file in `apps/helpdesk/src/domains/reporting/models/scopes/`.

The 5 scope files and their corresponding query factory pattern (based on the `OrderManagement` example):

| Metric                  | Scope file                                                     | Existing example factory                                      |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| Overall automation rate | `overallAutomationRate.ts`                                     | `overallAutomationRatePerOrderManagementTypeQueryFactoryV2`   |
| Automated interactions  | `overallAutomatedInteractions.ts`                              | `automatedInteractionsPerOrderManagementTypeQueryFactoryV2`   |
| Handover interactions   | `handoverInteractions.ts` or a dedicated scope file            | `handoverInteractionsForReportOrderIssueQueryFactoryV2`       |
| Cost saved              | N/A – computed from automatedInteractions × costPerInteraction | —                                                             |
| Time saved              | `overallTimeSavedByAgent.ts`                                   | `overallTimeSavedByAgentPerOrderManagementTypeQueryFactoryV2` |

For each scope file, define a new metric using `.defineMetricName(METRIC_NAMES.<NEW_KEY>)` and `.defineQuery(...)` with:

- `dimensions: ['<dimensionName>']`
- `filters: [...createScopeFilters(ctx.filters, config), { member: 'automationFeatureType', operator: LogicalOperatorEnum.ONE_OF, values: [AutomationFeatureType.<FeatureType>] }]` (if a feature filter is needed)

Export both the metric object and a `...QueryFactoryV2 = (ctx: Context) => metric.build(ctx)` function.

**Cost saved** does not have its own scope – it reuses `automatedInteractions` and multiplies by `costSavedPerInteraction` using `mapMetricValues` (see `useCostSavedPerFlows.ts` for the pattern).

**Dedicated scope** (e.g., `flowDataset.ts`): if the dimension lives in its own Cube.js dataset rather than the standard automation scopes, create a new scope file following the `flowDataset.ts` pattern:

```typescript
const myScope = defineScope({
    scope: MetricScope.<ScopeName>,
    measures: [...],
    dimensions: [...],
    timeDimensions: [...],
    filters: [...],
    order: [...],
})
export const my<Metric>QueryFactoryV2 = (ctx: Context<typeof myScope.config>) =>
    myScope.defineMetricName(METRIC_NAMES.<KEY>).defineQuery(...).build(ctx)
```

### Step 2 – Add METRIC_NAMES entries

In `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`, add new `METRIC_NAMES` constant entries for each new query factory that needs one (automation rate, automated interactions, handover, time saved). Follow the existing `AI_AGENT_*_PER_ORDER_MANAGEMENT_TYPE` naming pattern.

If a new `MetricScope` enum value is needed (for a dedicated scope), add it there too and register the scope's metric names in the scope map.

### Step 3 – Create per-metric hooks

Create one file per metric in `apps/helpdesk/src/pages/aiAgent/analyticsOverview/hooks/`:

**Pattern for most metrics** (e.g., `useAutomationRatePer{TableName}.ts`):

```typescript
import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { <metricQueryFactoryV2> } from 'domains/reporting/models/scopes/<scopeFile>'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const use<Metric>Per<TableName> = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = <metricQueryFactoryV2>({ filters: statsFilters, timezone })
    return useStatsMetricPerDimension(query)
}

export const fetch<Metric>Per<TableName> = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = <metricQueryFactoryV2>({ filters: statsFilters, timezone })
    return fetchStatsMetricPerDimension(query)
}
```

**Pattern for cost saved** (reuses automated interactions + `mapMetricValues`):

```typescript
import {
    fetchStatsMetricPerDimension,
    mapMetricValues,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { <automatedInteractionsQueryFactoryV2> } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useCostSavedPer<TableName> = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = <automatedInteractionsQueryFactoryV2>({ filters: statsFilters, timezone })
    const metric = useStatsMetricPerDimension(query)
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(AGENT_COST_PER_TICKET)
    return mapMetricValues(metric, (v) => (v !== null ? v * costSavedPerInteraction : null))
}

export const fetchCostSavedPer<TableName> = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number = AGENT_COST_PER_TICKET,
) => {
    const query = <automatedInteractionsQueryFactoryV2>({ filters: statsFilters, timezone })
    const metric = await fetchStatsMetricPerDimension(query)
    return mapMetricValues(metric, (v) => (v !== null ? v * costSavedPerInteraction : null))
}
```

### Step 4 – Create the aggregator hook

Create `apps/helpdesk/src/pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics.ts`.

This file must export:

- `<TableName>EntityMetrics` row type with `entity: string` + the 5 metric fields
- `use<TableName>Metrics()` hook returning `{ data, isLoading, isError, loadingStates, displayNames }`
- `fetch<TableName>Metrics(statsFilters, timezone, costSavedPerInteraction?)` async function
- `fetch<TableName>Report: ReportFetch` adapter

Define:

- `build<TableName>Row` mapping entity keys to metric values
- `<TABLE_NAME>_METRICS_CONFIG: Record<MetricKeys, EntityMetricConfig>` with `{ use, fetch }` per metric
- `create<TableName>FetchConfig(costSavedPerInteraction: number)` factory that returns the config with `costSaved.fetch` bound to the given cost value
- `get<TableName>Entities` and `get<TableName>DisplayNames` helpers (see below)

#### Entity source variants

**Dynamic entities** (fetched from API at runtime, e.g., `useGetWorkflowConfigurations`):

```typescript
import {
    fetchWorkflowConfigurations,
    useGetWorkflowConfigurations,
} from 'models/workflows/queries'

type Workflow = { id: string; name: string }

const getEntities = (workflows: Workflow[]) => workflows.map((w) => w.id)
const getDisplayNames = (workflows: Workflow[]): Record<string, string> =>
    Object.fromEntries(workflows.map((w) => [w.id, w.name]))

export const use<TableName>Metrics = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data: workflows, isLoading: isLoadingWorkflows } =
        useGetWorkflowConfigurations()

    const entities = useMemo(() => getEntities(workflows ?? []), [workflows])
    const displayNames = useMemo(() => getDisplayNames(workflows ?? []), [workflows])

    const { data: entityData, isLoading: isLoadingMetrics, isError, loadingStates: entityLoadingStates } =
        useEntityMetrics(<TABLE_NAME>_METRICS_CONFIG, statsFilters, userTimezone)

    const isLoading = isLoadingWorkflows || isLoadingMetrics
    const data = useMemo(() => {
        const filteredEntities = filterEntitiesWithData(entities, entityData, isLoading)
        return assembleEntityRows(entityData, filteredEntities, build<TableName>Row(entityData), { skipEmptyCheck: isLoading })
    }, [entityData, entities, isLoading])
    // ... loadingStates mapping
    return { data, isLoading, isError, loadingStates, displayNames }
}

export const fetch<TableName>Metrics = async (
    statsFilters,
    timezone,
    costSavedPerInteraction = AGENT_COST_PER_TICKET,
) => {
    const workflows = await fetchWorkflowConfigurations()
    const entities = getEntities(workflows)
    const displayNames = getDisplayNames(workflows)

    const metrics = await fetchEntityMetrics(
        create<TableName>FetchConfig(costSavedPerInteraction),
        { period: statsFilters.period },
        timezone,
    )
    const data = assembleEntityRows(
        metrics.data,
        filterEntitiesWithData(entities, metrics.data, false),
        build<TableName>Row(metrics.data),
    )
    // ... CSV build using displayNames
    return { fileName, files }
}
```

**Static entities** (fixed list known at compile time, e.g., `OrderManagement`):

```typescript
export type <TableName>EntityName = 'entity_a' | 'entity_b' | 'entity_c'
export const <TABLE_NAME>_ENTITIES: <TableName>EntityName[] = ['entity_a', 'entity_b', 'entity_c']

export const use<TableName>Metrics = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()
    const { data: entityData, isLoading, isError, loadingStates: entityLoadingStates } =
        useEntityMetrics(<TABLE_NAME>_METRICS_CONFIG, statsFilters, userTimezone)

    const data = useMemo(() => {
        const filteredEntities = filterEntitiesWithData(<TABLE_NAME>_ENTITIES, entityData, isLoading)
        return assembleEntityRows(entityData, filteredEntities, build<TableName>Row(entityData), { skipEmptyCheck: isLoading })
    }, [entityData, isLoading])
    // ... loadingStates mapping
    return { data, isLoading, isError, loadingStates }
    // Note: no displayNames returned — handled via static ENTITY_DISPLAY_NAMES in columns.tsx
}

export const fetch<TableName>Metrics = async (
    statsFilters,
    timezone,
    costSavedPerInteraction = AGENT_COST_PER_TICKET,
) => {
    const metrics = await fetchEntityMetrics(
        create<TableName>FetchConfig(costSavedPerInteraction),
        { period: statsFilters.period },
        timezone,
    )
    const data = assembleEntityRows(
        metrics.data,
        filterEntitiesWithData(<TABLE_NAME>_ENTITIES, metrics.data, false),
        build<TableName>Row(metrics.data),
    )
    // ... CSV build
    return { fileName, files }
}
```

#### `create<TableName>FetchConfig` factory (both variants)

Always define this to bind `costSavedPerInteraction` into the fetch config without inline spreads at the call site:

```typescript
function create<TableName>FetchConfig(
    costSavedPerInteraction: number,
): Record<<TableName>MetricKeys, EntityMetricConfig> {
    return {
        ...<TABLE_NAME>_METRICS_CONFIG,
        costSaved: {
            ...<TABLE_NAME>_METRICS_CONFIG.costSaved,
            fetch: (filters, tz) =>
                fetchCostSavedPer<TableName>(filters, tz, costSavedPerInteraction),
        },
    }
}
```

#### CSV filename

Derive the filename from `<TABLE_NAME>_TABLE.title` — do not hardcode a string:

```typescript
const <TABLE_NAME>_FILENAME = `${<TABLE_NAME>_TABLE.title.toLowerCase().replace(/\s+/g, '_')}_table`
```

For example, a title of `'Flows breakdown'` produces `'flows_breakdown_table'`.

#### CSV header

Use `<TABLE_NAME>_TABLE.title` as the first CSV column header — do not hardcode a string:

```typescript
const headers = [<TABLE_NAME>_TABLE.title, ...<TABLE_NAME>_COLUMNS.map((col) => col.label)]
```

### Step 5 – Create the download hook

Create `apps/helpdesk/src/pages/aiAgent/analyticsOverview/hooks/useDownload<TableName>Data.ts`:

```typescript
import { useEffect, useState } from 'react'

import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetch<TableName>Metrics } from 'pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useDownload<TableName>Data = () => {
    const { cleanStatsFilters, userTimezone } = useStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(AGENT_COST_PER_TICKET)

    const [result, setResult] = useState<{ fileName: string; files: Record<string, string> }>()
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        setIsLoading(true)
        fetch<TableName>Metrics({ period: cleanStatsFilters.period }, userTimezone, costSavedPerInteraction)
            .then(({ fileName, files }) => {
                setResult({ fileName, files })
                setIsLoading(false)
            })
    }, [cleanStatsFilters, userTimezone, costSavedPerInteraction])

    return { files: result?.files ?? {}, fileName: result?.fileName ?? '', isLoading }
}
```

### Step 6 – Create the component files

Create the directory `apps/helpdesk/src/pages/aiAgent/analyticsOverview/components/<TableName>Table/`.

#### `columns.tsx`

```typescript
import type { MetricColumnConfig } from '@repo/reporting'

import { STANDARD_METRIC_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'

// Only export ENTITY_DISPLAY_NAMES for static-entity tables
// For dynamic-entity tables, omit this — displayNames come from the hook
export const ENTITY_DISPLAY_NAMES: Record<<TableName>EntityName, string> = {
    // fill in display names
}

export const <TABLE_NAME>_TABLE = {
    title: '<Human-readable Table Title>',
    description: '<Description for CSV export and report config>',
}

export const <TABLE_NAME>_COLUMNS: MetricColumnConfig[] = STANDARD_METRIC_COLUMNS
```

#### `<TableName>Table.tsx`

**Dynamic entities** – `displayNames` comes from the hook:

```typescript
import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { <TABLE_NAME>_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/columns'
import { Download<TableName>Button } from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/Download<TableName>Button'
import { use<TableName>Metrics } from 'pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics'

export const <TableName>Table = () => {
    const { data = [], loadingStates, displayNames } = use<TableName>Metrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={<TABLE_NAME>_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<Download<TableName>Button />}
            nameColumn={{
                accessor: 'entity',
                label: '<Feature name label>',
                displayNames,
            }}
        />
    )
}
```

**Static entities** – `ENTITY_DISPLAY_NAMES` is imported from `columns.tsx`:

```typescript
export const <TableName>Table = () => {
    const { data = [], loadingStates } = use<TableName>Metrics()

    return (
        <ReportingMetricBreakdownTable
            data={data}
            metricColumns={<TABLE_NAME>_COLUMNS}
            loadingStates={loadingStates}
            getRowKey={(row) => row.entity}
            DownloadButton={<Download<TableName>Button />}
            nameColumn={{
                accessor: 'entity',
                label: '<Feature name label>',
                displayNames: ENTITY_DISPLAY_NAMES,
            }}
        />
    )
}
```

#### `tests/columns.spec.tsx`

```typescript
import { <TABLE_NAME>_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/columns'

describe('<TABLE_NAME>_COLUMNS', () => {
    it('has 5 entries', () => {
        expect(<TABLE_NAME>_COLUMNS).toHaveLength(5)
    })

    it('has the correct accessorKeys in order', () => {
        expect(<TABLE_NAME>_COLUMNS.map((col) => col.accessorKey)).toEqual([
            'automationRate',
            'automatedInteractions',
            'handoverInteractions',
            'costSaved',
            'timeSaved',
        ])
    })
})

// Only for static-entity tables with ENTITY_DISPLAY_NAMES
describe('ENTITY_DISPLAY_NAMES', () => {
    it('has a display name for every entity key', () => {
        expect(Object.keys(ENTITY_DISPLAY_NAMES)).toEqual([/* list all keys in order */])
    })

    it('has non-empty display names for all entities', () => {
        Object.values(ENTITY_DISPLAY_NAMES).forEach((name) => {
            expect(name.length).toBeGreaterThan(0)
        })
    })
})
```

#### `tests/<TableName>Table.spec.tsx`

**Dynamic entities** – mock hook returns `displayNames`:

```typescript
const mockUse<TableName>Metrics = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics',
).use<TableName>Metrics as jest.Mock

// In beforeEach / renderComponent:
mockUse<TableName>Metrics.mockReturnValue({ data, loadingStates, displayNames: {} })

// Test displayNames is forwarded dynamically:
it('passes displayNames from the hook to nameColumn', () => {
    const displayNames = { 'uuid-1': 'Flow A' }
    mockUse<TableName>Metrics.mockReturnValue({ data: defaultData, loadingStates: defaultLoadingStates, displayNames })
    renderComponent()
    expect(getLastCallProps().nameColumn.displayNames).toBe(displayNames)
})
```

**Static entities** – `ENTITY_DISPLAY_NAMES` imported from columns, hook does not return `displayNames`:

```typescript
it('passes nameColumn with entity accessor, correct label, and ENTITY_DISPLAY_NAMES', () => {
    renderComponent()
    expect(getLastCallProps().nameColumn).toEqual({
        accessor: 'entity',
        label: '<Feature name label>',
        displayNames: ENTITY_DISPLAY_NAMES,
    })
})
```

#### `Download<TableName>Button.tsx`

```typescript
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownload<TableName>Data } from 'pages/aiAgent/analyticsOverview/hooks/useDownload<TableName>Data'

export const Download<TableName>Button = () => {
    const { files, fileName, isLoading } = useDownload<TableName>Data()
    return (
        <DownloadTableButton
            files={files}
            fileName={fileName}
            isLoading={isLoading}
            segmentEventName="<segment-event-name>"
        />
    )
}
```

#### `tests/Download<TableName>Button.spec.tsx`

```typescript
import { render } from '@testing-library/react'

import { Download<TableName>Button } from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/Download<TableName>Button'

const mockDownloadTableButton = jest.fn((_) => null)

jest.mock(
    'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton',
    () => ({
        DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
    }),
)

jest.mock('pages/aiAgent/analyticsOverview/hooks/useDownload<TableName>Data')

const mockUseDownload<TableName>Data = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownload<TableName>Data',
).useDownload<TableName>Data as jest.Mock

const mockFiles = { 'report.csv': '"Entity"\r\n"value_a"' }
// filename is derived from <TABLE_NAME>_TABLE.title: e.g. 'flows_breakdown_table'
const mockFileName = '2024-01-01_2024-01-31-<table_name_table>.csv'

beforeEach(() => {
    mockUseDownload<TableName>Data.mockReturnValue({
        files: mockFiles,
        fileName: mockFileName,
        isLoading: false,
    })
})

describe('Download<TableName>Button', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes files and fileName from the hook to DownloadTableButton', () => {
        render(<Download<TableName>Button />)
        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ files: mockFiles, fileName: mockFileName }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownload<TableName>Data.mockReturnValue({ files: {}, fileName: mockFileName, isLoading: true })
        render(<Download<TableName>Button />)
        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<Download<TableName>Button />)
        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ segmentEventName: '<segment-event-name>' }),
        )
    })
})
```

### Step 7 – Register in the report config

In `apps/helpdesk/src/pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig.ts`:

1. Add a new enum value to `AnalyticsOverviewChart`:

    ```typescript
    <TableName>Table = '<snake_case_table_id>',
    ```

2. Import the table component and its constants directly from the component file (not from an index barrel):

    ```typescript
    import { <TableName>Table, <TABLE_NAME>_TABLE } from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/<TableName>Table'
    ```

3. Add a config entry in `AnalyticsOverviewReportConfig.charts`:
    ```typescript
    [AnalyticsOverviewChart.<TableName>Table]: {
        chartComponent: <TableName>Table,
        label: <TABLE_NAME>_TABLE.title,
        csvProducer: [{ type: DataExportFormat.Table, fetch: fetch<TableName>Report }],
        description: <TABLE_NAME>_TABLE.description,
        chartType: ChartType.Table,
    },
    ```

### Step 8 – Add to layout config

In `apps/helpdesk/src/pages/aiAgent/analyticsOverview/config/defaultLayoutConfig.ts`, add the new table item to the appropriate section (typically `breakdown`):

```typescript
{
    chartId: AnalyticsOverviewChart.<TableName>Table,
    gridSize: 12,
    visibility: true,
},
```

---

## Verification checklist

After implementing, run these commands from the repo root:

```bash
pnpm lint @repo/helpdesk
pnpm format:fix @repo/helpdesk
pnpm typecheck @repo/helpdesk
pnpm test @repo/helpdesk "<TableName>"
```

Ensure:

- [ ] Lint passes with no errors
- [ ] Formatting is clean
- [ ] Typecheck passes with no errors
- [ ] Unit tests pass for all new files
- [ ] The table renders in the dashboard with correct column headers
- [ ] The download button produces a valid CSV with correct column labels
- [ ] Handover counts appear only for the expected entity rows

---

## Key shared infrastructure (do not duplicate)

| What                     | Location                                                                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic table shell      | `@repo/reporting` → `ReportingMetricBreakdownTable`                                                                                                                                                       |
| Column builder helpers   | `@repo/reporting` → `buildMetricColumnDefs` (used internally by `ReportingMetricBreakdownTable`)                                                                                                          |
| Types                    | `@repo/reporting` → `MetricColumnConfig`, `MetricLoadingStates`, `NameColumnConfig`                                                                                                                       |
| Generic download button  | `components/shared/DownloadTableButton.tsx`                                                                                                                                                               |
| Standard 5-column config | `components/shared/metricColumns.tsx` → `STANDARD_METRIC_COLUMNS`                                                                                                                                         |
| Dimension data fetching  | `domains/reporting/hooks/useStatsMetricPerDimension.ts` → `useStatsMetricPerDimension`, `fetchStatsMetricPerDimension`, `useEntityMetrics`, `fetchEntityMetrics`, `assembleEntityRows`, `mapMetricValues` |
| Cost transform helper    | `mapMetricValues` from `useStatsMetricPerDimension.ts`                                                                                                                                                    |
| Row assembly             | `assembleEntityRows` from `useStatsMetricPerDimension.ts`                                                                                                                                                 |
| Entity filtering         | `filterEntitiesWithData` from `useStatsMetricPerDimension.ts` — filters to entities with at least one non-null, non-NaN value; returns all entities while loading                                        |
| Workflow configurations  | `models/workflows/queries.ts` → `useGetWorkflowConfigurations`, `fetchWorkflowConfigurations`                                                                                                             |
