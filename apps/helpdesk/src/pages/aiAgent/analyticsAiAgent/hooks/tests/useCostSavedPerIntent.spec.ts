import { renderHook } from '@testing-library/react'

import {
    fetchCostSavedPerIntent,
    useCostSavedPerIntent,
} from '../useCostSavedPerIntent'

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
        aiAgentAutomatedInteractionsPerIntentQueryFactoryV2: jest.fn(),
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
jest.mock('pages/aiAgent/analyticsAiAgent/hooks/intentFilters', () => ({
    buildIntentFilters: jest.fn((filters) => filters),
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
).aiAgentAutomatedInteractionsPerIntentQueryFactoryV2 as jest.Mock

const mockBuildIntentFilters = jest.requireMock(
    'pages/aiAgent/analyticsAiAgent/hooks/intentFilters',
).buildIntentFilters as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_INTENT_CUSTOM_FIELD_ID = 42
const MOCK_QUERY = { metricName: 'ai-agent-automated-interactions-per-intent' }
const COST_PER_INTERACTION = 3.1

const rawAllValues = [
    { dimension: 'Billing :: Refund', value: 100, decile: null },
    { dimension: 'Shipping :: Status', value: 50, decile: null },
]

describe('useCostSavedPerIntent', () => {
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

    it('calls buildIntentFilters with the provided intentCustomFieldId', () => {
        renderHook(() =>
            useCostSavedPerIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        expect(mockBuildIntentFilters).toHaveBeenCalledWith(
            MOCK_STATS_FILTERS,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )
    })

    it('calls the query factory with intent filters and timezone', () => {
        renderHook(() =>
            useCostSavedPerIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('multiplies each entity value by costSavedPerInteraction', () => {
        const { result } = renderHook(() =>
            useCostSavedPerIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        const allValues = result.current.data?.allValues ?? []
        expect(
            allValues.find((v) => v.dimension === 'Billing :: Refund')?.value,
        ).toBe(100 * COST_PER_INTERACTION)
        expect(
            allValues.find((v) => v.dimension === 'Shipping :: Status')?.value,
        ).toBe(50 * COST_PER_INTERACTION)
    })

    it('returns null for null values without multiplying', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: [
                    {
                        dimension: 'Billing :: Refund',
                        value: null,
                        decile: null,
                    },
                ],
            },
            isFetching: false,
            isError: false,
        })

        const { result } = renderHook(() =>
            useCostSavedPerIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        const value = result.current.data?.allValues?.find(
            (v) => v.dimension === 'Billing :: Refund',
        )
        expect(value?.value).toBeNull()
    })

    it('returns isFetching true when data is loading', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useCostSavedPerIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        expect(result.current.isFetching).toBe(true)
    })
})

describe('fetchCostSavedPerIntent', () => {
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

    it('calls buildIntentFilters with the provided intentCustomFieldId', async () => {
        await fetchCostSavedPerIntent(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )

        expect(mockBuildIntentFilters).toHaveBeenCalledWith(
            MOCK_STATS_FILTERS,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )
    })

    it('calls the query factory with intent filters and timezone', async () => {
        await fetchCostSavedPerIntent(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('multiplies each entity value by the provided cost per interaction', async () => {
        const result = await fetchCostSavedPerIntent(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_INTENT_CUSTOM_FIELD_ID,
            COST_PER_INTERACTION,
        )

        const allValues = result.data?.allValues ?? []
        expect(
            allValues.find((v) => v.dimension === 'Billing :: Refund')?.value,
        ).toBe(100 * COST_PER_INTERACTION)
    })

    it('uses AGENT_COST_PER_TICKET as default cost per interaction', async () => {
        const result = await fetchCostSavedPerIntent(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )

        const allValues = result.data?.allValues ?? []
        expect(
            allValues.find((v) => v.dimension === 'Billing :: Refund')?.value,
        ).toBe(100 * 3.1)
    })
})
