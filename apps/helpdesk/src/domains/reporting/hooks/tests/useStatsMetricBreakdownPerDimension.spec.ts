import { assumeMock, renderHook } from '@repo/testing'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { DimensionBreakdownFactory } from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import {
    fetchStatsMetricBreakdownPerDimension,
    useStatsMetricBreakdownPerDimension,
} from 'domains/reporting/hooks/useStatsMetricBreakdownPerDimension'
import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/useStatsMetricPerDimension')

const useStatsMetricPerDimensionMock = assumeMock(useStatsMetricPerDimension)
const fetchStatsMetricPerDimensionMock = assumeMock(
    fetchStatsMetricPerDimension,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2026-05-01T00:00:00Z',
        end_datetime: '2026-05-28T00:00:00Z',
    },
}
const timezone = 'UTC'

const builtQuery: BuiltQuery = {
    measures: [],
    scope: MetricScope.TicketsCreated,
    metricName: 'sentinel-built-query' as MetricName,
}

const createQueryFactory = () => {
    const factory = jest.fn() as jest.MockedFunction<
        DimensionBreakdownFactory<'channel'>
    >
    factory.mockReturnValue(builtQuery)
    return factory
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useStatsMetricBreakdownPerDimension', () => {
    it('invokes the query factory with the provided dimension', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useStatsMetricBreakdownPerDimension(
                queryFactory,
                statsFilters,
                timezone,
                'channel',
            ),
        )

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            dimensions: ['channel'],
        })
    })

    it('calls useStatsMetricPerDimension with the built query and the dimension', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useStatsMetricBreakdownPerDimension(
                queryFactory,
                statsFilters,
                timezone,
                'channel',
            ),
        )

        expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
            builtQuery,
            'channel',
        )
    })

    it('returns the value produced by useStatsMetricPerDimension', () => {
        const queryFactory = createQueryFactory()
        const hookResult = { data: null, isFetching: false, isError: false }
        useStatsMetricPerDimensionMock.mockReturnValue(hookResult)

        const { result } = renderHook(() =>
            useStatsMetricBreakdownPerDimension(
                queryFactory,
                statsFilters,
                timezone,
                'channel',
            ),
        )

        expect(result.current).toBe(hookResult)
    })
})

describe('fetchStatsMetricBreakdownPerDimension', () => {
    it('invokes the query factory with the provided dimension', async () => {
        const queryFactory = createQueryFactory()
        fetchStatsMetricPerDimensionMock.mockResolvedValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        await fetchStatsMetricBreakdownPerDimension(
            queryFactory,
            statsFilters,
            timezone,
            'channel',
        )

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            dimensions: ['channel'],
        })
    })

    it('calls fetchStatsMetricPerDimension with the built query and the dimension', async () => {
        const queryFactory = createQueryFactory()
        fetchStatsMetricPerDimensionMock.mockResolvedValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        await fetchStatsMetricBreakdownPerDimension(
            queryFactory,
            statsFilters,
            timezone,
            'channel',
        )

        expect(fetchStatsMetricPerDimensionMock).toHaveBeenCalledWith(
            builtQuery,
            'channel',
        )
    })

    it('returns the value produced by fetchStatsMetricPerDimension', async () => {
        const queryFactory = createQueryFactory()
        const fetchResult = { data: null, isFetching: false, isError: false }
        fetchStatsMetricPerDimensionMock.mockResolvedValue(fetchResult)

        await expect(
            fetchStatsMetricBreakdownPerDimension(
                queryFactory,
                statsFilters,
                timezone,
                'channel',
            ),
        ).resolves.toBe(fetchResult)
    })
})
