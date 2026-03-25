import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { AllAgentsPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/AllAgentsPerformanceByChannelTable'
import { ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/columns'
import type { AllAgentsPerformanceByChannelEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/DownloadAllAgentsPerformanceByChannelButton',
    () => ({
        DownloadAllAgentsPerformanceByChannelButton: () => (
            <div>Download All Agents Performance By Channel</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics',
)

const mockUseAllAgentsPerformanceByChannelMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics',
).useAllAgentsPerformanceByChannelMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    costSaved: false,
    coverageRate: false,
    successRate: false,
}

const defaultData: AllAgentsPerformanceByChannelEntityMetrics[] = [
    {
        entity: 'email',
        automatedInteractions: 2700,
        handoverInteractions: 189,
        costSaved: 1200,
        coverageRate: 0.85,
        successRate: 0.78,
    },
    {
        entity: 'chat',
        automatedInteractions: 900,
        handoverInteractions: null,
        costSaved: 500,
        coverageRate: 0.92,
        successRate: 0.91,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseAllAgentsPerformanceByChannelMetrics.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<AllAgentsPerformanceByChannelTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: AllAgentsPerformanceByChannelEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: AllAgentsPerformanceByChannelEntityMetrics) => string
        DownloadButton: React.ReactNode
        nameColumns: {
            accessor: string
            label: string
            formatName?: (value: string) => string
        }[]
    }

describe('AllAgentsPerformanceByChannelTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useAllAgentsPerformanceByChannelMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            ALL_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
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

    it('renders DownloadAllAgentsPerformanceByChannelButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download All Agents Performance By Channel'),
        ).toBeInTheDocument()
    })
})
