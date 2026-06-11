import { mockListAnalyticsCustomReportsHandler } from '@gorgias/helpdesk-mocks'

import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'

import { UserRole } from 'config/types/user'
import { ChannelsEmailSubChannelTable } from 'domains/reporting/pages/performance/channels/email/charts/breakdownTables/ChannelsEmailSubChannelTable'
import type { ChannelsEmailEntityMetrics } from 'domains/reporting/pages/performance/channels/email/config/breakdownTableMetrics'
import { useDownloadPerformanceChannelsEmailSubChannelData } from 'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/useDownloadPerformanceChannelsEmailSubChannelData'
import { usePerformanceChannelsEmailSubChannelMetrics } from 'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/usePerformanceChannelsEmailSubChannelMetrics'
import { user } from 'fixtures/users'

jest.mock(
    'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/usePerformanceChannelsEmailSubChannelMetrics',
)

jest.mock(
    'domains/reporting/pages/performance/channels/email/hooks/subChannelBreakdown/useDownloadPerformanceChannelsEmailSubChannelData',
)

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

const mockUsePerformanceChannelsEmailSubChannelMetrics = assumeMock(
    usePerformanceChannelsEmailSubChannelMetrics,
)
const mockUseDownloadPerformanceChannelsEmailSubChannelData = assumeMock(
    useDownloadPerformanceChannelsEmailSubChannelData,
)

beforeEach(() => {
    mockUseDownloadPerformanceChannelsEmailSubChannelData.mockReturnValue({
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

const emailRow: ChannelsEmailEntityMetrics = {
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

const contactFormRow: ChannelsEmailEntityMetrics = {
    entity: 'contact_form',
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
    data = [emailRow, contactFormRow],
    loadingStates = defaultLoadingStates,
    chartId,
    withChartMenu,
}: {
    data?: ChannelsEmailEntityMetrics[]
    loadingStates?: typeof defaultLoadingStates
    chartId?: string
    withChartMenu?: boolean
} = {}) => {
    mockUsePerformanceChannelsEmailSubChannelMetrics.mockReturnValue({
        data,
        loadingStates,
        isLoading: false,
        isError: false,
    })
    return render(
        <ChannelsEmailSubChannelTable
            chartId={chartId}
            withChartMenu={withChartMenu}
        />,
        { storeState: teamLeadState },
    )
}

describe('ChannelsEmailSubChannelTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Sub-channel column with humanized channel names', () => {
        renderTable()

        const table = screen.getByRole('table')
        expect(within(table).getByText('Sub-channel')).toBeInTheDocument()
        expect(within(table).getByText('Email')).toBeInTheDocument()
    })

    it('renders metric values formatted by their column metricFormat', () => {
        renderTable({ data: [emailRow] })

        const table = screen.getByRole('table')
        expect(within(table).getByText('1h')).toBeInTheDocument()
        expect(within(table).getByText('10m')).toBeInTheDocument()
        expect(within(table).getByText('15m')).toBeInTheDocument()
        expect(within(table).getByText('4.5')).toBeInTheDocument()
        expect(within(table).getByText('3.2')).toBeInTheDocument()
        expect(within(table).getByText('2,700')).toBeInTheDocument()
        expect(within(table).getByText('8,000')).toBeInTheDocument()
    })

    it('renders the placeholder for null metric values', () => {
        renderTable({ data: [contactFormRow] })

        const table = screen.getByRole('table')
        expect(within(table).getAllByText('-').length).toBeGreaterThanOrEqual(2)
    })

    it('renders the download button', () => {
        renderTable()

        expect(
            screen.getByRole('button', { name: /download/i }),
        ).toBeInTheDocument()
    })

    it('disables the download button while the breakdown data is loading', () => {
        mockUseDownloadPerformanceChannelsEmailSubChannelData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        renderTable()

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })

    it('renders the chart action menu when chartId and withChartMenu are provided', async () => {
        renderTable({
            chartId: 'performance-channels-email-sub-channel-table',
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
            chartId: 'performance-channels-email-sub-channel-table',
            withChartMenu: false,
        })

        expect(
            screen.queryByRole('button', { name: 'Chart actions' }),
        ).not.toBeInTheDocument()
    })

    it('exposes CSV export from the chart action menu instead of the standalone download button', async () => {
        const user = userEvent.setup()
        renderTable({
            chartId: 'performance-channels-email-sub-channel-table',
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
})
