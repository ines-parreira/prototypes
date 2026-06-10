import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'
import { AiAgentSalesPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/AiAgentSalesPerformanceByChannelTable'
import { AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/columns'
import type { AiAgentSalesPerformanceByChannelEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AiAgentSalesPerformanceByChannelTable/DownloadAiAgentSalesPerformanceByChannelButton',
    () => ({
        DownloadAiAgentSalesPerformanceByChannelButton: () => (
            <div>Download AI Agent Sales Performance By Channel</div>
        ),
        useDownloadAiAgentSalesPerformanceByChannelAction: () => ({
            onClick: jest.fn(),
            isLoading: false,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockUseCustomDashboardTableColumns = jest.requireMock(
    'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns',
).useCustomDashboardTableColumns as jest.Mock

const mockUseAiAgentSalesPerformanceByChannelMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics',
).useAiAgentSalesPerformanceByChannelMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    conversionRate: false,
    totalSales: false,
    ordersInfluenced: false,
    revenuePerInteraction: false,
}

const defaultData: AiAgentSalesPerformanceByChannelEntityMetrics[] = [
    {
        entity: 'email',
        automatedInteractions: 2700,
        handoverInteractions: 189,
        conversionRate: 0.12,
        totalSales: 5000,
        ordersInfluenced: 42,
        revenuePerInteraction: 1.71,
    },
    {
        entity: 'chat',
        automatedInteractions: 900,
        handoverInteractions: null,
        conversionRate: null,
        totalSales: null,
        ordersInfluenced: null,
        revenuePerInteraction: null,
    },
]

const renderComponent = () => render(<AiAgentSalesPerformanceByChannelTable />)

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: AiAgentSalesPerformanceByChannelEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (
            row: AiAgentSalesPerformanceByChannelEntityMetrics,
        ) => string
        DownloadButton: React.ReactNode
        actionMenu?: React.ReactNode
        name?: string
        nameColumns: {
            accessor: string
            label: string
            formatName?: (value: string) => string
        }[]
        customDashboardChartSchema?: unknown
        onSaveColumns?: (columns: ColumnConfig[]) => void
    }

describe('AiAgentSalesPerformanceByChannelTable', () => {
    beforeEach(() => {
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
        mockUseAiAgentSalesPerformanceByChannelMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
    })

    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useAiAgentSalesPerformanceByChannelMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            AI_AGENT_SALES_PERFORMANCE_BY_CHANNEL_COLUMNS,
        )
    })

    it('passes nameColumns with entity accessor, Channel label, and formatChannelName', () => {
        renderComponent()

        const { nameColumns } = getLastCallProps()
        expect(nameColumns).toEqual([
            expect.objectContaining({
                accessor: 'entity',
                label: 'Channel',
                formatName: formatChannelName,
            }),
        ])
    })

    it('renders DownloadAiAgentSalesPerformanceByChannelButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download AI Agent Sales Performance By Channel'),
        ).toBeInTheDocument()
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        render(
            <AiAgentSalesPerformanceByChannelTable
                chartId="ai_agent_sales_performance_by_channel_table"
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
        render(
            <AiAgentSalesPerformanceByChannelTable
                chartId="ai_agent_sales_performance_by_channel_table"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('passes dashboard prop to ChartsActionMenu when provided', () => {
        const dashboard = {
            id: 1,
            name: 'My Dashboard',
            children: [],
            emoji: null,
            analytics_filter_id: null,
        }

        render(
            <AiAgentSalesPerformanceByChannelTable
                chartId="ai_agent_sales_performance_by_channel_table"
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
        render(
            <AiAgentSalesPerformanceByChannelTable
                chartConfig={{ label: 'Channel' }}
            />,
        )

        expect(getLastCallProps().name).toBe('Channel')
    })

    it('passes customDashboardChartSchema to ReportingMetricBreakdownTable', () => {
        const schema: DashboardChartSchema = {
            config_id: 'chart-1',
            type: DashboardChildType.Chart,
        }

        render(
            <AiAgentSalesPerformanceByChannelTable
                customDashboardChartSchema={schema}
            />,
        )

        expect(getLastCallProps().customDashboardChartSchema).toBe(schema)
    })

    it('passes onSaveColumns from useCustomDashboardTableColumns to ReportingMetricBreakdownTable', () => {
        const onSaveColumns = jest.fn()
        mockUseCustomDashboardTableColumns.mockReturnValue({ onSaveColumns })

        render(
            <AiAgentSalesPerformanceByChannelTable
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
