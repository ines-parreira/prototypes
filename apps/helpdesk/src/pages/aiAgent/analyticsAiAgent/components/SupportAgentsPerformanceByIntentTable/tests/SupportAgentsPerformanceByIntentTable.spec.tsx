import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'
import { SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/columns'
import { SupportAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/SupportAgentsPerformanceByIntentTable'
import type { SupportAgentsPerformanceByIntentEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByIntentTable/DownloadSupportAgentsPerformanceByIntentButton',
    () => ({
        DownloadSupportAgentsPerformanceByIntentButton: () => (
            <div>Download Support Agents Performance By Intent</div>
        ),
        useDownloadSupportAgentsPerformanceByIntentAction: () => ({
            onClick: jest.fn(),
            isLoading: false,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockUseSupportAgentsPerformanceByIntentMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics',
).useSupportAgentsPerformanceByIntentMetrics as jest.Mock

const mockUseCustomDashboardTableColumns = jest.requireMock(
    'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns',
).useCustomDashboardTableColumns as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    successRate: false,
    costSaved: false,
    decreaseInFRT: false,
}

const defaultData: SupportAgentsPerformanceByIntentEntityMetrics[] = [
    {
        entity: 'Billing :: Refund Request',
        intentL1: 'Billing',
        intentL2: 'Refund Request',
        automatedInteractions: 1500,
        handoverInteractions: 120,
        successRate: 0.82,
        costSaved: 800,
        decreaseInFRT: 180,
    },
    {
        entity: 'Shipping :: Order Status',
        intentL1: 'Shipping',
        intentL2: 'Order Status',
        automatedInteractions: 900,
        handoverInteractions: null,
        successRate: 0.71,
        costSaved: 450,
        decreaseInFRT: 75,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<SupportAgentsPerformanceByIntentTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: SupportAgentsPerformanceByIntentEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (
            row: SupportAgentsPerformanceByIntentEntityMetrics,
        ) => string
        DownloadButton: React.ReactNode
        actionMenu?: React.ReactNode
        customDashboardChartSchema?: unknown
        onSaveColumns?: (columns: ColumnConfig[]) => void
        name?: string
        nameColumns: { accessor: string; label: string }[]
    }

describe('SupportAgentsPerformanceByIntentTable', () => {
    beforeEach(() => {
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useSupportAgentsPerformanceByIntentMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            SUPPORT_AGENTS_PERFORMANCE_BY_INTENT_COLUMNS,
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

    it('renders DownloadSupportAgentsPerformanceByIntentButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Support Agents Performance By Intent'),
        ).toBeInTheDocument()
    })

    it('falls back to an empty array when the hook returns no data', () => {
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: undefined,
            loadingStates: defaultLoadingStates,
        })

        render(<SupportAgentsPerformanceByIntentTable />)

        expect(getLastCallProps().data).toEqual([])
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <SupportAgentsPerformanceByIntentTable
                chartId="support_agents_performance_by_intent_table"
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
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <SupportAgentsPerformanceByIntentTable
                chartId="support_agents_performance_by_intent_table"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('passes dashboard prop to ChartsActionMenu when provided', () => {
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
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
            <SupportAgentsPerformanceByIntentTable
                chartId="support_agents_performance_by_intent_table"
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
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <SupportAgentsPerformanceByIntentTable
                chartConfig={{ label: 'Intent' }}
            />,
        )

        expect(getLastCallProps().name).toBe('Intent')
    })

    it('passes customDashboardChartSchema to ReportingMetricBreakdownTable', () => {
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const schema: DashboardChartSchema = {
            config_id: 'chart-1',
            type: DashboardChildType.Chart,
        }

        render(
            <SupportAgentsPerformanceByIntentTable
                customDashboardChartSchema={schema}
            />,
        )

        expect(getLastCallProps().customDashboardChartSchema).toBe(schema)
    })

    it('passes onSaveColumns from useCustomDashboardTableColumns to ReportingMetricBreakdownTable', () => {
        mockUseSupportAgentsPerformanceByIntentMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        const onSaveColumns = jest.fn()
        mockUseCustomDashboardTableColumns.mockReturnValue({ onSaveColumns })

        render(
            <SupportAgentsPerformanceByIntentTable
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
