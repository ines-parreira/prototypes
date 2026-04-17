import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render, screen } from '@testing-library/react'

import { SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/columns'
import { SupportAgentsPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/SupportAgentsPerformanceByChannelTable'
import type { SupportAgentsPerformanceByChannelEntityMetrics } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics'
import { formatChannelName } from 'pages/aiAgent/utils/aiAgentMetrics.utils'

const mockReportingMetricBreakdownTable = jest.fn(({ DownloadButton }) => (
    <div>{DownloadButton}</div>
))

jest.mock('@repo/reporting', () => ({
    ReportingMetricBreakdownTable: (props: unknown) =>
        mockReportingMetricBreakdownTable(props),
}))

jest.mock(
    'pages/aiAgent/analyticsAiAgent/components/SupportAgentsPerformanceByChannelTable/DownloadSupportAgentsPerformanceByChannelButton',
    () => ({
        DownloadSupportAgentsPerformanceByChannelButton: () => (
            <div>Download Support Agents Performance By Channel</div>
        ),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics',
)

const mockUseSupportAgentsPerformanceByChannelMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics',
).useSupportAgentsPerformanceByChannelMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    timeSaved: false,
    costSaved: false,
    decreaseInFRT: false,
}

const defaultData: SupportAgentsPerformanceByChannelEntityMetrics[] = [
    {
        entity: 'email',
        automatedInteractions: 2700,
        handoverInteractions: 189,
        timeSaved: 3600,
        costSaved: 1200,
        decreaseInFRT: null,
    },
    {
        entity: 'chat',
        automatedInteractions: 900,
        handoverInteractions: null,
        timeSaved: 1800,
        costSaved: 500,
        decreaseInFRT: null,
    },
]

const renderComponent = (
    data = defaultData,
    loadingStates = defaultLoadingStates,
) => {
    mockUseSupportAgentsPerformanceByChannelMetrics.mockReturnValue({
        data,
        loadingStates,
    })
    return render(<SupportAgentsPerformanceByChannelTable />)
}

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: SupportAgentsPerformanceByChannelEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (
            row: SupportAgentsPerformanceByChannelEntityMetrics,
        ) => string
        DownloadButton: React.ReactNode
        nameColumns: {
            accessor: string
            label: string
            formatName?: (value: string) => string
        }[]
    }

describe('SupportAgentsPerformanceByChannelTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('passes data from useSupportAgentsPerformanceByChannelMetrics to ReportingMetricBreakdownTable', () => {
        renderComponent()

        expect(getLastCallProps().data).toBe(defaultData)
    })

    it('passes loadingStates from the hook', () => {
        renderComponent()

        expect(getLastCallProps().loadingStates).toBe(defaultLoadingStates)
    })

    it('passes SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS as metricColumns', () => {
        renderComponent()

        expect(getLastCallProps().metricColumns).toBe(
            SUPPORT_AGENTS_PERFORMANCE_BY_CHANNEL_COLUMNS,
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

    it('renders DownloadSupportAgentsPerformanceByChannelButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download Support Agents Performance By Channel'),
        ).toBeInTheDocument()
    })
})
