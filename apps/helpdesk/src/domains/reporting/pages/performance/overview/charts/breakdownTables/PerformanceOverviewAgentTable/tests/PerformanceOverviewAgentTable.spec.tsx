import { assumeMock, render } from '@repo/testing'
import { screen, within } from '@testing-library/react'

import type { User } from 'config/types/user'
import { PerformanceOverviewAgentTable } from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable'
import type { PerformanceOverviewEntityMetrics } from 'domains/reporting/pages/performance/overview/config/breakdownTableMetrics'
import { useDownloadPerformanceOverviewAgentData } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData'
import { usePerformanceOverviewAgentMetrics } from 'domains/reporting/pages/performance/overview/hooks/agentBreakdown/usePerformanceOverviewAgentMetrics'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'

jest.mock(
    'domains/reporting/pages/performance/overview/hooks/agentBreakdown/usePerformanceOverviewAgentMetrics',
)
jest.mock(
    'domains/reporting/pages/performance/overview/hooks/agentBreakdown/useDownloadPerformanceOverviewAgentData',
)
jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice', () => ({
    ...jest.requireActual(
        'domains/reporting/state/ui/stats/agentPerformanceSlice',
    ),
    getFilteredAgents: jest.fn(() => []),
}))
jest.mock(
    'domains/reporting/pages/dashboards/ChartsActionMenu/ChartsActionMenu',
    () => ({
        ChartsActionMenu: ({
            chartName,
            exportCsvAction,
        }: {
            chartName: string
            exportCsvAction?: { onClick: () => void }
        }) => (
            <div>
                <button type="button">{`${chartName} chart actions`}</button>
                {exportCsvAction ? (
                    <button type="button" onClick={exportCsvAction.onClick}>
                        {`${chartName} export csv`}
                    </button>
                ) : null}
            </div>
        ),
    }),
)

const mockUsePerformanceOverviewAgentMetrics = assumeMock(
    usePerformanceOverviewAgentMetrics,
)
const mockUseDownloadPerformanceOverviewAgentData = assumeMock(
    useDownloadPerformanceOverviewAgentData,
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

const aliceRow: PerformanceOverviewEntityMetrics = {
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

const bobRow: PerformanceOverviewEntityMetrics = {
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
    mockUseDownloadPerformanceOverviewAgentData.mockReturnValue({
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
    data?: PerformanceOverviewEntityMetrics[]
    loadingStates?: typeof defaultLoadingStates
    chartId?: string
    withChartMenu?: boolean
} = {}) => {
    mockUsePerformanceOverviewAgentMetrics.mockReturnValue({
        data,
        loadingStates,
        isLoading: false,
        isError: false,
    })
    return render(
        <PerformanceOverviewAgentTable
            chartId={chartId}
            withChartMenu={withChartMenu}
        />,
    )
}

describe('PerformanceOverviewAgentTable', () => {
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
        const unknownAgentRow: PerformanceOverviewEntityMetrics = {
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
        mockUseDownloadPerformanceOverviewAgentData.mockReturnValue({
            files: {},
            fileName: '',
            isLoading: true,
        })

        renderTable()

        expect(screen.getByRole('button', { name: /download/i })).toBeDisabled()
    })

    it('renders the chart action menu when chartId and withChartMenu are provided', () => {
        renderTable({
            chartId: 'performance-overview-agent-table',
            withChartMenu: true,
        })

        expect(
            screen.getByRole('button', { name: /agent chart actions/i }),
        ).toBeInTheDocument()
    })

    it('does not render the chart action menu without a chartId', () => {
        renderTable({ withChartMenu: true })

        expect(
            screen.queryByRole('button', { name: /agent chart actions/i }),
        ).not.toBeInTheDocument()
    })

    it('does not render the chart action menu when withChartMenu is false', () => {
        renderTable({
            chartId: 'performance-overview-agent-table',
            withChartMenu: false,
        })

        expect(
            screen.queryByRole('button', { name: /agent chart actions/i }),
        ).not.toBeInTheDocument()
    })

    it('exposes CSV export from the chart action menu instead of the standalone download button', () => {
        renderTable({
            chartId: 'performance-overview-agent-table',
            withChartMenu: true,
        })

        expect(
            screen.getByRole('button', { name: /agent export csv/i }),
        ).toBeInTheDocument()
        expect(
            screen.queryByRole('button', { name: /download/i }),
        ).not.toBeInTheDocument()
    })
})
