import { renderHook } from '@testing-library/react'

import {
    fetchHandoverInteractionsPerAllAgentsIntent,
    useHandoverInteractionsPerAllAgentsIntent,
} from '../useHandoverInteractionsPerAllAgentsIntent'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/handoverInteractions', () => ({
    aiAgentHandoverInteractionsPerIntentQueryFactoryV2: jest.fn(),
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

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/handoverInteractions',
).aiAgentHandoverInteractionsPerIntentQueryFactoryV2 as jest.Mock

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
const MOCK_QUERY = { metricName: 'ai-agent-handover-interactions-per-intent' }

const defaultAllValues = [
    { dimension: 'Billing :: Refund', value: 30, decile: null },
    { dimension: 'Shipping :: Status', value: 15, decile: null },
]

describe('useHandoverInteractionsPerAllAgentsIntent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: {
                value: null,
                decile: null,
                allData: [],
                allValues: defaultAllValues,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('calls buildIntentFilters with the provided intentCustomFieldId', () => {
        renderHook(() =>
            useHandoverInteractionsPerAllAgentsIntent(
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
            useHandoverInteractionsPerAllAgentsIntent(
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

    it('passes the query result to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useHandoverInteractionsPerAllAgentsIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('returns the result from useStatsMetricPerDimension', () => {
        const { result } = renderHook(() =>
            useHandoverInteractionsPerAllAgentsIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        expect(result.current.data?.allValues).toEqual(defaultAllValues)
        expect(result.current.isFetching).toBe(false)
        expect(result.current.isError).toBe(false)
    })

    it('returns isFetching true when data is loading', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useHandoverInteractionsPerAllAgentsIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isError true when the request fails', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: false,
            isError: true,
        })

        const { result } = renderHook(() =>
            useHandoverInteractionsPerAllAgentsIntent(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
                MOCK_INTENT_CUSTOM_FIELD_ID,
            ),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchHandoverInteractionsPerAllAgentsIntent', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: { allValues: defaultAllValues },
            isFetching: false,
            isError: false,
        })
    })

    it('calls buildIntentFilters with the provided intentCustomFieldId', async () => {
        await fetchHandoverInteractionsPerAllAgentsIntent(
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
        await fetchHandoverInteractionsPerAllAgentsIntent(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query result to fetchStatsMetricPerDimension', async () => {
        await fetchHandoverInteractionsPerAllAgentsIntent(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchHandoverInteractionsPerAllAgentsIntent(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
            MOCK_INTENT_CUSTOM_FIELD_ID,
        )

        expect(result?.data?.allValues).toEqual(defaultAllValues)
    })
})
