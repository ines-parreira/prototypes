import { mockListAnalyticsCustomReportsHandler } from '@gorgias/helpdesk-mocks'

import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { fromJS } from 'immutable'
import { setupServer } from 'msw/node'

import type { User } from 'config/types/user'
import { UserRole } from 'config/types/user'
import { useCustomDashboardTableColumns } from 'domains/reporting/hooks/dashboards/useCustomDashboardTableColumns'
import { ChannelsVoiceAgentTable } from 'domains/reporting/pages/performance/channels/voice/charts/breakdownTables/ChannelsVoiceAgentTable'
import type { ChannelsVoiceAgentEntityMetrics } from 'domains/reporting/pages/performance/channels/voice/charts/breakdownTables/ChannelsVoiceAgentTable/columns'
import { useChannelsVoiceAgentMetrics } from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useChannelsVoiceAgentMetrics'
import { useDownloadChannelsVoiceAgentData } from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useDownloadChannelsVoiceAgentData'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'
import { user } from 'fixtures/users'

jest.mock(
    'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useChannelsVoiceAgentMetrics',
)
jest.mock(
    'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useDownloadChannelsVoiceAgentData',
)
jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice', () => ({
    ...jest.requireActual(
        'domains/reporting/state/ui/stats/agentPerformanceSlice',
    ),
    getFilteredAgents: jest.fn(() => []),
}))
jest.mock('domains/reporting/hooks/dashboards/useCustomDashboardTableColumns')

const mockUseCustomDashboardTableColumns = assumeMock(
    useCustomDashboardTableColumns,
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

const mockUseChannelsVoiceAgentMetrics = assumeMock(
    useChannelsVoiceAgentMetrics,
)
const mockUseDownloadChannelsVoiceAgentData = assumeMock(
    useDownloadChannelsVoiceAgentData,
)
const mockGetFilteredAgents = assumeMock(getFilteredAgents)

const defaultLoadingStates = {
    totalCalls: false,
    inboundAnswered: false,
    inboundMissed: false,
    inboundTransferred: false,
    inboundDeclined: false,
    outbound: false,
    averageTalkTime: false,
}

const aliceRow: ChannelsVoiceAgentEntityMetrics = {
    entity: '1',
    totalCalls: 2700,
    inboundAnswered: 1800,
    inboundMissed: 50,
    inboundTransferred: 12,
    inboundDeclined: 5,
    outbound: 900,
    averageTalkTime: 3600,
}

const bobRow: ChannelsVoiceAgentEntityMetrics = {
    entity: '2',
    totalCalls: 120,
    inboundAnswered: null,
    inboundMissed: null,
    inboundTransferred: null,
    inboundDeclined: null,
    outbound: 30,
    averageTalkTime: 180,
}

const MOCK_AGENTS: User[] = [
    { id: 1, name: 'Alice Anderson' } as unknown as User,
    { id: 2, name: 'Bob Brown' } as unknown as User,
]

beforeEach(() => {
    mockUseCustomDashboardTableColumns.mockReturnValue({
        onSaveColumns: undefined,
    })
    mockUseDownloadChannelsVoiceAgentData.mockReturnValue({
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
    data?: ChannelsVoiceAgentEntityMetrics[]
    loadingStates?: typeof defaultLoadingStates
    chartId?: string
    withChartMenu?: boolean
} = {}) => {
    mockUseChannelsVoiceAgentMetrics.mockReturnValue({
        data,
        loadingStates,
        isLoading: false,
        isError: false,
    })
    return render(
        <ChannelsVoiceAgentTable
            chartId={chartId}
            withChartMenu={withChartMenu}
        />,
        { storeState: teamLeadState },
    )
}

describe('ChannelsVoiceAgentTable', () => {
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

    it('renders metric values formatted by their column metricFormat', () => {
        renderTable({ data: [aliceRow] })

        const table = screen.getByRole('table')
        expect(within(table).getByText('2,700')).toBeInTheDocument()
        expect(within(table).getByText('1,800')).toBeInTheDocument()
        expect(within(table).getByText('50')).toBeInTheDocument()
        expect(within(table).getByText('12')).toBeInTheDocument()
        expect(within(table).getByText('5')).toBeInTheDocument()
        expect(within(table).getByText('900')).toBeInTheDocument()
        expect(within(table).getByText('1h')).toBeInTheDocument()
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
        mockUseDownloadChannelsVoiceAgentData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        renderTable()

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })

    it('renders the chart action menu when chartId and withChartMenu are provided', async () => {
        renderTable({
            chartId: 'performance-channels-voice-agent-table',
            withChartMenu: true,
        })

        expect(
            await screen.findByRole('button', { name: 'Chart actions' }),
        ).toBeInTheDocument()
    })

    it('does not render the chart action menu when withChartMenu is false', () => {
        renderTable({
            chartId: 'performance-channels-voice-agent-table',
            withChartMenu: false,
        })

        expect(
            screen.queryByRole('button', { name: 'Chart actions' }),
        ).not.toBeInTheDocument()
    })

    it('exposes CSV export from the chart action menu instead of the standalone download button', async () => {
        const user = userEvent.setup()
        renderTable({
            chartId: 'performance-channels-voice-agent-table',
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
