import { assumeMock, renderHook } from '@repo/testing'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import { useMetricPerDimensionV2 } from 'domains/reporting/hooks/useMetricPerDimension'
import { useMetricPerDimensionTrendV2 } from 'domains/reporting/hooks/useMetricPerDimensionTrend'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import type {
    BuiltQuery,
    ScopeMeta,
} from 'domains/reporting/models/scopes/scope'
import type { ReportingQuery } from 'domains/reporting/models/types'

jest.mock('domains/reporting/hooks/useMetricPerDimension')

const useMetricPerDimensionV2Mock = assumeMock(useMetricPerDimensionV2)

const testScopeMeta = {
    scope: 'test-scope' as any,
    filters: ['periodStart', 'periodEnd'] as const,
    measures: ['medianFirstResponseTime'] as const,
    dimensions: ['agentId'] as const,
    timeDimensions: ['createdDatetime'] as const,
} as const satisfies ScopeMeta

const currentQuery: ReportingQuery<any> = {
    measures: [TicketMessagesMeasure.MedianFirstResponseTime],
    dimensions: ['agentId'],
    filters: [],
    metricName: METRIC_NAMES.TEST_METRIC,
}

const prevQuery: ReportingQuery<any> = {
    ...currentQuery,
}

const currentQueryV2: BuiltQuery<typeof testScopeMeta> = {
    metricName: METRIC_NAMES.TEST_METRIC,
    scope: MetricScope.SatisfactionSurveys,
    measures: ['medianFirstResponseTime'],
    dimensions: ['agentId'],
}

const prevQueryV2: BuiltQuery<typeof testScopeMeta> = {
    ...currentQueryV2,
}

const makePeriod = (
    overrides: Partial<MetricWithDecile<string, any>> = {},
): MetricWithDecile<string, any> =>
    ({
        isFetching: false,
        isError: false,
        data: {
            value: null,
            decile: null,
            allData: [],
            allValues: [],
            dimensions: ['agentId'],
            measures: ['medianFirstResponseTime'],
        },
        ...overrides,
    }) as MetricWithDecile<string, any>

describe('useMetricPerDimensionTrendV2', () => {
    beforeEach(() => {
        useMetricPerDimensionV2Mock.mockReturnValue(makePeriod())
    })

    it('returns isFetching=false when neither period is fetching', () => {
        const { result } = renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
            ),
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('returns isFetching=true when the current period is fetching', () => {
        useMetricPerDimensionV2Mock.mockReturnValueOnce(
            makePeriod({ isFetching: true }),
        )

        const { result } = renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
            ),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isFetching=true when the previous period is fetching', () => {
        useMetricPerDimensionV2Mock
            .mockReturnValueOnce(makePeriod())
            .mockReturnValueOnce(makePeriod({ isFetching: true }))

        const { result } = renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
            ),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('returns isError=false when neither period errored', () => {
        const { result } = renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
            ),
        )

        expect(result.current.isError).toBe(false)
    })

    it('returns isError=true when the current period errored', () => {
        useMetricPerDimensionV2Mock.mockReturnValueOnce(
            makePeriod({ isError: true }),
        )

        const { result } = renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
            ),
        )

        expect(result.current.isError).toBe(true)
    })

    it('returns isError=true when the previous period errored', () => {
        useMetricPerDimensionV2Mock
            .mockReturnValueOnce(makePeriod())
            .mockReturnValueOnce(makePeriod({ isError: true }))

        const { result } = renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
            ),
        )

        expect(result.current.isError).toBe(true)
    })

    it('returns the current and previous period results', () => {
        const current = makePeriod({
            data: {
                value: '10',
                decile: null,
                allData: [],
                allValues: [],
                dimensions: ['agentId'],
                measures: ['medianFirstResponseTime'],
            } as any,
        })
        const previous = makePeriod({
            data: {
                value: '7',
                decile: null,
                allData: [],
                allValues: [],
                dimensions: ['agentId'],
                measures: ['medianFirstResponseTime'],
            } as any,
        })

        useMetricPerDimensionV2Mock
            .mockReturnValueOnce(current)
            .mockReturnValueOnce(previous)

        const { result } = renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
            ),
        )

        expect(result.current.currentPeriod).toBe(current)
        expect(result.current.prevPeriod).toBe(previous)
    })

    it('forwards both queries, the dimensionId and enabled flag to the underlying hook', () => {
        renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                currentQueryV2,
                prevQueryV2,
                '456',
                false,
            ),
        )

        expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
            1,
            currentQuery,
            currentQueryV2,
            '456',
            false,
        )
        expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
            2,
            prevQuery,
            prevQueryV2,
            '456',
            false,
        )
    })

    it('works without V2 queries or an explicit enabled flag', () => {
        renderHook(() =>
            useMetricPerDimensionTrendV2(
                currentQuery,
                prevQuery,
                undefined,
                undefined,
                '456',
            ),
        )

        expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
            1,
            currentQuery,
            undefined,
            '456',
            undefined,
        )
        expect(useMetricPerDimensionV2Mock).toHaveBeenNthCalledWith(
            2,
            prevQuery,
            undefined,
            '456',
            undefined,
        )
    })
})
