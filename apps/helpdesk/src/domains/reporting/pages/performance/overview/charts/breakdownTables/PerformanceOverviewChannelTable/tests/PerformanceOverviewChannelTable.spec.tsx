import { mockListAnalyticsCustomReportsHandler } from '@gorgias/helpdesk-mocks'

import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'

import { UserRole } from 'config/types/user'
import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import type {
    DashboardChartSchema,
    DashboardSchema,
} from 'domains/reporting/pages/dashboards/types'
import { DashboardChildType } from 'domains/reporting/pages/dashboards/types'
import { PerformanceOverviewChannelTable } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable'
import type { PerformanceOverviewEntityMetrics } from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import { useDownloadPerformanceOverviewChannelData } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData'
import { usePerformanceOverviewChannelMetrics } from 'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics'
import { user } from 'fixtures/users'

jest.mock(
    'domains/reporting/pages/performance/overview/hooks/channelBreakdown/usePerformanceOverviewChannelMetrics',
)

jest.mock(
    'domains/reporting/pages/performance/overview/hooks/channelBreakdown/useDownloadPerformanceOverviewChannelData',
)

jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const server = setupServer()

beforeAll(() => {
    server.listen({ onUnhandledRequest: 'error' })
})

beforeEach(() => {
    server.use(mockListAnalyticsCustomReportsHandler().handler)
})

afterEach(() => {
    server.resetHandlers()
})

afterAll(() => {
    server.close()
})

const teamLeadState = {
    currentUser: fromJS({ ...user, role: { name: UserRole.Agent } }),
}

const mockUsePerformanceOverviewChannelMetrics = assumeMock(
    usePerformanceOverviewChannelMetrics,
)
const mockUseDownloadPerformanceOverviewChannelData = assumeMock(
    useDownloadPerformanceOverviewChannelData,
)
const mockUseCustomDashboardTableColumns = assumeMock(
    useCustomDashboardTableColumns,
)

beforeEach(() => {
    mockUseCustomDashboardTableColumns.mockReturnValue({
        onSaveColumns: undefined,
    })
    mockUseDownloadPerformanceOverviewChannelData.mockReturnValue({
        files: {},
        fileName: '',
        isLoading: false,
    })
})

const defaultLoadingStates = {
    averageCsat: false,
    resolutionTime: false,
    messagesPerTicket: false,
    firstResponseTime: false,
    humanResponseTimeAfterAiHandoff: false,
    createdTickets: false,
    closedTickets: false,
    ticketsReplied: false,
    messagesSent: false,
}

const emailRow: PerformanceOverviewEntityMetrics = {
    entity: 'email',
    averageCsat: 4.5,
    resolutionTime: 3600,
    messagesPerTicket: 3.2,
    firstResponseTime: 600,
    humanResponseTimeAfterAiHandoff: 900,
    createdTickets: 2700,
    closedTickets: 2500,
    ticketsReplied: 2200,
    messagesSent: 8000,
}

const chatRow: PerformanceOverviewEntityMetrics = {
    entity: 'chat',
    averageCsat: 4.7,
    resolutionTime: 1800,
    messagesPerTicket: null,
    firstResponseTime: 60,
    humanResponseTimeAfterAiHandoff: null,
    createdTickets: 900,
    closedTickets: 850,
    ticketsReplied: 800,
    messagesSent: 3000,
}

const renderTable = ({
    data = [emailRow, chatRow],
    loadingStates = defaultLoadingStates,
    chartId,
    withChartMenu,
}: {
    data?: PerformanceOverviewEntityMetrics[]
    loadingStates?: typeof defaultLoadingStates
    chartId?: string
    withChartMenu?: boolean
} = {}) => {
    mockUsePerformanceOverviewChannelMetrics.mockReturnValue({
        data,
        loadingStates,
        isLoading: false,
        isError: false,
    })
    return render(
        <PerformanceOverviewChannelTable
            chartId={chartId}
            withChartMenu={withChartMenu}
        />,
        { storeState: teamLeadState },
    )
}

describe('PerformanceOverviewChannelTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Channel column with humanized channel names', () => {
        renderTable()

        const table = screen.getByRole('table')
        expect(within(table).getByText('Channel')).toBeInTheDocument()
        expect(within(table).getByText('Email')).toBeInTheDocument()
        expect(within(table).getByText('Chat')).toBeInTheDocument()
    })

    it('renders metric values formatted by their column metricFormat', () => {
        renderTable({ data: [emailRow] })

        const table = screen.getByRole('table')
        // duration (resolutionTime: 3600s)
        expect(within(table).getByText('1h')).toBeInTheDocument()
        // duration (firstResponseTime: 600s)
        expect(within(table).getByText('10m')).toBeInTheDocument()
        // duration (humanResponseTimeAfterAiHandoff: 900s)
        expect(within(table).getByText('15m')).toBeInTheDocument()
        // decimal (averageCsat: 4.5)
        expect(within(table).getByText('4.5')).toBeInTheDocument()
        // decimal (messagesPerTicket: 3.2)
        expect(within(table).getByText('3.2')).toBeInTheDocument()
        // decimal (createdTickets: 2700) → locale-formatted with comma
        expect(within(table).getByText('2,700')).toBeInTheDocument()
        // decimal (messagesSent: 8000)
        expect(within(table).getByText('8,000')).toBeInTheDocument()
    })

    it('renders the placeholder for null metric values', () => {
        renderTable({ data: [chatRow] })

        const table = screen.getByRole('table')
        // messagesPerTicket and humanResponseTimeAfterAiHandoff are null for chat
        expect(within(table).getAllByText('-').length).toBeGreaterThanOrEqual(2)
    })

    it('renders the download button', () => {
        renderTable()

        // DownloadTableButton is an icon-only Axiom Button with icon="download".
        // The full table actions toolbar provides the testable name.
        expect(
            screen.getByRole('button', { name: /download/i }),
        ).toBeInTheDocument()
    })

    it('disables the download button while the breakdown data is loading', () => {
        mockUseDownloadPerformanceOverviewChannelData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        renderTable()

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })

    it('renders the chart action menu when chartId and withChartMenu are provided', async () => {
        renderTable({
            chartId: 'performance-overview-channel-table',
            withChartMenu: true,
        })

        expect(
            await screen.findByRole('button', { name: 'Chart actions' }),
        ).toBeInTheDocument()
    })

    it('does not render the chart action menu without a chartId', () => {
        renderTable({ withChartMenu: true })

        expect(
            screen.queryByRole('button', { name: 'Chart actions' }),
        ).not.toBeInTheDocument()
    })

    it('does not render the chart action menu when withChartMenu is false', () => {
        renderTable({
            chartId: 'performance-overview-channel-table',
            withChartMenu: false,
        })

        expect(
            screen.queryByRole('button', { name: 'Chart actions' }),
        ).not.toBeInTheDocument()
    })

    it('exposes CSV export from the chart action menu instead of the standalone download button', async () => {
        const user = userEvent.setup()
        renderTable({
            chartId: 'performance-overview-channel-table',
            withChartMenu: true,
        })

        await user.click(
            await screen.findByRole('button', { name: 'Chart actions' }),
        )

        expect(
            await screen.findByRole('menuitem', { name: /export as csv/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /download/i }),
        ).not.toBeInTheDocument()
    })

    it('passes customDashboardChartSchema to useCustomDashboardTableColumns when provided', () => {
        const customDashboardChartSchema: DashboardChartSchema = {
            type: DashboardChildType.Chart,
            config_id: 'performance-overview-channel-table',
        }

        mockUsePerformanceOverviewChannelMetrics.mockReturnValue({
            data: [emailRow, chatRow],
            loadingStates: defaultLoadingStates,
            isLoading: false,
            isError: false,
        })

        render(
            <PerformanceOverviewChannelTable
                customDashboardChartSchema={customDashboardChartSchema}
            />,
        )

        expect(mockUseCustomDashboardTableColumns).toHaveBeenCalledWith(
            expect.objectContaining({ customDashboardChartSchema }),
        )
    })

    it('passes dashboard to useCustomDashboardTableColumns and renders the table label', () => {
        const dashboard: DashboardSchema = {
            id: 1,
            name: 'My Dashboard',
            children: [],
            emoji: null,
            analytics_filter_id: null,
        }

        mockUsePerformanceOverviewChannelMetrics.mockReturnValue({
            data: [emailRow, chatRow],
            loadingStates: defaultLoadingStates,
            isLoading: false,
            isError: false,
        })

        render(
            <PerformanceOverviewChannelTable
                dashboard={dashboard}
                chartConfig={{ label: 'Channels' }}
                customDashboardChartSchema={{
                    type: DashboardChildType.Chart,
                    config_id: 'performance-overview-channel-table',
                }}
            />,
        )

        expect(mockUseCustomDashboardTableColumns).toHaveBeenCalledWith(
            expect.objectContaining({ dashboard }),
        )
        expect(
            screen.getByText('Performance breakdown by Channels'),
        ).toBeInTheDocument()
    })
})
