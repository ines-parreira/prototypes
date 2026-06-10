import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'
import { AllAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/AllAgentsPerformanceByIntentTable'
import { ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/columns'
import type { AllAgentsPerformanceByIntentEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/DownloadAllAgentsPerformanceByIntentButton',
    () => ({
        DownloadAllAgentsPerformanceByIntentButton: () => (
            <div>Download All Agents Performance By Intent</div>
        ),
        useDownloadAllAgentsPerformanceByIntentAction: () => ({
            onClick: jest.fn(),
            isLoading: false,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockUseAllAgentsPerformanceByIntentMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics',
).useAllAgentsPerformanceByIntentMetrics as jest.Mock

const mockUseCustomDashboardTableColumns = jest.requireMock(
    'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns',
).useCustomDashboardTableColumns as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    costSaved: false,
    coverageRate: false,
    successRate: false,
    conversionRate: false,
}

const defaultData: AllAgentsPerformanceByIntentEntityMetrics[] = [
    {
        entity: 'Billing :: Refund Request',
        intentL1: 'Billing',
        intentL2: 'Refund Request',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        coverageRate: 0.87,
        successRate: 0.81,
        conversionRate: 0.42,
        costSaved: 800,
    },
    {
        entity: 'Shipping :: Order Status',
        intentL1: 'Shipping',
        intentL2: 'Order Status',
        automatedInteractions: 900,
        handoverInteractions: null,
        coverageRate: 0.93,
        successRate: 0.88,
        conversionRate: null,
        costSaved: 450,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<AllAgentsPerformanceByIntentTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: AllAgentsPerformanceByIntentEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: AllAgentsPerformanceByIntentEntityMetrics) => string
        DownloadButton: React.ReactNode
        actionMenu?: React.ReactNode
        customDashboardChartSchema?: unknown
        onSaveColumns?: (columns: ColumnConfig[]) => void
        name?: string
        nameColumns: { accessor: string; label: string }[]
    }

describe('AllAgentsPerformanceByIntentTable', () => {
    beforeEach(() => {
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useAllAgentsPerformanceByIntentMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            ALL_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
        )
    })

    it('passes nameColumns with intentL1 and intentL2 accessors and labels', () => {
        renderComponent()

        const { nameColumns } = getLastCallProps()
        expect(nameColumns).toEqual([
            { accessor: 'intentL1', label: 'Intent L1' },
            { accessor: 'intentL2', label: 'Intent L2' },
        ])
    })

    it('renders DownloadAllAgentsPerformanceByIntentButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download All Agents Performance By Intent'),
        ).toBeInTheDocument()
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <AllAgentsPerformanceByIntentTable
                chartId="all_agents_performance_by_intent_table"
                withChartMenu
            />,
        )

        expect(getLastCallProps().actionMenu).toBeDefined()
    })

    it('does not pass actionMenu to ReportingMetricBreakdownTable when chartId is not provided', () => {
        renderComponent()

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('does not pass actionMenu to ReportingMetricBreakdownTable when chartId is provided but withChartMenu is false', () => {
        mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <AllAgentsPerformanceByIntentTable
                chartId="all_agents_performance_by_intent_table"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('passes dashboard prop to ChartsActionMenu when provided', () => {
        mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const dashboard = {
            id: 1,
            name: 'My Dashboard',
            children: [],
            emoji: null,
            analytics_filter_id: null,
        }

        render(
            <AllAgentsPerformanceByIntentTable
                chartId="all_agents_performance_by_intent_table"
                withChartMenu
                dashboard={dashboard}
            />,
        )

        expect(
            (getLastCallProps().actionMenu as React.ReactElement).props
                .dashboard,
        ).toBe(dashboard)
    })

    it('passes name from chartConfig.label to ReportingMetricBreakdownTable', () => {
        mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <AllAgentsPerformanceByIntentTable
                chartConfig={{ label: 'Intent' }}
            />,
        )

        expect(getLastCallProps().name).toBe('Intent')
    })

    it('passes customDashboardChartSchema to ReportingMetricBreakdownTable', () => {
        mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const schema: DashboardChartSchema = {
            config_id: 'chart-1',
            type: DashboardChildType.Chart,
        }

        render(
            <AllAgentsPerformanceByIntentTable
                customDashboardChartSchema={schema}
            />,
        )

        expect(getLastCallProps().customDashboardChartSchema).toBe(schema)
    })

    it('passes onSaveColumns from useCustomDashboardTableColumns to ReportingMetricBreakdownTable', () => {
        mockUseAllAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const onSaveColumns = jest.fn()
        mockUseCustomDashboardTableColumns.mockReturnValue({ onSaveColumns })

        render(
            <AllAgentsPerformanceByIntentTable
                dashboard={{
                    id: 1,
                    name: 'My Dashboard',
                    children: [],
                    emoji: null,
                    analytics_filter_id: null,
                }}
            />,
        )

        expect(getLastCallProps().onSaveColumns).toBe(onSaveColumns)
    })
})
