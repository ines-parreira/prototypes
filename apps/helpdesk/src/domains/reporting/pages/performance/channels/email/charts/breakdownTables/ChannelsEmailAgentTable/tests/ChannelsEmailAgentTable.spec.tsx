import { mockListAnalyticsCustomReportsHandler } from '@gorgias/helpdesk-mocks'

import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import { ChannelsEmailAgentTable } from 'domains/reporting/pages/performance/channels/email/charts/breakdownTables/ChannelsEmailAgentTable'
import type { ChannelsEmailEntityMetrics } from 'domains/reporting/pages/performance/channels/email/config/breakdownTableMetrics'
import { useDownloadPerformanceChannelsEmailAgentData } from 'domains/reporting/pages/performance/channels/email/hooks/agentBreakdown/useDownloadPerformanceChannelsEmailAgentData'
import { usePerformanceChannelsEmailAgentMetrics } from 'domains/reporting/pages/performance/channels/email/hooks/agentBreakdown/usePerformanceChannelsEmailAgentMetrics'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { user } from 'fixtures/users'

jest.mock(
    'domains/reporting/pages/performance/channels/email/hooks/agentBreakdown/usePerformanceChannelsEmailAgentMetrics',
)
jest.mock(
    'domains/reporting/pages/performance/channels/email/hooks/agentBreakdown/useDownloadPerformanceChannelsEmailAgentData',
)
jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice', () => ({
    ...jest.requireActual(
        'domains/reporting/state/ui/stats/agentPerformanceSlice',
    ),
    getFilteredAgents: jest.fn(() => []),
}))

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

const mockUsePerformanceChannelsEmailAgentMetrics = assumeMock(
    usePerformanceChannelsEmailAgentMetrics,
)
const mockUseDownloadPerformanceChannelsEmailAgentData = assumeMock(
    useDownloadPerformanceChannelsEmailAgentData,
)
const mockGetFilteredAgents = assumeMock(getFilteredAgents)

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

const aliceRow: ChannelsEmailEntityMetrics = {
    entity: '1',
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

const bobRow: ChannelsEmailEntityMetrics = {
    entity: '2',
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

const MOCK_AGENTS: User[] = [
    { id: 1, name: 'Alice Anderson' } as unknown as User,
    { id: 2, name: 'Bob Brown' } as unknown as User,
]

beforeEach(() => {
    mockUseDownloadPerformanceChannelsEmailAgentData.mockReturnValue({
        files: {},
        fileName: '',
        isLoading: false,
    })
    mockGetFilteredAgents.mockReturnValue(MOCK_AGENTS)
})

const renderTable = ({
    data = [aliceRow, bobRow],
    loadingStates = defaultLoadingStates,
    chartId,
    withChartMenu,
}: {
    data?: ChannelsEmailEntityMetrics[]
    loadingStates?: typeof defaultLoadingStates
    chartId?: string
    withChartMenu?: boolean
} = {}) => {
    mockUsePerformanceChannelsEmailAgentMetrics.mockReturnValue({
        data,
        loadingStates,
        isLoading: false,
        isError: false,
    })
    return render(
        <ChannelsEmailAgentTable
            chartId={chartId}
            withChartMenu={withChartMenu}
        />,
        { storeState: teamLeadState },
    )
}

describe('ChannelsEmailAgentTable', () => {
    afterEach(() => {
        jest.clearAllMocks()
    })

    it('renders the Agent column with humanized agent names from the store', () => {
        renderTable()

        const table = screen.getByRole('table')
        expect(within(table).getByText('Agent')).toBeInTheDocument()
        expect(within(table).getByText('Alice Anderson')).toBeInTheDocument()
        expect(within(table).getByText('Bob Brown')).toBeInTheDocument()
    })

    it('falls back to the raw id when an agent is missing from the store', () => {
        const unknownAgentRow: ChannelsEmailEntityMetrics = {
            ...aliceRow,
            entity: '999',
        }
        renderTable({ data: [unknownAgentRow] })

        const table = screen.getByRole('table')
        expect(within(table).getByText('999')).toBeInTheDocument()
    })

    it('renders metric values formatted by their column metricFormat', () => {
        renderTable({ data: [aliceRow] })

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
        renderTable({ data: [bobRow] })

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
        mockUseDownloadPerformanceChannelsEmailAgentData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        renderTable()

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })

    it('renders the chart action menu when chartId and withChartMenu are provided', async () => {
        renderTable({
            chartId: 'performance-channels-email-agent-table',
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
            chartId: 'performance-channels-email-agent-table',
            withChartMenu: false,
        })

        expect(
            screen.queryByRole('button', { name: 'Chart actions' }),
        ).not.toBeInTheDocument()
    })

    it('exposes CSV export from the chart action menu instead of the standalone download button', async () => {
        const user = userEvent.setup()
        renderTable({
            chartId: 'performance-channels-email-agent-table',
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
