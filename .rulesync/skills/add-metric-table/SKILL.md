---
name: add-metric-table
description: Add a new analytics metric breakdown table to the AI Agent Analytics Overview dashboard. Scaffolds scope queries, per-metric hooks, aggregator hook, download hook, component files, report config entry, and layout config entry.
---

# Add Metric Breakdown Table

Create a new analytics breakdown table for the AI Agent Analytics Overview dashboard. The table shows the standard 5 metrics (overall automation rate, automated interactions, handover interactions, cost saved, time saved) broken down by a new dimension (e.g., per skill, per channel, per integration).

## How to use this skill

Ask the user for the following information if not already provided:

1. **Table name** – e.g., `SkillBreakdown` (PascalCase, used for component and hook names)
2. **Dimension name** – the API dimension key, e.g., `aiAgentSkill`, `channel`
3. **Entities** – the list of dimension values to show rows for, e.g., `['skill_a', 'skill_b']`
4. **Entity display names** – human-readable labels for each entity value (or `null` if display names are not needed and raw values should be used)
5. **Feature name column label** – e.g., `Skill name`, `Channel`
6. **Automation feature type filter** – the `AutomationFeatureType` enum value to filter by (from `domains/reporting/models/scopes/constants.ts`), or `null` if no feature filter is needed
7. **Handover metric** – which entity value(s) support handover counts (or `all` or `none`)
8. **CSV filename** – kebab-case base name for the downloaded CSV, e.g., `skill-breakdown`
9. **Segment event name** – string for the download button's segment event, e.g., `ai-agent_overview_skill-breakdown-table`
10. **Dashboard section** – whether to add to the existing `breakdown` section or a new section in `defaultLayoutConfig.ts`

---

## Step-by-step implementation

### Step 1 – Add scope query factories

For each of the 5 standard metrics, add a new query factory to the relevant scope file in `apps/helpdesk/src/domains/reporting/models/scopes/`.

The 5 scope files and their corresponding query factory pattern (based on the `OrderManagement` example):

| Metric                  | Scope file                                                     | Existing example factory                                      |
| ----------------------- | -------------------------------------------------------------- | ------------------------------------------------------------- |
| Overall automation rate | `overallAutomationRate.ts`                                     | `overallAutomationRatePerOrderManagementTypeQueryFactoryV2`   |
| Automated interactions  | `overallAutomatedInteractions.ts`                              | `automatedInteractionsPerOrderManagementTypeQueryFactoryV2`   |
| Handover interactions   | `handoverInteractions.ts`                                      | `handoverInteractionsForReportOrderIssueQueryFactoryV2`       |
| Cost saved              | N/A – computed from automatedInteractions × costPerInteraction | —                                                             |
| Time saved              | `overallTimeSavedByAgent.ts`                                   | `overallTimeSavedByAgentPerOrderManagementTypeQueryFactoryV2` |

For each scope file, define a new metric using `.defineMetricName(METRIC_NAMES.<NEW_KEY>)` and `.defineQuery(...)` with:

- `dimensions: ['<dimensionName>']`
- `filters: [...createScopeFilters(ctx.filters, config), { member: 'automationFeatureType', operator: LogicalOperatorEnum.ONE_OF, values: [AutomationFeatureType.<FeatureType>] }]` (if a feature filter is needed)

Export both the metric object and a `...QueryFactoryV2 = (ctx: Context) => metric.build(ctx)` function.

**Cost saved** does not have its own scope – it reuses `automatedInteractions` and multiplies by `costSavedPerInteraction` using `mapMetricValues` (see `useCostSavedPerOrderManagementType.ts` for the pattern).

### Step 2 – Add METRIC_NAMES entries

