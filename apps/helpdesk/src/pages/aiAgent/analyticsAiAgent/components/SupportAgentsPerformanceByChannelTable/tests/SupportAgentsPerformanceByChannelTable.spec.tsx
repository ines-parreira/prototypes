import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'

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
        useDownloadSupportAgentsPerformanceByChannelAction: () => ({
            onClick: jest.fn(),
            isLoading: false,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
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
        actionMenu?: React.ReactNode
        isCustomDashboard?: boolean
        name?: string
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

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        mockUseSupportAgentsPerformanceByChannelMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <SupportAgentsPerformanceByChannelTable
                chartId="support_agents_performance_by_channel_table"
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
        mockUseSupportAgentsPerformanceByChannelMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <SupportAgentsPerformanceByChannelTable
                chartId="support_agents_performance_by_channel_table"
                withChartMenu={false}
            />,
        )

        expect(getLastCallProps().actionMenu).toBeUndefined()
    })

    it('passes dashboard prop to ChartsActionMenu when provided', () => {
        mockUseSupportAgentsPerformanceByChannelMetrics.mockReturnValue({
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
            <SupportAgentsPerformanceByChannelTable
                chartId="support_agents_performance_by_channel_table"
                withChartMenu
                dashboard={dashboard}
            />,
        )

        expect(
            (getLastCallProps().actionMenu as React.ReactElement).props
                .dashboard,
        ).toBe(dashboard)
    })

    it('passes isCustomDashboard to ReportingMetricBreakdownTable', () => {
        mockUseSupportAgentsPerformanceByChannelMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(<SupportAgentsPerformanceByChannelTable isCustomDashboard />)

        expect(getLastCallProps().isCustomDashboard).toBe(true)
    })

    it('passes name from chartConfig.label to ReportingMetricBreakdownTable', () => {
        mockUseSupportAgentsPerformanceByChannelMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
        render(
            <SupportAgentsPerformanceByChannelTable
                chartConfig={{ label: 'Channel' }}
            />,
        )

        expect(getLastCallProps().name).toBe('Channel')
    })
})
