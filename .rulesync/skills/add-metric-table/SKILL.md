---
name: add-metric-table
description: Add a new analytics metric breakdown table to the AI Agent Analytics dashboard (analyticsOverview or analyticsAiAgent). Scaffolds scope queries, per-metric hooks, aggregator hook, download hook, component files, and wires up CSV export and layout registration.
---

# Add Metric Breakdown Table

Create a new analytics breakdown table that uses `ReportingMetricBreakdownTable` from `@repo/reporting`. The table shows metrics broken down by a new dimension (e.g., per skill, per channel, per integration).

## How to use this skill

Ask the user for the following information if not already provided:

1. **Table name** – e.g., `SkillBreakdown` (PascalCase, used for component and hook names)
2. **Dashboard section** – `analyticsOverview` or `analyticsAiAgent` (determines paths, column config, and CSV export registration target)
3. **Dimension name** – the API dimension key, e.g., `aiAgentSkill`, `channel`
4. **Entities** – the list of dimension values to show rows for, e.g., `['skill_a', 'skill_b']`
5. **Name formatter** – how to display entity values: `displayNames` static record, `formatName` function (when a shared `formatXxxName` already exists), or `none` (show raw values)
6. **Feature name column label** – e.g., `Skill name`, `Channel`
7. **Automation feature type filter** – the `AutomationFeatureType` enum value to filter by (from `domains/reporting/models/scopes/constants.ts`), or `null` if no feature filter is needed
8. **Handover metric** – which entity value(s) support handover counts (or `all` or `none`)
9. **CSV filename** – kebab-case base name for the downloaded CSV, e.g., `skill-breakdown`
10. **Segment event name** – string for the download button's segment event, e.g., `ai-agent_all-agents_skill-breakdown-table`
11. **Legacy table** (`analyticsAiAgent` only) – the existing table component this replaces, for the feature flag wrapper
12. **Dashboard section / layout** (`analyticsOverview` only) – whether to add to the existing `breakdown` section or a new section in `defaultLayoutConfig.ts`

---

## Path reference

All paths below use `<section>` = `analyticsOverview` or `analyticsAiAgent`.

| Artefact                | `analyticsOverview`                                                                | `analyticsAiAgent`                                            |
| ----------------------- | ---------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| Component dir           | `pages/aiAgent/analyticsOverview/components/<TableName>Table/`                     | `pages/aiAgent/analyticsAiAgent/components/<TableName>Table/` |
| Hook dir                | `pages/aiAgent/analyticsOverview/hooks/`                                           | `pages/aiAgent/analyticsAiAgent/hooks/`                       |
| Shared download button  | `analyticsOverview/components/shared/DownloadTableButton`                          | same                                                          |
| Column base             | `STANDARD_METRIC_COLUMNS` from `analyticsOverview/components/shared/metricColumns` | custom per-table columns (no shared base)                     |
| CSV export registration | `AnalyticsOverviewReportConfig.ts` + `defaultLayoutConfig.ts`                      | `useExportAiAgentAllAgentsToCSV.ts`                           |

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

Create one file per metric in the hooks directory for your section.

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

Create `use<TableName>Metrics.ts` in the hooks directory.

This file must export:

- `<TableName>EntityName` type union of entity keys
- `<TableName>Entities` array of all entity keys
- `<TableName>EntityMetrics` row type with `entity` + the metric fields
- `use<TableName>Metrics()` hook returning `{ data, isLoading, isError, loadingStates }`
- `fetch<TableName>Metrics(statsFilters, timezone, costSavedPerInteraction?)` async function — **also builds the CSV** (fileName + files)
- `fetch<TableName>Report: ReportFetch` adapter (`analyticsOverview` only)

Follow `useOrderManagementMetrics.ts` (for `analyticsOverview`) or `useAllAgentsPerformanceByChannelMetrics.ts` (for `analyticsAiAgent`):

- Define `build<TableName>Row` that maps entity keys to metric values
- Define `<TABLE_NAME>_METRICS_CONFIG: Record<MetricKeys, EntityMetricConfig>` with `{ use, fetch }` per metric
- Use `useEntityMetrics` + `assembleEntityRows` in the hook
- Use `fetchEntityMetrics` + `assembleEntityRows` in the fetch function
- Build CSV using `<TABLE_NAME>_COLUMNS` labels and `formatMetricValue`

