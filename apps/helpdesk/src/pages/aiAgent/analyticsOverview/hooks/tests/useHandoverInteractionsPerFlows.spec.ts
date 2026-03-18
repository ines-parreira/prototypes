import { renderHook } from '@testing-library/react'

import {
    fetchHandoverInteractionsPerFlows,
    useHandoverInteractionsPerFlows,
} from '../useHandoverInteractionsPerFlows'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension', () => ({
    useStatsMetricPerDimension: jest.fn(),
    fetchStatsMetricPerDimension: jest.fn(),
}))
jest.mock('domains/reporting/models/scopes/flowDataset', () => ({
    flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2: jest.fn(),
}))

const mockUseStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).useStatsMetricPerDimension as jest.Mock

const mockFetchStatsMetricPerDimension = jest.requireMock(
    'domains/reporting/hooks/useStatsMetricPerDimension',
).fetchStatsMetricPerDimension as jest.Mock

const mockQueryFactory = jest.requireMock(
    'domains/reporting/models/scopes/flowDataset',
).flowDatasetHandoverInteractionsPerFlowsQueryFactoryV2 as jest.Mock

const MOCK_STATS_FILTERS = {
    period: {
        start_datetime: '2024-01-01T00:00:00Z',
        end_datetime: '2024-01-31T23:59:59Z',
    },
}
const MOCK_TIMEZONE = 'UTC'

const defaultAllValues = [
    { dimension: 'flow-seed-10', value: 80, decile: null },
    { dimension: 'flow-seed-25', value: 45, decile: null },
    { dimension: 'flow-seed-6', value: 30, decile: null },
    { dimension: 'flow-seed-9', value: 20, decile: null },
]

describe('useHandoverInteractionsPerFlows', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue({})
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
            useHandoverInteractionsPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('returns the result from useStatsMetricPerDimension', () => {
        const { result } = renderHook(() =>
            useHandoverInteractionsPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
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
            useHandoverInteractionsPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
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
            useHandoverInteractionsPerFlows(MOCK_STATS_FILTERS, MOCK_TIMEZONE),
        )

        expect(result.current.isError).toBe(true)
    })
})

describe('fetchHandoverInteractionsPerFlows', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        mockQueryFactory.mockReturnValue({})
        mockFetchStatsMetricPerDimension.mockResolvedValue({
            data: { allValues: defaultAllValues },
            isFetching: false,
            isError: false,
        })
    })

    it('calls the query factory with filters and timezone', async () => {
        await fetchHandoverInteractionsPerFlows(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(mockQueryFactory).toHaveBeenCalledWith({
            filters: MOCK_STATS_FILTERS,
            timezone: MOCK_TIMEZONE,
        })
    })

    it('returns the result from fetchStatsMetricPerDimension', async () => {
        const result = await fetchHandoverInteractionsPerFlows(
            MOCK_STATS_FILTERS,
            MOCK_TIMEZONE,
        )

        expect(result?.data?.allValues).toEqual(defaultAllValues)
    })
})
