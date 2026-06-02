import { assumeMock, renderHook } from '@repo/testing'

import type { MetricName } from 'domains/reporting/hooks/metricNames'
import { MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ChannelBreakdownFactory } from 'domains/reporting/pages/performance/utils/useMetricPerChannel'
import {
    fetchMetricPerChannel,
    useMetricPerChannel,
} from 'domains/reporting/pages/performance/utils/useMetricPerChannel'

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
    const factory = jest.fn() as jest.MockedFunction<ChannelBreakdownFactory>
    factory.mockReturnValue(builtQuery)
    return factory
}

beforeEach(() => {
    jest.clearAllMocks()
})

describe('useMetricPerChannel', () => {
    it('invokes the query factory with the channel dimension', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useMetricPerChannel(queryFactory, statsFilters, timezone),
        )

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            dimensions: ['channel'],
        })
    })

    it('calls useStatsMetricPerDimension with the built query and the channel dimension', () => {
        const queryFactory = createQueryFactory()

        renderHook(() =>
            useMetricPerChannel(queryFactory, statsFilters, timezone),
        )

        expect(useStatsMetricPerDimensionMock).toHaveBeenCalledWith(
            builtQuery,
            'channel',
        )
    })

    it('returns the value produced by useStatsMetricPerDimension', () => {
        const queryFactory = createQueryFactory()
        const hookResult = {
            data: null,
            isFetching: false,
            isError: false,
        }
        useStatsMetricPerDimensionMock.mockReturnValue(hookResult)

        const { result } = renderHook(() =>
            useMetricPerChannel(queryFactory, statsFilters, timezone),
        )

        expect(result.current).toBe(hookResult)
    })
})

describe('fetchMetricPerChannel', () => {
    it('invokes the query factory with the channel dimension', async () => {
        const queryFactory = createQueryFactory()
        fetchStatsMetricPerDimensionMock.mockResolvedValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        await fetchMetricPerChannel(queryFactory, statsFilters, timezone)

        expect(queryFactory).toHaveBeenCalledWith({
            filters: statsFilters,
            timezone,
            dimensions: ['channel'],
        })
    })

    it('calls fetchStatsMetricPerDimension with the built query and the channel dimension', async () => {
        const queryFactory = createQueryFactory()
        fetchStatsMetricPerDimensionMock.mockResolvedValue({
            data: null,
            isFetching: false,
            isError: false,
        })

        await fetchMetricPerChannel(queryFactory, statsFilters, timezone)

        expect(fetchStatsMetricPerDimensionMock).toHaveBeenCalledWith(
            builtQuery,
            'channel',
        )
    })

    it('returns the value produced by fetchStatsMetricPerDimension', async () => {
        const queryFactory = createQueryFactory()
        const fetchResult = {
            data: null,
            isFetching: false,
            isError: false,
        }
        fetchStatsMetricPerDimensionMock.mockResolvedValue(fetchResult)

        await expect(
            fetchMetricPerChannel(queryFactory, statsFilters, timezone),
        ).resolves.toBe(fetchResult)
    })
})
