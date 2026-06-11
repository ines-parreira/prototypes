import { assumeMock, renderHook } from '@repo/testing'

import type { User } from 'config/types/user'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    fetchPerformanceChannelsEmailAgentAsConfigurableTable,
    fetchPerformanceChannelsEmailAgentMetrics,
    usePerformanceChannelsEmailAgentMetrics,
} from 'domains/reporting/pages/performance/channels/email/hooks/agentBreakdown/usePerformanceChannelsEmailAgentMetrics'
import { getFilteredAgents } from 'domains/reporting/state/ui/stats/agentPerformanceSlice'

jest.mock(
    'domains/reporting/hooks/support-performance/useStatsFilters',
    () => ({
        useStatsFilters: jest.fn(),
    }),
)
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useEntityMetrics: jest.fn(),
    fetchEntityMetrics: jest.fn(),
    assembleEntityRows: jest.fn((entities, buildRow) => entities.map(buildRow)),
}))
jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(
        (_period, name) => `2024-01-01_2024-01-31-${name}.csv`,
    ),
}))
jest.mock('domains/reporting/state/ui/stats/agentPerformanceSlice', () => ({
    ...jest.requireActual(
        'domains/reporting/state/ui/stats/agentPerformanceSlice',
    ),
    getFilteredAgents: jest.fn(() => []),
}))

const mockUseStatsFilters = assumeMock(useStatsFilters)
const mockUseEntityMetrics = assumeMock(useEntityMetrics)
const mockFetchEntityMetrics = assumeMock(fetchEntityMetrics)
const mockGetFilteredAgents = assumeMock(getFilteredAgents)

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'

const buildAgent = (id: number, name: string): User =>
    ({ id, name }) as unknown as User

const MOCK_AGENTS: User[] = [
    buildAgent(1, 'Alice Anderson'),
    buildAgent(2, 'Bob Brown'),
    buildAgent(3, 'Charlie Clark'),
]

const emptyEntityMap = () => ({
    averageCsat: {},
    resolutionTime: {},
    messagesPerTicket: {},
    firstResponseTime: {},
    humanResponseTimeAfterAiHandoff: {},
    createdTickets: {},
    closedTickets: {},
    ticketsReplied: {},
    messagesSent: {},
})

const emptyLoadingStates = () => ({
    averageCsat: false,
    resolutionTime: false,
    messagesPerTicket: false,
    firstResponseTime: false,
    humanResponseTimeAfterAiHandoff: false,
    createdTickets: false,
    closedTickets: false,
    ticketsReplied: false,
    messagesSent: false,
})

describe('usePerformanceChannelsEmailAgentMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
        mockGetFilteredAgents.mockReturnValue(MOCK_AGENTS)
    })

    it('shows every agent from the filtered list and ignores stats-only ids', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { '1': 4.5 },
                createdTickets: { '999': 100 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceChannelsEmailAgentMetrics(),
        )

        expect(result.current.data.map((r) => r.entity).sort()).toEqual([
            '1',
            '2',
            '3',
        ])
    })

    it('keeps agents whose metrics are all null (no data filter)', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                averageCsat: { '1': 4.5, '2': null },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceChannelsEmailAgentMetrics(),
        )

        const entities = result.current.data.map((r) => r.entity)
        expect(entities).toContain('1')
        expect(entities).toContain('2')
    })

    it('builds row values by reading each metric map by entity key', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                averageCsat: { '1': 4.5 },
                resolutionTime: { '1': 3600 },
                messagesPerTicket: { '1': 3.2 },
                firstResponseTime: { '1': 600 },
                humanResponseTimeAfterAiHandoff: { '1': 900 },
                createdTickets: { '1': 2700 },
                closedTickets: { '1': 2500 },
                ticketsReplied: { '1': 2200 },
                messagesSent: { '1': 8000 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() =>
            usePerformanceChannelsEmailAgentMetrics(),
        )

        expect(result.current.data.find((row) => row.entity === '1')).toEqual({
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
        })
    })

    it('propagates isLoading, isError, and loadingStates from useEntityMetrics', () => {
        const loadingStates = {
            ...emptyLoadingStates(),
            averageCsat: true,
        }
        mockUseEntityMetrics.mockReturnValue({
            data: emptyEntityMap(),
            isLoading: true,
            isError: true,
            loadingStates,
        })

        const { result } = renderHook(() =>
            usePerformanceChannelsEmailAgentMetrics(),
        )

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(true)
        expect(result.current.loadingStates).toBe(loadingStates)
    })
})

describe('fetchPerformanceChannelsEmailAgentMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns an empty CSV when there are no known agents and no stats data', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: emptyEntityMap(),
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceChannelsEmailAgentMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                [],
            )

        expect(files[fileName]).toBe('')
    })

    it('writes a header row with the agent label followed by every metric column label', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                createdTickets: { '1': 1 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceChannelsEmailAgentMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_AGENTS,
            )

        const [headerLine] = files[fileName].split('\r\n')
        expect(headerLine).toBe(
            [
                '"Agent"',
                '"Email tickets created"',
                '"Average CSAT"',
                '"Resolution time"',
                '"First response time"',
                '"Messages per ticket"',
                '"Human response time after AI handoff"',
                '"Closed tickets"',
                '"Tickets replied"',
                '"Messages sent"',
            ].join(','),
        )
    })

    it('writes humanized agent names and metric-format-aware values into data rows', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                averageCsat: { '1': 4.5 },
                resolutionTime: { '1': 3600 },
                messagesPerTicket: { '1': 3.2 },
                firstResponseTime: { '1': 600 },
                humanResponseTimeAfterAiHandoff: { '1': 900 },
                createdTickets: { '1': 2700 },
                closedTickets: { '1': 2500 },
                ticketsReplied: { '1': 2200 },
                messagesSent: { '1': 8000 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceChannelsEmailAgentMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_AGENTS,
            )

        const [, dataLine] = files[fileName].split('\r\n')
        expect(dataLine).toBe(
            [
                '"Alice Anderson"',
                '"2,700"',
                '"4.5"',
                '"1h"',
                '"10m"',
                '"3.2"',
                '"15m"',
                '"2,500"',
                '"2,200"',
                '"8,000"',
            ].join(','),
        )
    })

    it('sorts CSV rows by humanized agent name', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                createdTickets: { '3': 10, '1': 20, '2': 30 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } =
            await fetchPerformanceChannelsEmailAgentMetrics(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_AGENTS,
            )

        const dataLines = files[fileName].split('\r\n').slice(1)
        expect(dataLines.map((line) => line.split(',')[0])).toEqual([
            '"Alice Anderson"',
            '"Bob Brown"',
            '"Charlie Clark"',
        ])
    })
})

describe('fetchPerformanceChannelsEmailAgentAsConfigurableTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockGetFilteredAgents.mockReturnValue(MOCK_AGENTS)
        mockFetchEntityMetrics.mockResolvedValue({
            data: emptyEntityMap(),
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })
    })

    it('reads agents from the store, forwards filters and timezone, and returns files', async () => {
        const result =
            await fetchPerformanceChannelsEmailAgentAsConfigurableTable(
                null,
                null,
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                ReportingGranularity.Day,
            )

        expect(mockGetFilteredAgents).toHaveBeenCalled()
        expect(mockFetchEntityMetrics).toHaveBeenCalledWith(
            expect.any(Object),
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )
        expect(result.files).toBeDefined()
    })
})
