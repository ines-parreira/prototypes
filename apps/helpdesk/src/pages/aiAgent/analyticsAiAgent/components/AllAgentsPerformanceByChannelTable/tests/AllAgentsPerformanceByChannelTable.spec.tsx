import type { MetricColumnConfig, MetricLoadingStates } from '@repo/reporting'
import { render } from '@repo/testing'
import { screen } from '@testing-library/react'
import type { ColumnConfig } from '@gorgias/helpdesk-types'

import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import type { DashboardChartSchema } from 'domains/reporting/pages/dashboards/types'
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
        useDownloadAllAgentsPerformanceByChannelAction: () => ({
            onClick: jest.fn(),
            isLoading: false,
        }),
    }),
)

jest.mock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics',
)

jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
)

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockUseCustomDashboardTableColumns = jest.requireMock(
    'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns',
).useCustomDashboardTableColumns as jest.Mock

const mockUseAllAgentsPerformanceByChannelMetrics = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics',
).useAllAgentsPerformanceByChannelMetrics as jest.Mock

const defaultLoadingStates = {
    automatedInteractions: false,
    handoverInteractions: false,
    conversionRate: false,
    costSaved: false,
    coverageRate: false,
    successRate: false,
}

const defaultData: AllAgentsPerformanceByChannelEntityMetrics[] = [
    {
        entity: 'email',
        automatedInteractions: 2700,
        handoverInteractions: 189,
        conversionRate: 0.12,
        costSaved: 1200,
        coverageRate: 0.85,
        successRate: 0.78,
    },
    {
        entity: 'chat',
        automatedInteractions: 900,
        handoverInteractions: null,
        conversionRate: null,
        costSaved: 500,
        coverageRate: 0.92,
        successRate: 0.91,
    },
]

const renderComponent = () => render(<AllAgentsPerformanceByChannelTable />)

const getLastCallProps = () =>
    mockReportingMetricBreakdownTable.mock.calls[
        mockReportingMetricBreakdownTable.mock.calls.length - 1
    ][0] as {
        data: AllAgentsPerformanceByChannelEntityMetrics[]
        metricColumns: MetricColumnConfig[]
        loadingStates: MetricLoadingStates
        getRowKey: (row: AllAgentsPerformanceByChannelEntityMetrics) => string
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

describe('AllAgentsPerformanceByChannelTable', () => {
    beforeEach(() => {
        mockUseCustomDashboardTableColumns.mockReturnValue({
            onSaveColumns: undefined,
        })
        mockUseAllAgentsPerformanceByChannelMetrics.mockReturnValue({
            data: defaultData,
            loadingStates: defaultLoadingStates,
        })
    })

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

    it('passes name from chartConfig.label to ReportingMetricBreakdownTable', () => {
        render(
            <AllAgentsPerformanceByChannelTable
                chartConfig={{ label: 'Channel' }}
            />,
        )

        expect(getLastCallProps().name).toBe('Channel')
    })

    it('renders DownloadAllAgentsPerformanceByChannelButton as the DownloadButton', () => {
        renderComponent()

        expect(
            screen.getByText('Download All Agents Performance By Channel'),
        ).toBeInTheDocument()
    })

    it('passes actionMenu to ReportingMetricBreakdownTable when chartId and withChartMenu are provided', () => {
        render(
            <AllAgentsPerformanceByChannelTable
                chartId="all_agents_performance_by_channel_table"
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
            <AllAgentsPerformanceByChannelTable
                chartId="all_agents_performance_by_channel_table"
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
            <AllAgentsPerformanceByChannelTable
                chartId="all_agents_performance_by_channel_table"
                withChartMenu
                dashboard={dashboard}
            />,
        )

        expect(
            (getLastCallProps().actionMenu as React.ReactElement).props
                .dashboard,
        ).toBe(dashboard)
    })

    it('passes customDashboardChartSchema to ReportingMetricBreakdownTable', () => {
        const schema: DashboardChartSchema = {
            config_id: 'chart-1',
            type: DashboardChildType.Chart,
        }

        render(
            <AllAgentsPerformanceByChannelTable
                customDashboardChartSchema={schema}
            />,
        )

        expect(getLastCallProps().customDashboardChartSchema).toBe(schema)
    })

    it('passes onSaveColumns from useCustomDashboardTableColumns to ReportingMetricBreakdownTable', () => {
        const onSaveColumns = jest.fn()
        mockUseCustomDashboardTableColumns.mockReturnValue({ onSaveColumns })

        render(
            <AllAgentsPerformanceByChannelTable
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