### Step 5 – Create the download hook

**`analyticsOverview` pattern** — plain fetch, no error handling needed:

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

**`analyticsAiAgent` pattern** — adds `reportError` on failure:

```typescript
import { useEffect, useState } from 'react'

import { reportError } from '@repo/logging'

import { SentryTeam } from 'common/const/sentryTeamNames'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import { fetch<TableName>Metrics } from 'pages/aiAgent/analyticsAiAgent/hooks/use<TableName>Metrics'
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
            .catch((error) => {
                reportError(error, { tags: { team: SentryTeam.CRM_REPORTING } })
                setIsLoading(false)
            })
    }, [cleanStatsFilters, userTimezone, costSavedPerInteraction])

    return { files: result?.files ?? {}, fileName: result?.fileName ?? '', isLoading }
}
```

### Step 6 – Create the component files

**`columns.tsx`** – exports only constants, no column builder functions:

```typescript
import type { MetricColumnConfig } from '@repo/reporting'

// analyticsOverview: reuse shared standard columns
import { STANDARD_METRIC_COLUMNS } from 'pages/aiAgent/analyticsOverview/components/shared/metricColumns'

// analyticsAiAgent: define custom columns (example – adjust per table)
// export const <TABLE_NAME>_COLUMNS: MetricColumnConfig[] = [ ... ]

// Only include ENTITY_DISPLAY_NAMES if using the displayNames formatter
export const ENTITY_DISPLAY_NAMES: Record<<TableName>EntityName, string> = {
    // fill in display names
}

export const <TABLE_NAME>_TABLE = {
    title: '<Human-readable Table Title>',
    description: '<Description for CSV export and report config>',
}

export const <TABLE_NAME>_COLUMNS: MetricColumnConfig[] = STANDARD_METRIC_COLUMNS
```

**`<TableName>Table.tsx`** – passes props directly to `ReportingMetricBreakdownTable`, no `useMemo`.

Choose the `nameColumn` variant that fits:

```typescript
import { ReportingMetricBreakdownTable } from '@repo/reporting'

import { <TABLE_NAME>_COLUMNS } from '.../columns'
import { Download<TableName>Button } from '.../Download<TableName>Button'
import { use<TableName>Metrics } from '.../use<TableName>Metrics'

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
                // Option A – static map (import ENTITY_DISPLAY_NAMES from columns):
                displayNames: ENTITY_DISPLAY_NAMES,
                // Option B – function (import formatXxxName from utils):
                // formatName: formatXxxName,
                // Option C – neither (omit both to show raw values)
            }}
        />
    )
}
```

**`Download<TableName>Button.tsx`** – thin wrapper around `DownloadTableButton`:

```typescript
import { DownloadTableButton } from 'pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton'
import { useDownload<TableName>Data } from '.../useDownload<TableName>Data'

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

**`index.ts`**:

```typescript
export { <TableName>Table } from './<TableName>Table'
```

### Step 7a – Register in CSV export (`analyticsAiAgent` only)

In `useExportAiAgentAllAgentsToCSV.ts`, call **both** hooks unconditionally (React rules of hooks), then select by flag:

```typescript
const isAnalyticsDashboardsTablesEnabled = useFlag(
    FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
)

// Both hooks must be called unconditionally:
const allAgents<Name>Data = useDownload<TableName>Data()
const legacy<Name>Data = useLegacyDownload<TableName>Data()
const <name>Data = isAnalyticsDashboardsTablesEnabled
    ? allAgents<Name>Data
    : legacy<Name>Data
```

Include `<name>Data.isLoading` in the combined `isLoading` and spread `<name>Data.files` in the `files` memo.

### Step 7b – Create feature flag wrapper (`analyticsAiAgent` only)

When the new table replaces an existing legacy table behind a flag:

```typescript
import { FeatureFlagKey, useFlagWithLoading } from '@repo/feature-flags'

