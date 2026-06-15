import { renderHook } from '@repo/testing'

import {
    fetchAiAgentOutcomeAsConfigurableTable,
    fetchAiAgentOutcomeMetrics,
    useAiAgentOutcomeMetrics,
} from '../useAiAgentOutcomeMetrics'

jest.mock('pages/aiAgent/hooks/useAiAgentStatsFilters', () => ({
    useAiAgentStatsFilters: jest.fn(),
}))
jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock(
    'domains/reporting/models/queryFactories/ai-agent-insights/aiAgentOutcomeQueryFactories',
    () => ({
        buildAiAgentOutcomeBreakdownQuery: jest.fn(() => ({ query: 'built' })),
    }),
)
jest.mock('domains/reporting/hooks/common/utils', () => ({
    getCsvFileNameWithDates: jest.fn(() => 'ai_agent_outcome_table.csv'),
}))
jest.mock('@repo/reporting', () => ({
    formatMetricValue: jest.fn((v: number | null) => String(v ?? '')),
}))
jest.mock('utils/file', () => ({
    createCsv: jest.fn(() => 'csv-content'),
}))

const mockUseAiAgentStatsFilters = jest.requireMock(
    'pages/aiAgent/hooks/useAiAgentStatsFilters',
).useAiAgentStatsFilters as jest.Mock

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockCreateCsv = jest.requireMock('utils/file').createCsv as jest.Mock

const mockBuildOutcomeQuery = jest.requireMock(
    'domains/reporting/models/queryFactories/ai-agent-insights/aiAgentOutcomeQueryFactories',
).buildAiAgentOutcomeBreakdownQuery as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'

const allData = [
    {
        aiOutcomeCustomField: 'Close::With message',
        aiAgentRole: 'ai-agent-support',
        ticketCount: 100,
    },
    {
        aiOutcomeCustomField: 'Close::With message',
        aiAgentRole: 'ai-agent-sales',
        ticketCount: 40,
    },
    {
        aiOutcomeCustomField: 'Handover::With message',
        aiAgentRole: 'ai-agent-support',
        ticketCount: 10,
    },
]

describe('useAiAgentOutcomeMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockUseAiAgentStatsFilters.mockReturnValue({
            statsFilters: MOCK_STATS_FILTERS,
            userTimezone: MOCK_TIMEZONE,
        })
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: { allData },
            isFetching: false,
            isError: false,
        })
    })

    it('pivots the single query into one row per outcome with role columns', () => {
        const { result } = renderHook(() => useAiAgentOutcomeMetrics())

        expect(result.current.data).toEqual([
            {
                entity: 'Close::With message',
                allAgents: 140,
                supportAgent: 100,
                shoppingAssistant: 40,
            },
            {
                entity: 'Close::Without message',
                allAgents: null,
                supportAgent: null,
                shoppingAssistant: null,
            },
            {
                entity: 'Handover::With message',
                allAgents: 10,
                supportAgent: 10,
                shoppingAssistant: null,
            },
            {
                entity: 'Handover::Without message',
                allAgents: null,
                supportAgent: null,
                shoppingAssistant: null,
            },
        ])
    })

    it('computes All AI Agents as the sum of the two roles', () => {
        const { result } = renderHook(() => useAiAgentOutcomeMetrics())

        const closedWithMessage = result.current.data.find(
            (row) => row.entity === 'Close::With message',
        )
        expect(closedWithMessage?.allAgents).toBe(140)
    })

    it('reflects loading and error state from the underlying query', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: true,
        })

        const { result } = renderHook(() => useAiAgentOutcomeMetrics())

        expect(result.current.isLoading).toBe(true)
        expect(result.current.isError).toBe(true)
        expect(result.current.loadingStates.ticketCount).toBe(true)
    })

    it('returns all four outcome rows even when the query has no data', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: { allData: [] },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() => useAiAgentOutcomeMetrics())

        expect(result.current.data).toHaveLength(4)
        expect(
            result.current.data.every(
                (row) =>
                    row.allAgents === null &&
                    row.supportAgent === null &&
                    row.shoppingAssistant === null,
            ),
        ).toBe(true)
    })
})

describe('fetchAiAgentOutcomeMetrics', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: { allData },
            isFetching: false,
            isError: false,
        })
    })

    it('builds CSV content with the outcome column and the three role columns', async () => {
        await fetchAiAgentOutcomeMetrics(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        const [headers, firstRow] = mockCreateCsv.mock.calls[0][0]
        expect(headers).toEqual([
            'AI Agent outcome',
            'All AI Agents',
            'AI Support Agent',
            'AI Shopping assistant',
        ])
        expect(firstRow[0]).toBe('Closed with a message')
    })

    it('returns the generated file under the dated file name', async () => {
        const result = await fetchAiAgentOutcomeMetrics(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result.fileName).toBe('ai_agent_outcome_table.csv')
        expect(result.files[result.fileName]).toBe('csv-content')
    })

    it('configurable-table wrapper forwards filters and timezone to the query factory', async () => {
        await fetchAiAgentOutcomeAsConfigurableTable(
            null,
            null,
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            // granularity is unused by this fetch
            'day' as never,
        )

        expect(mockBuildOutcomeQuery).toHaveBeenCalledWith(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )
    })
})
