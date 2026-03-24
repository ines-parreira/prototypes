import { renderHook } from '@testing-library/react'

import {
    fetchAiAgentCostSavedPerChannel,
    useAiAgentCostSavedPerChannel,
} from '../useAiAgentCostSavedPerChannel'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
    mapMetricValues: jest.fn((metric, transform) => ({
        ...metric,
        data: metric.data
            ? {
                  ...metric.data,
                  value: transform(metric.data.value),
                  allValues: (metric.data.allValues ?? []).map(
                      (v: {
                          dimension: string
                          value: number | null
                          decile: null
                      }) => ({
                          ...v,
                          value: transform(v.value),
                      }),
                  ),
              }
            : null,
    })),
}))
jest.mock(
    'domains/reporting/models/scopes/aiAgentAutomatedInteractions',
    () => ({
        aiAgentAutomatedInteractionsPerChannelQueryFactoryV2: jest.fn(),
    }),
)
jest.mock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
    () => ({
        useMoneySavedPerInteractionWithAutomate: jest.fn(),
    }),
)
jest.mock('pages/automate/automate-metrics/constants', () => ({
    AGENT_COST_PER_TICKET: 3.1,
}))

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockUseMoneySaved = jest.requireMock(
    'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate',
).useMoneySavedPerInteractionWithAutomate as jest.Mock

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/aiAgentAutomatedInteractions',
).aiAgentAutomatedInteractionsPerChannelQueryFactoryV2 as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = { metricName: 'automated-interactions-per-channel' }
const COST_PER_INTERACTION = 3.1

const rawAllValues = [
    { dimension: 'email', value: 100, decile: null },
    { dimension: 'chat', value: 50, decile: null },
]

describe('useAiAgentCostSavedPerChannel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockUseMoneySaved.mockReturnValue(COST_PER_INTERACTION)
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: rawAllValues,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('calls the query factory with filters and timezone', () => {
        renderHook(() =>
            useAiAgentCostSavedPerChannel(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('multiplies each entity value by costSavedPerInteraction', () => {
        const { result } = renderHook(() =>
            useAiAgentCostSavedPerChannel(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        const allValues = result.current.data?.allValues ?? []
        expect(allValues.find((v) => v.dimension === 'email')?.value).toBe(
            100 * COST_PER_INTERACTION,
        )
        expect(allValues.find((v) => v.dimension === 'chat')?.value).toBe(
            50 * COST_PER_INTERACTION,
        )
    })

    it('returns null for null values without multiplying', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [{ dimension: 'email', value: null, decile: null }],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useAiAgentCostSavedPerChannel(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        const emailValue = result.current.data?.allValues?.find(
            (v) => v.dimension === 'email',
        )
        expect(emailValue?.value).toBeNull()
    })

    it('returns isFetching true when data is loading', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useAiAgentCostSavedPerChannel(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(result.current.isFetching).toBe(true)
    })
})

describe('fetchAiAgentCostSavedPerChannel', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: rawAllValues,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchAiAgentCostSavedPerChannel(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            COST_PER_INTERACTION,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('multiplies each entity value by the provided cost per interaction', async () => {
        const result = await fetchAiAgentCostSavedPerChannel(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            COST_PER_INTERACTION,
        )

        const allValues = result.data?.allValues ?? []
        expect(allValues.find((v) => v.dimension === 'email')?.value).toBe(
            100 * COST_PER_INTERACTION,
        )
    })

    it('uses AGENT_COST_PER_TICKET as default cost per interaction', async () => {
        const result = await fetchAiAgentCostSavedPerChannel(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        const allValues = result.data?.allValues ?? []
        expect(allValues.find((v) => v.dimension === 'email')?.value).toBe(
            100 * 3.1,
        )
    })
})