import { <TableName>Table } from './<TableName>Table'
import { Legacy<TableName>Table } from '../AiAgentPerformanceBreakdownTable/Legacy<TableName>Table'

export const <TableName>TableWrapper = () => {
    const { value: isNewTableEnabled, isLoading } = useFlagWithLoading(
        FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
    )
    if (!isLoading && isNewTableEnabled) return <<TableName>Table />
    return <Legacy<TableName>Table />
}
```

### Step 8 – Register in report config and layout (`analyticsOverview` only)

In `AnalyticsOverviewReportConfig.ts`:

1. Add a new enum value to `AnalyticsOverviewChart`:

    ```typescript
    <TableName>Table = '<snake_case_table_id>',
    ```

2. Add a config entry in `AnalyticsOverviewReportConfig.charts`:
    ```typescript
    [AnalyticsOverviewChart.<TableName>Table]: {
        chartComponent: <TableName>Table,
        label: <TABLE_NAME>_TABLE.title,
        csvProducer: [{ type: DataExportFormat.Table, fetch: fetch<TableName>Report }],
        description: <TABLE_NAME>_TABLE.description,
        chartType: ChartType.Table,
    },
    ```

In `defaultLayoutConfig.ts`, add the table to the appropriate section:

```typescript
{
    chartId: AnalyticsOverviewChart.<TableName>Table,
    gridSize: 12,
    visibility: true,
},
```

---

## Test patterns

### `tests/columns.spec.tsx` – test constants directly

```typescript
import { ALL_AGENTS_PERFORMANCE_BY_<NAME>_COLUMNS } from '.../columns'

describe('<TABLE_NAME>_COLUMNS', () => {
    it('has N entries', () => {
        expect(<TABLE_NAME>_COLUMNS).toHaveLength(N)
    })

    it('has the correct accessorKeys in order', () => {
        expect(<TABLE_NAME>_COLUMNS.map((col) => col.accessorKey)).toEqual([
            'automatedInteractions',
            'handoverInteractions',
            // ... etc
        ])
    })
})
```

### `tests/<TableName>Table.spec.tsx` – mock `@repo/reporting`, assert props

```typescript
import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { <TABLE_NAME>_COLUMNS } from '.../columns'
import { <TableName>Table } from './<TableName>Table'
import type { <TableName>EntityMetrics } from '.../use<TableName>Metrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock('.../Download<TableName>Button', () => ({
    Download<TableName>Button: () => <div>Download <TableName></div>,
}))

jest.mock('.../use<TableName>Metrics')

const mockUse<TableName>Metrics = jest.requireMock(
    '.../use<TableName>Metrics',
).use<TableName>Metrics as jest.Mock

// ... defaultLoadingStates, defaultData, renderComponent setup ...

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
            formatName?: (value: string) => string
        }
    }

describe('<TableName>Table', () => {
    afterEach(() => { jest.clearAllMocks() })

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

    // Option A – displayNames
    it('passes nameColumn with entity accessor, correct label, and ENTITY_DISPLAY_NAMES', () => {
        renderComponent()
        expect(getLastCallProps().nameColumn).toEqual({
            accessor: 'entity',
            label: '<Feature name label>',
            displayNames: ENTITY_DISPLAY_NAMES,
        })
    })

    // Option B – formatName function
    it('passes nameColumn with entity accessor, correct label, and formatXxxName', () => {
        renderComponent()
        const { nameColumn } = getLastCallProps()
        expect(nameColumn.accessor).toBe('entity')
        expect(nameColumn.label).toBe('<Feature name label>')
        expect(nameColumn.formatName).toBe(formatXxxName)
    })

    it('renders Download<TableName>Button as the DownloadButton', () => {
        renderComponent()
        expect(screen.getByText('Download <TableName>')).toBeInTheDocument()
    })
})
```

### `tests/Download<TableName>Button.spec.tsx` – mock `DownloadTableButton`, assert props

```typescript
import { render } from '@testing-library/react'

import { Download<TableName>Button } from '.../Download<TableName>Button'

const mockDownloadTableButton = jest.fn((_) => null)

