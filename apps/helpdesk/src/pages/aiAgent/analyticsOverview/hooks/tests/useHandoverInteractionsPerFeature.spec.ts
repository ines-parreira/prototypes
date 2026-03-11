import { renderHook } from '@testing-library/react'

import {
    fetchHandoverInteractionsPerFeature,
    useHandoverInteractionsPerFeature,
} from '../useHandoverInteractionsPerFeature'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/handoverInteractions', () => ({
    handoverInteractionsPerFeatureQueryFactoryV2: jest.fn(),
}))

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockHandoverInteractionsPerFeatureQueryFactoryV2 = jest.requireMock(
    'domains/reporting/models/scopes/handoverInteractions',
).handoverInteractionsPerFeatureQueryFactoryV2 as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = { metricName: 'handover-interactions-per-feature' }

const defaultAllValues = [
    { dimension: 'ai-agent', value: 42, decile: null },
    { dimension: 'flow', value: 18, decile: null },
    { dimension: 'article-recommendation', value: 7, decile: null },
    { dimension: 'order-management', value: 3, decile: null },
]

describe('useHandoverInteractionsPerFeature', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockHandoverInteractionsPerFeatureQueryFactoryV2.mockReturnValue(
            MOCK_QUERY,
        )
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

    it('calls the query factory with filters and timezone', () => {
        renderHook(() =>
            useHandoverInteractionsPerFeature(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(
            mockHandoverInteractionsPerFeatureQueryFactoryV2,
        ).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query result to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useHandoverInteractionsPerFeature(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('returns the result from useStatsMetricPerDimension', () => {
        const { result } = renderHook(() =>
            useHandoverInteractionsPerFeature(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
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
            useHandoverInteractionsPerFeature(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
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
            useHandoverInteractionsPerFeature(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(result.current.isError).toBe(true)
    })

    it('exposes per-feature values through allValues', () => {
        const { result } = renderHook(() =>
            useHandoverInteractionsPerFeature(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        const allValues = result.current.data?.allValues ?? []
        const aiAgent = allValues.find((v) => v.dimension === 'ai-agent')
        const flows = allValues.find((v) => v.dimension === 'flow')
        const articleRec = allValues.find(
            (v) => v.dimension === 'article-recommendation',
        )
        const orderMgmt = allValues.find(
            (v) => v.dimension === 'order-management',
        )

        expect(aiAgent?.value).toBe(42)
        expect(flows?.value).toBe(18)
        expect(articleRec?.value).toBe(7)
        expect(orderMgmt?.value).toBe(3)
    })
})

describe('fetchHandoverInteractionsPerFeature', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockHandoverInteractionsPerFeatureQueryFactoryV2.mockReturnValue(
            MOCK_QUERY,
        )
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: {
                allValues: defaultAllValues,
            },
        })
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchHandoverInteractionsPerFeature(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(
            mockHandoverInteractionsPerFeatureQueryFactoryV2,
        ).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query result to fetchStatsMetricPerDimension', async () => {
        await fetchHandoverInteractionsPerFeature(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchHandoverInteractionsPerFeature(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result?.data?.allValues).toEqual(defaultAllValues)
    })
})
