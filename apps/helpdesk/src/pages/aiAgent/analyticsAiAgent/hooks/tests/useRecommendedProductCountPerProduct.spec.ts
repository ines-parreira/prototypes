import { renderHook } from '@repo/testing'

import {
    fetchTimesRecommendedPerProduct,
    useTimesRecommendedPerProduct,
} from '../useRecommendedProductCountPerProduct'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/aiSalesAgentActivity', () => ({
    aiSalesRecommendedProductCountPerProductQueryFactoryV2: jest.fn(),
}))

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/aiSalesAgentActivity',
).aiSalesRecommendedProductCountPerProductQueryFactoryV2 as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = {
    metricName: 'ai-agent-recommended-product-count-per-product',
}
const defaultAllValues = [
    { dimension: '123', value: 100, decile: null },
    { dimension: '456', value: 50, decile: null },
]

describe('useRecommendedProductCountPerProduct', () => {
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

    it('calls the query factory with period filters and timezone', () => {
        renderHook(() =>
            useTimesRecommendedPerProduct(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: { period: MOCK_STATS_FILTERS.period },
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query result to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useTimesRecommendedPerProduct(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('returns the result from useStatsMetricPerDimension', () => {
        const { result } = renderHook(() =>
            useTimesRecommendedPerProduct(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
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
            useTimesRecommendedPerProduct(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
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
            useTimesRecommendedPerProduct(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchRecommendedProductCountPerProduct', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: { allValues: defaultAllValues },
            isFetching: false,
            isError: false,
        })
    })

    it('calls the query factory with period filters and timezone', async () => {
        await fetchTimesRecommendedPerProduct(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: { period: MOCK_STATS_FILTERS.period },
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query result to fetchStatsMetricPerDimension', async () => {
        await fetchTimesRecommendedPerProduct(MOCK_STATS_FILTERS, MOCK_TIMEZONE)

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchTimesRecommendedPerProduct(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result?.data?.allValues).toEqual(defaultAllValues)
    })
})