jest.mock('pages/aiAgent/analyticsOverview/components/shared/DownloadTableButton', () => ({
    DownloadTableButton: (props: unknown) => mockDownloadTableButton(props),
}))

jest.mock('.../useDownload<TableName>Data')

const mockUseDownload<TableName>Data = jest.requireMock(
    '.../useDownload<TableName>Data',
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
    afterEach(() => { jest.clearAllMocks() })

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

### `useExportAiAgentAllAgentsToCSV.spec.ts` additions (`analyticsAiAgent` only)

When adding a new download hook to `useExportAiAgentAllAgentsToCSV`:

1. Add `jest.mock` and `jest.mocked` for both the new and legacy download hooks
2. Add default mock return values in `beforeEach` for both
3. Add a `describe` block for flag-switching behaviour:

```typescript
describe('<name> data based on AiAgentAnalyticsDashboardsTables flag', () => {
    it('uses new <name> data when the tables flag is enabled', async () => {
        mockUseFlag.mockReturnValue(true)
        // render, trigger download, assert new file name is present and legacy is absent
    })

    it('uses legacy <name> data when the tables flag is disabled', async () => {
        mockUseFlag.mockImplementation(
            (flag) => flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
        )
        // render, trigger download, assert legacy file name is present and new is absent
    })

    it('reflects isLoading from legacy <name> data when the tables flag is disabled', () => {
        mockUseFlag.mockImplementation(
            (flag) => flag !== FeatureFlagKey.AiAgentAnalyticsDashboardsTables,
        )
        mockUseLegacy <
            Name >
            Data.mockReturnValue({ files: {}, fileName: '', isLoading: true })
        // renderHook, expect isLoading true
    })
})
```

Note: the `should handle empty download data files` test must empty the **active** hook's data (the one selected by the flag), not the inactive one.

---

## Verification checklist

After implementing, run these commands from the repo root:

```bash
pnpm typecheck @repo/helpdesk
pnpm test @repo/helpdesk "<TableName>"
```

Ensure:

- [ ] Typecheck passes with no errors
- [ ] Unit tests pass for the new aggregator hook and any new scope query factories
- [ ] The table renders in the dashboard with correct column headers
- [ ] The download button produces a valid CSV with correct column labels
- [ ] Handover counts appear only for the expected entity rows

---

## Key shared infrastructure (do not duplicate)

| What                     | Location                                                                                                                                                                                                  |
| ------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generic table shell      | `@repo/reporting` → `ReportingMetricBreakdownTable`                                                                                                                                                       |
| Types                    | `@repo/reporting` → `MetricColumnConfig`, `MetricLoadingStates`, `NameColumnConfig`                                                                                                                       |
| Generic download button  | `analyticsOverview/components/shared/DownloadTableButton.tsx`                                                                                                                                             |
| Standard 5-column config | `analyticsOverview/components/shared/metricColumns.tsx` → `STANDARD_METRIC_COLUMNS`                                                                                                                       |
| Dimension data fetching  | `domains/reporting/hooks/useStatsMetricPerDimension.ts` → `useStatsMetricPerDimension`, `fetchStatsMetricPerDimension`, `useEntityMetrics`, `fetchEntityMetrics`, `assembleEntityRows`, `mapMetricValues` |
| Cost transform helper    | `mapMetricValues` from `useStatsMetricPerDimension.ts`                                                                                                                                                    |
| Row assembly             | `assembleEntityRows` from `useStatsMetricPerDimension.ts`                                                                                                                                                 |
| Entity filtering         | `filterEntitiesWithData` from `useStatsMetricPerDimension.ts` — filters to entities with at least one non-null, non-NaN value; returns all entities while loading                                         |
| Channel name formatter   | `pages/aiAgent/utils/aiAgentMetrics.utils.ts` → `formatChannelName`                                                                                                                                       |
| Error reporting          | `@repo/logging` → `reportError` (use `SentryTeam.CRM_REPORTING`)                                                                                                                                          |
| Workflow configurations  | `models/workflows/queries.ts` → `useGetWorkflowConfigurations`, `fetchWorkflowConfigurations`                                                                                                             |
