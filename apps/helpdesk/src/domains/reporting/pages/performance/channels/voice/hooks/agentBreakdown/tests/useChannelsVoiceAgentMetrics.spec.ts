import { assumeMock, renderHook } from '@repo/testing'

import type { User } from 'config/types/user'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import {
    fetchEntityMetrics,
    useEntityMetrics,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { ReportingGranularity } from 'domains/reporting/models/types'
import {
    fetchChannelsVoiceAgentAsConfigurableTable,
    fetchChannelsVoiceAgentMetrics,
    useChannelsVoiceAgentMetrics,
} from 'domains/reporting/pages/performance/channels/voice/hooks/agentBreakdown/useChannelsVoiceAgentMetrics'
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
    totalCalls: {},
    inboundAnswered: {},
    inboundMissed: {},
    inboundTransferred: {},
    inboundDeclined: {},
    outbound: {},
    averageTalkTime: {},
})

const emptyLoadingStates = () => ({
    totalCalls: false,
    inboundAnswered: false,
    inboundMissed: false,
    inboundTransferred: false,
    inboundDeclined: false,
    outbound: false,
    averageTalkTime: false,
})

describe('useChannelsVoiceAgentMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseStatsFilters.mockReturnValue({
            cleanStatsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
            granularity: ReportingGranularity.Day,
        })
        mockGetFilteredAgents.mockReturnValue(MOCK_AGENTS)
    })

    it('shows every filtered agent and ignores stats-only ids', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                ...emptyEntityMap(),
                totalCalls: { '1': 10 },
                outbound: { '999': 5 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() => useChannelsVoiceAgentMetrics())

        expect(result.current.data.map((r) => r.entity).sort()).toEqual([
            '1',
            '2',
            '3',
        ])
    })

    it('builds row values by reading each metric map by entity key', () => {
        mockUseEntityMetrics.mockReturnValue({
            data: {
                totalCalls: { '1': 120 },
                inboundAnswered: { '1': 80 },
                inboundMissed: { '1': 10 },
                inboundTransferred: { '1': 12 },
                inboundDeclined: { '1': 5 },
                outbound: { '1': 30 },
                averageTalkTime: { '1': 180 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { result } = renderHook(() => useChannelsVoiceAgentMetrics())

        expect(result.current.data.find((row) => row.entity === '1')).toEqual({
            entity: '1',
            totalCalls: 120,
            inboundAnswered: 80,
            inboundMissed: 10,
            inboundTransferred: 12,
            inboundDeclined: 5,
            outbound: 30,
            averageTalkTime: 180,
        })
    })

    it('propagates isLoading, isError, and loadingStates from useEntityMetrics', () => {
        const loadingStates = {
            ...emptyLoadingStates(),
            totalCalls: true,
        }
        mockUseEntityMetrics.mockReturnValue({
            data: emptyEntityMap(),
            isLoading: true,
            isError: true,
            loadingStates,
        })

        const { result } = renderHook(() => useChannelsVoiceAgentMetrics())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(true)
        expect(result.current.loadingStates).toBe(loadingStates)
    })
})

describe('fetchChannelsVoiceAgentMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('returns an empty CSV when there are no known agents', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: emptyEntityMap(),
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } = await fetchChannelsVoiceAgentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            [],
        )

        expect(files[fileName]).toBe('')
    })

    it('writes the header row with the agent label and every metric column label', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: { ...emptyEntityMap(), totalCalls: { '1': 1 } },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } = await fetchChannelsVoiceAgentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_AGENTS,
        )

        const [headerLine] = files[fileName].split('\r\n')
        expect(headerLine).toBe(
            [
                '"Agent"',
                '"Total calls"',
                '"Inbound answered"',
                '"Inbound missed"',
                '"Inbound transfers"',
                '"Inbound declined"',
                '"Outbound calls"',
                '"Average talk time"',
            ].join(','),
        )
    })

    it('writes humanized names and metric-format-aware values into data rows', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                totalCalls: { '1': 2700 },
                inboundAnswered: { '1': 1800 },
                inboundMissed: { '1': 50 },
                inboundTransferred: { '1': 12 },
                inboundDeclined: { '1': 5 },
                outbound: { '1': 900 },
                averageTalkTime: { '1': 3600 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } = await fetchChannelsVoiceAgentMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_AGENTS,
        )

        const [, dataLine] = files[fileName].split('\r\n')
        expect(dataLine).toBe(
            [
                '"Alice Anderson"',
                '"2,700"',
                '"1,800"',
                '"50"',
                '"12"',
                '"5"',
                '"900"',
                '"1h"',
            ].join(','),
        )
    })

    it('sorts CSV rows by humanized agent name', async () => {
        mockFetchEntityMetrics.mockResolvedValue({
            data: {
                ...emptyEntityMap(),
                totalCalls: { '3': 10, '1': 20, '2': 30 },
            },
            isLoading: false,
            isError: false,
            loadingStates: emptyLoadingStates(),
        })

        const { fileName, files } = await fetchChannelsVoiceAgentMetrics(
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

describe('fetchChannelsVoiceAgentAsConfigurableTable', () => {
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
        const result = await fetchChannelsVoiceAgentAsConfigurableTable(
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
