import { assumeMock, renderHook } from '@repo/testing'

import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentDecreaseInResolutionTime'
import {
    fetchDecreaseInResolutionTimePerStore,
    useDecreaseInResolutionTimePerStore,
} from '../useDecreaseInResolutionTimePerStore'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension')
jest.mock('domains/reporting/models/scopes/aiAgentDecreaseInResolutionTime')

const mockUseStatsMetricPerDimension = assumeMock(useStatsMetricPerDimension)
const mockFetchStatsMetricPerDimension = assumeMock(
    fetchStatsMetricPerDimension,
)
const mockQueryFactory = assumeMock(
    dynamicAiAgentDecreaseInResolutionTimeQueryFactoryV2,
)

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = {
    metricName: 'ai-agent-dynamic-decrease-in-resolution-time',
    dimensions: ['storeIntegrationId'],
} as any

const defaultAllValues = [
    { dimension: '1', value: 7200, decile: null },
    { dimension: '2', value: 3600, decile: null },
]

describe('useDecreaseInResolutionTimePerStore', () => {
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

    it('calls the query factory with filters, timezone, and storeIntegrationId dimension', () => {
        renderHook(() =>
            useDecreaseInResolutionTimePerStore(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['storeIntegrationId'],
        })
    })

    it('passes the query result to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useDecreaseInResolutionTimePerStore(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('returns the result from useStatsMetricPerDimension', () => {
        const { result } = renderHook(() =>
            useDecreaseInResolutionTimePerStore(
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
            useDecreaseInResolutionTimePerStore(
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
            useDecreaseInResolutionTimePerStore(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchDecreaseInResolutionTimePerStore', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: {
                allValues: defaultAllValues,
                value: null,
                decile: null,
                allData: [],
            },
            isFetching: false,
            isError: false,
        })
    })

    it('calls the query factory with filters, timezone, and storeIntegrationId dimension', async () => {
        await fetchDecreaseInResolutionTimePerStore(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
            dimensions: ['storeIntegrationId'],
        })
    })

    it('passes the query result to fetchStatsMetricPerDimension', async () => {
        await fetchDecreaseInResolutionTimePerStore(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchDecreaseInResolutionTimePerStore(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result?.data?.allValues).toEqual(defaultAllValues)
    })
})
