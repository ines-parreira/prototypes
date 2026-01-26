import { assumeMock, renderHook } from '@repo/testing'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Metric } from 'domains/reporting/hooks/metrics'
import {
    fetchStatsMetric,
    useStatsMetric,
} from 'domains/reporting/hooks/useStatsMetric'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import type { BuiltQuery } from 'domains/reporting/models/scopes/scope'

jest.mock('domains/reporting/hooks/useStatsMetric')

const useStatsMetricMock = assumeMock(useStatsMetric)
const fetchStatsMetricMock = assumeMock(fetchStatsMetric)

describe('useStatsMetricTrend', () => {
    const defaultQuery: BuiltQuery = {
        scope: MetricScope.TicketsClosed,
        measures: ['ticketCount'],
        dimensions: [],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
    }

    const defaultMetric: Metric = {
        isFetching: false,
        isError: false,
        data: undefined,
    }

    beforeEach(() => {
        jest.resetAllMocks()
    })

    describe('useStatsMetricTrend hook', () => {
        it('should return correct isFetching state', () => {
            useStatsMetricMock.mockReturnValue({
                ...defaultMetric,
                isFetching: false,
            })
            const { result: notFetching } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )
            expect(notFetching.current.isFetching).toBe(false)

            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                isFetching: true,
            })
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                isFetching: false,
            })
            const { result: fetching } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )
            expect(fetching.current.isFetching).toBe(true)
        })

        it('should return correct isError state', () => {
            useStatsMetricMock.mockReturnValue({
                ...defaultMetric,
                isError: false,
            })
            const { result: noError } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )
            expect(noError.current.isError).toBe(false)

            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                isError: true,
            })
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                isError: false,
            })
            const { result: withError } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )
            expect(withError.current.isError).toBe(true)
        })

        it('should return undefined when either query has no data', () => {
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 100 },
            })
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: undefined,
            })

            const { result } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )

            expect(result.current.data).toBe(undefined)
        })

        it('should return data with value and prevValue when both queries have data', () => {
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 150 },
            })
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 100 },
            })

            const { result } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )

            expect(result.current.data).toEqual({
                value: 150,
                prevValue: 100,
            })
        })

        it('should handle null values correctly', () => {
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: null },
            })
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 50 },
            })

            const { result } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )

            expect(result.current.data).toEqual({
                value: null,
                prevValue: 50,
            })
        })

        it('should handle zero values correctly', () => {
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 0 },
            })
            useStatsMetricMock.mockReturnValueOnce({
                ...defaultMetric,
                data: { value: 0 },
            })

            const { result } = renderHook(() =>
                useStatsMetricTrend(defaultQuery, defaultQuery),
            )

            expect(result.current.data).toEqual({
                value: 0,
                prevValue: 0,
            })
        })

        it('should call useStatsMetric for both queries', () => {
            useStatsMetricMock.mockReturnValue(defaultMetric)

            const currentQuery = {
                ...defaultQuery,
                filters: [{ field: 'current', value: 'test' }],
            } as any
            const prevQuery = {
                ...defaultQuery,
                filters: [{ field: 'previous', value: 'test' }],
            } as any

            renderHook(() => useStatsMetricTrend(currentQuery, prevQuery))

            expect(useStatsMetricMock).toHaveBeenCalledTimes(2)
            expect(useStatsMetricMock).toHaveBeenNthCalledWith(1, currentQuery)
            expect(useStatsMetricMock).toHaveBeenNthCalledWith(2, prevQuery)
        })
    })

    describe('fetchStatsMetricTrend', () => {
        it('should return correct response on success', async () => {
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 200 },
            })
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 150 },
            })

            const result = await fetchStatsMetricTrend(
                defaultQuery,
                defaultQuery,
            )

            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(false)
            expect(result.data).toEqual({
                value: 200,
                prevValue: 150,
            })
        })

        it('should handle various data combinations', async () => {
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: null },
            })
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            })
            const nullResult = await fetchStatsMetricTrend(
                defaultQuery,
                defaultQuery,
            )
            expect(nullResult.data).toEqual({ value: null, prevValue: 100 })

            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 0 },
            })
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 0 },
            })
            const zeroResult = await fetchStatsMetricTrend(
                defaultQuery,
                defaultQuery,
            )
            expect(zeroResult.data).toEqual({ value: 0, prevValue: 0 })
        })

        it('should return undefined data when either query has no data', async () => {
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            })
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: undefined,
            })

            const result = await fetchStatsMetricTrend(
                defaultQuery,
                defaultQuery,
            )

            expect(result.data).toBe(undefined)
        })

        it('should return isError=true when either fetch fails', async () => {
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: true,
                data: undefined,
            })
            fetchStatsMetricMock.mockResolvedValueOnce({
                isFetching: false,
                isError: false,
                data: { value: 100 },
            })

            const result = await fetchStatsMetricTrend(
                defaultQuery,
                defaultQuery,
            )

            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(true)
        })

        it('should return isError=true when promise rejects', async () => {
            fetchStatsMetricMock.mockRejectedValue(new Error('API Error'))

            const result = await fetchStatsMetricTrend(
                defaultQuery,
                defaultQuery,
            )

            expect(result.isFetching).toBe(false)
            expect(result.isError).toBe(true)
            expect(result.data).toBe(undefined)
        })

        it('should call fetchStatsMetric for both queries', async () => {
            fetchStatsMetricMock.mockResolvedValue({
                isFetching: false,
                isError: false,
                data: { value: 50 },
            })

            const currentQuery = {
                ...defaultQuery,
                filters: [{ field: 'current', value: 'test' }],
            } as any
            const prevQuery = {
                ...defaultQuery,
                filters: [{ field: 'previous', value: 'test' }],
            } as any

            await fetchStatsMetricTrend(currentQuery, prevQuery)

            expect(fetchStatsMetricMock).toHaveBeenCalledTimes(2)
            expect(fetchStatsMetricMock).toHaveBeenNthCalledWith(
                1,
                currentQuery,
            )
            expect(fetchStatsMetricMock).toHaveBeenNthCalledWith(2, prevQuery)
        })
    })
})
