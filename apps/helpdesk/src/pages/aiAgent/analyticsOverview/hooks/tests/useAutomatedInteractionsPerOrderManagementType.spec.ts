import { renderHook } from '@testing-library/react'

import {
    fetchAutomatedInteractionsPerOrderManagementType,
    useAutomatedInteractionsPerOrderManagementType,
} from '../useAutomatedInteractionsPerOrderManagementType'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock(
    'domains/reporting/models/scopes/overallAutomatedInteractions',
    () => ({
        automatedInteractionsPerOrderManagementTypeQueryFactoryV2: jest.fn(),
    }),
)

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/overallAutomatedInteractions',
).automatedInteractionsPerOrderManagementTypeQueryFactoryV2 as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = {
    metricName: 'ai-agent-automated-interactions-per-order-management-type',
}

const defaultAllValues = [
    { dimension: 'cancel_order', value: 10, decile: null },
    { dimension: 'track_order', value: 25, decile: null },
    { dimension: 'loop_returns_started', value: 5, decile: null },
    { dimension: 'automated_response_started', value: 8, decile: null },
]

describe('useAutomatedInteractionsPerOrderManagementType', () => {
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

    it('calls the query factory with filters and timezone', () => {
        renderHook(() =>
            useAutomatedInteractionsPerOrderManagementType(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query result to useStatsMetricPerDimension', () => {
        renderHook(() =>
            useAutomatedInteractionsPerOrderManagementType(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockUseStatsMetricPerDimension).toHaveBeenCalledWith(MOCK_QUERY)
    })

    it('returns the result from useStatsMetricPerDimension', () => {
        const { result } = renderHook(() =>
            useAutomatedInteractionsPerOrderManagementType(
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
            useAutomatedInteractionsPerOrderManagementType(
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
            useAutomatedInteractionsPerOrderManagementType(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchAutomatedInteractionsPerOrderManagementType', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: { allValues: defaultAllValues },
            isFetching: false,
            isError: false,
        })
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchAutomatedInteractionsPerOrderManagementType(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('passes the query result to fetchStatsMetricPerDimension', async () => {
        await fetchAutomatedInteractionsPerOrderManagementType(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockFetchStatsMetricPerDimension).toHaveBeenCalledWith(
            MOCK_QUERY,
        )
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchAutomatedInteractionsPerOrderManagementType(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result?.data?.allValues).toEqual(defaultAllValues)
    })
})
