import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

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
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics',
)

const mockUseAiAgentSalesPerformanceByChannelMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics',
).useAiAgentSalesPerformanceByChannelMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    totalSales: false,
    ordersInfluenced: false,
    revenuePerInteraction: false,
}

const defaultData: AiAgentSalesPerformanceByChannelEntityMetrics[] = [
    {
        entity: 'email',
        automatedInteractions: 2700,
        handoverInteractions: 189,
        totalSales: 5000,
        ordersInfluenced: 42,
        revenuePerInteraction: 1.71,
    },
    {
        entity: 'chat',
        automatedInteractions: 900,
        handoverInteractions: null,
        totalSales: null,
        ordersInfluenced: null,
        revenuePerInteraction: null,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseAiAgentSalesPerformanceByChannelMetrics.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<AiAgentSalesPerformanceByChannelTable />)
}

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
        nameColumns: {
            accessor: string
            label: string
            formatName?: (value: string) => string
        }[]
    }

describe('AiAgentSalesPerformanceByChannelTable', () => {
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

    it('passes getRowKey that returns the entity value', () => {
        renderComponent()

        const { getRowKey } = getLastCallProps()
        expect(getRowKey(defaultData[0])).toBe('email')
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
})