In `apps/helpdesk/src/domains/reporting/hooks/metricNames.ts`, add new `METRIC_NAMES` constant entries for each new query factory that needs one (automation rate, automated interactions, handover, time saved). Follow the existing `AI_AGENT_*_PER_ORDER_MANAGEMENT_TYPE` naming pattern.

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
    costSavedPerInteraction: number,
) => {
    const query = <automatedInteractionsQueryFactoryV2>({ filters: statsFilters, timezone })
    const metric = useStatsMetricPerDimension(query)
    return mapMetricValues(metric, (v) => (v !== null ? v * costSavedPerInteraction : null))
}

export const fetchCostSavedPer<TableName> = async (
    statsFilters: StatsFilters,
    timezone: string,
    costSavedPerInteraction: number,
) => {
    const query = <automatedInteractionsQueryFactoryV2>({ filters: statsFilters, timezone })
    const metric = await fetchStatsMetricPerDimension(query)
    return mapMetricValues(metric, (v) => (v !== null ? v * costSavedPerInteraction : null))
}
```

### Step 4 – Create the aggregator hook

Create `apps/helpdesk/src/pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics.ts`.

This file must export:

- `<TableName>EntityName` type union of entity keys
- `<TableName>Entities` array of all entity keys
- `<TableName>EntityMetrics` row type with `entity` + the 5 metric fields
- `use<TableName>Metrics()` hook returning `{ data, isLoading, isError, loadingStates }`
- `fetch<TableName>Metrics(statsFilters, timezone, costSavedPerInteraction?)` async function
- `fetch<TableName>Report: ReportFetch` adapter

Follow `useOrderManagementMetrics.ts` exactly:

- Define `build<TableName>Row` that maps entity keys to metric values (set `handoverInteractions` to `null` for entities that don't support it)
- Define `<TABLE_NAME>_METRICS_CONFIG: Record<MetricKeys, EntityMetricConfig>` with `{ use, fetch }` per metric
- Use `useEntityMetrics` + `assembleEntityRows` in the hook
- Use `fetchEntityMetrics` + `assembleEntityRows` in the fetch function
- Build CSV using `<TABLE_NAME>_COLUMNS` labels and `formatMetricValue`

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

Exports only constants, no column builder functions:

```typescript
import type { MetricColumnConfig } from '@repo/reporting'

import { STANDARD_METRIC_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'
import type { <TableName>EntityName } from 'pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics'

// Only include ENTITY_DISPLAY_NAMES if entity values need human-readable labels
export const ENTITY_DISPLAY_NAMES: Record<<TableName>EntityName, string> = {
    // fill in display names
}

export const <TABLE_NAME>_TABLE = {
    title: '<Human-readable Table Title>',
    description: '<Description for CSV export and report config>',
}

export const <TABLE_NAME>_COLUMNS: MetricColumnConfig[] = STANDARD_METRIC_COLUMNS
```

#### `tests/columns.spec.tsx`

```typescript
import {
    ENTITY_DISPLAY_NAMES,
    <TABLE_NAME>_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/columns'

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

// Only if ENTITY_DISPLAY_NAMES is defined
describe('ENTITY_DISPLAY_NAMES', () => {
    it('has a display name for every entity key', () => {
        expect(Object.keys(ENTITY_DISPLAY_NAMES)).toEqual([
            // list all entity keys in order
        ])
    })

    it('has non-empty display names for all entities', () => {
        Object.values(ENTITY_DISPLAY_NAMES).forEach((name) => {
            expect(name.length).toBeGreaterThan(0)
        })
    })
})
```

#### `<TableName>Table.tsx`

Passes props directly to `ReportingMetricBreakdownTable`, no `useMemo`:

```typescript
import { ReportingMetricBreakdownTable } from '@repo/reporting'

import {
    ENTITY_DISPLAY_NAMES,
    <TABLE_NAME>_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/columns'
import { Download<TableName>Button } from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/Download<TableName>Button'
import { use<TableName>Metrics } from 'pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics'

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
                displayNames: ENTITY_DISPLAY_NAMES, // omit this line if no display names needed
            }}
        />
    )
}
```

#### `tests/<TableName>Table.spec.tsx`

```typescript
import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import {
    ENTITY_DISPLAY_NAMES,
    <TABLE_NAME>_COLUMNS,
} from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/columns'
import { <TableName>Table } from 'pages/aiAgent/analyticsOverview/components/<TableName>Table/<TableName>Table'
import type { <TableName>EntityMetrics } from 'pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsOverview/components/<TableName>Table/Download<TableName>Button',
    () => ({
        Download<TableName>Button: () => <div>Download <TableName></div>,
    }),
)

