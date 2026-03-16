import { renderHook } from '@testing-library/react'

import {
    fetchHandoverInteractionsPerOrderManagementType,
    useHandoverInteractionsPerOrderManagementType,
} from '../useHandoverInteractionsPerOrderManagementType'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/handoverInteractions', () => ({
    handoverInteractionsPerOrderManagementTypeQueryFactoryV2: jest.fn(),
}))

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/handoverInteractions',
).handoverInteractionsPerOrderManagementTypeQueryFactoryV2 as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'
const MOCK_QUERY = {
    metricName: 'handover-interactions-per-order-management-type',
}

const MOCK_METRIC = {
    data: {
        value: 42,
        decile: null,
        allData: [],
        allValues: [
            {
                dimension: 'cancel_order',
                value: 42,
                decile: null,
            },
        ],
    },
    isFetching: false,
    isError: false,
}

describe('useHandoverInteractionsPerOrderManagementType', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockUseStatsMetricPerDimension.mockReturnValue(MOCK_METRIC)
    })

    it('calls the query factory with filters and timezone', () => {
        renderHook(() =>
            useHandoverInteractionsPerOrderManagementType(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('returns the result from useStatsMetricPerDimension', () => {
        const { result } = renderHook(() =>
            useHandoverInteractionsPerOrderManagementType(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(result.current).toEqual(MOCK_METRIC)
    })

    it('returns isFetching true when data is loading', () => {
        mockUseStatsMetricPerDimension.mockReturnValue({
            data: null,
            isFetching: true,
            isError: false,
        })

        const { result } = renderHook(() =>
            useHandoverInteractionsPerOrderManagementType(
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
            useHandoverInteractionsPerOrderManagementType(
                MOCK_STATS_FILTERS,
                MOCK_TIMEZONE,
            ),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchHandoverInteractionsPerOrderManagementType', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue(MOCK_QUERY)
        mockFetchStatsMetricPerDimension.mockResolvedValue(MOCK_METRIC)
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchHandoverInteractionsPerOrderManagementType(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchHandoverInteractionsPerOrderManagementType(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result).toEqual(MOCK_METRIC)
    })
})
