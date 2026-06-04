import { assumeMock, renderHook } from '@repo/testing'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { TimeSeriesFactory } from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import {
    fetchStatsMetricTimeSeries,
    fetchStatsMetricTimeSeriesPerDimension,
    useStatsMetricTimeSeries,
    useStatsMetricTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsMetricTimeSeries'
import {
    fetchStatsTimeSeries,
    fetchStatsTimeSeriesPerDimension,
    useStatsTimeSeries,
    useStatsTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/useStatsTimeSeries')

const useStatsTimeSeriesMock = assumeMock(useStatsTimeSeries)
const useStatsTimeSeriesPerDimensionMock = assumeMock(
    useStatsTimeSeriesPerDimension,
)
const fetchStatsTimeSeriesMock = assumeMock(fetchStatsTimeSeries)
const fetchStatsTimeSeriesPerDimensionMock = assumeMock(
    fetchStatsTimeSeriesPerDimension,
)

const statsFilters: StatsFilters = {
    period: {
        start_datetime: '2026-05-01T00:00:00Z',
        end_datetime: '2026-05-28T00:00:00Z',
    },
}
const timezone = 'UTC'
const granularity = ReportingGranularity.Day

const builtQuery: BuiltQuery = {
    measures: [],
    scope: MetricScope.TicketsCreated,
    metricName: 'sentinel-built-query' as MetricName,
}

const createQueryFactory = () => {
    const factory = jest.fn() as jest.MockedFunction<
        TimeSeriesFactory<'channel'>
    >
    factory.mockReturnValue(builtQuery)
    return factory
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useStatsMetricTimeSeries', () => {
    it('invokes the query factory with filters, timezone and granularity', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useStatsMetricTimeSeries(
                queryFactory,
                statsFilters,
                timezone,
                granularity,
            ),
        )

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            granularity,
        })
    })

    it('calls useStatsTimeSeries with the built query', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useStatsMetricTimeSeries(
                queryFactory,
                statsFilters,
                timezone,
                granularity,
            ),
        )

        expect(useStatsTimeSeriesMock).toHaveBeenCalledWith(builtQuery)
    })

    it('returns the value produced by useStatsTimeSeries', () => {
        const queryFactory = createQueryFactory()
        const hookResult = { data: [[]], isFetching: false } as any
        useStatsTimeSeriesMock.mockReturnValue(hookResult)

        const { result } = renderHook(() =>
            useStatsMetricTimeSeries(
                queryFactory,
                statsFilters,
                timezone,
                granularity,
            ),
        )

        expect(result.current).toBe(hookResult)
    })
})

describe('useStatsMetricTimeSeriesPerDimension', () => {
    it('invokes the query factory with the provided dimension', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useStatsMetricTimeSeriesPerDimension(
                queryFactory,
                statsFilters,
                timezone,
                granularity,
                'channel',
            ),
        )

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            granularity,
            dimensions: ['channel'],
        })
    })

    it('calls useStatsTimeSeriesPerDimension with the built query', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useStatsMetricTimeSeriesPerDimension(
                queryFactory,
                statsFilters,
                timezone,
                granularity,
                'channel',
            ),
        )

        expect(useStatsTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
            builtQuery,
        )
    })
})

describe('fetchStatsMetricTimeSeries', () => {
    it('invokes the query factory and calls fetchStatsTimeSeries with the built query', async () => {
        const queryFactory = createQueryFactory()
        fetchStatsTimeSeriesMock.mockResolvedValue([[]])

        await fetchStatsMetricTimeSeries(
            queryFactory,
            statsFilters,
            timezone,
            granularity,
        )

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            granularity,
        })
        expect(fetchStatsTimeSeriesMock).toHaveBeenCalledWith(builtQuery)
    })
})

describe('fetchStatsMetricTimeSeriesPerDimension', () => {
    it('invokes the query factory with the dimension and calls fetchStatsTimeSeriesPerDimension', async () => {
        const queryFactory = createQueryFactory()
        fetchStatsTimeSeriesPerDimensionMock.mockResolvedValue({})

        await fetchStatsMetricTimeSeriesPerDimension(
            queryFactory,
            statsFilters,
            timezone,
            granularity,
            'channel',
        )

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            granularity,
            dimensions: ['channel'],
        })
        expect(fetchStatsTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
            builtQuery,
        )
    })
})