jest.mock('pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics')

const mockUse<TableName>Metrics = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/use<TableName>Metrics',
).use<TableName>Metrics as jest.Mock

const defaultLoadingStates: MetricLoadingStates = {
    automationRate: false,
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
}

const defaultData: <TableName>EntityMetrics[] = [
    // fill in sample rows
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUse<TableName>Metrics.mockReturnValue({ data, loadingStates })
    return render(<<TableName>Table />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: <TableName>EntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: <TableName>EntityMetrics) => string
        DownloadButton: React.ReactNode
        nameColumn: {
            accessor: string
            label: string
            displayNames?: Record<string, string>
        }
    }

describe('<TableName>Table', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from use<TableName>Metrics to ReportingMetricBreakdownTable', () => {
        renderComponent()
        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()
        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes <TABLE_NAME>_COLUMNS as metricColumns', () => {
        renderComponent()
        expect(getLastCallProps().metricColumns).toBe(<TABLE_NAME>_COLUMNS)
    })

    it('passes getRowKey that returns the entity value', () => {
        renderComponent()
        const { getRowKey } = getLastCallProps()
        expect(getRowKey(defaultData[0])).toBe(defaultData[0].entity)
    })

    it('passes nameColumn with entity accessor, correct label, and ENTITY_DISPLAY_NAMES', () => {
        renderComponent()
        expect(getLastCallProps().nameColumn).toEqual({
            accessor: 'entity',
            label: '<Feature name label>',
            displayNames: ENTITY_DISPLAY_NAMES, // omit if no display names
        })
    })

    it('renders Download<TableName>Button as the DownloadButton', () => {
        renderComponent()
        expect(screen.getByText('Download <TableName>')).toBeInTheDocument()
    })
})
```

#### `Download<TableName>Button.tsx`

Thin wrapper around `DownloadTableButton`:

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

jest.mock(
    'pages/aiAgent/analyticsOverview/hooks/useDownload<TableName>Data',
)

const mockUseDownload<TableName>Data = jest.requireMock(
    'pages/aiAgent/analyticsOverview/hooks/useDownload<TableName>Data',
).useDownload<TableName>Data as jest.Mock

const mockFiles = { 'report.csv': '"Entity"\r\n"value_a"' }
const mockFileName = '2024-01-01_2024-01-31-<csv-filename>.csv'

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
            expect.objectContaining({
                files: mockFiles,
                fileName: mockFileName,
            }),
        )
    })

    it('passes isLoading from the hook to DownloadTableButton', () => {
        mockUseDownload<TableName>Data.mockReturnValue({
            files: {},
            fileName: mockFileName,
            isLoading: true,
        })

        render(<Download<TableName>Button />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({ isLoading: true }),
        )
    })

    it('passes the correct segmentEventName to DownloadTableButton', () => {
        render(<Download<TableName>Button />)

        expect(mockDownloadTableButton).toHaveBeenCalledWith(
            expect.objectContaining({
                segmentEventName: '<segment-event-name>',
            }),
        )
    })
})
```

#### `index.ts`

```typescript
export { <TableName>Table } from './<TableName>Table'
```

### Step 7 – Register in the report config

In `apps/helpdesk/src/pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig.ts`:

1. Add a new enum value to `AnalyticsOverviewChart`:

    ```typescript
    <TableName>Table = '<snake_case_table_id>',
    ```

2. Add an import for the table component and its constants.

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
