import { assumeMock, renderHook } from '@repo/testing'
import { UseQueryResult } from '@tanstack/react-query'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    fetchPostReporting,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { ReportingQuery } from 'domains/reporting/models/types'

jest.mock('domains/reporting/models/queries')
const usePostReportingV2Mock = assumeMock(usePostReportingV2)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

const defaultReporting = {
    isFetching: false,
    isError: false,
} as UseQueryResult

const defaultQuery: ReportingQuery<HelpdeskMessageCubeWithJoins> = {
    measures: [TicketMessagesMeasure.MedianFirstResponseTime],
    dimensions: [],
    filters: [],
    metricName: METRIC_NAMES.TEST_METRIC,
}

describe('useMetricTrend', () => {
    beforeEach(() => {
        usePostReportingV2Mock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=false when no queries are fetching', () => {
        const { result } = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery),
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const { result } = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery),
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=false when no queries errored', () => {
        const { result } = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery),
        )

        expect(result.current.isError).toBe(false)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery),
        )

        expect(result.current.isError).toBe(true)
    })

    it('should not return data when one the queries does not have data', () => {
        const { result } = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery),
        )

        expect(result.current.data).toBe(undefined)
    })

    it('should return data', () => {
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: 1,
        } as UseQueryResult)
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: null,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery),
        )

        expect(result.current.data).toEqual({
            value: 1,
            prevValue: null,
        })
    })

    it('should call usePostReportingV2 with the query and null V2 queries', () => {
        const messagesAverage = 100
        const data = {
            data: {
                data: [
                    {
                        [TicketMessagesMeasure.MessagesAverage]:
                            messagesAverage,
                    },
                ],
            },
        } as any

        const prevPeriodQuery = {
            ...defaultQuery,
            measures: [TicketMessagesMeasure.MessagesAverage],
        }
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: 1,
        } as UseQueryResult)
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: 2,
        } as UseQueryResult)

        renderHook(() => useMetricTrend(defaultQuery, prevPeriodQuery))

        const defaultSelect = usePostReportingV2Mock.mock.calls[0][2]?.select
        const previousSelect = usePostReportingV2Mock.mock.calls[1][2]?.select

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            undefined,
            expect.objectContaining({
                select: defaultSelect,
            }),
        )
        expect(defaultSelect?.(data)).toEqual(null)

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [prevPeriodQuery],
            undefined,
            expect.objectContaining({
                select: usePostReportingV2Mock.mock.calls[1][2]?.select,
            }),
        )
        expect(previousSelect?.(data)).toEqual(messagesAverage)
    })

    it('should call usePostReportingV2 with V2 queries when provided', () => {
        const currentV2Query = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        const prevV2Query = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: 10,
        } as UseQueryResult)
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: 5,
        } as UseQueryResult)

        renderHook(() =>
            useMetricTrend(
                defaultQuery,
                defaultQuery,
                currentV2Query,
                prevV2Query,
            ),
        )

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            currentV2Query,
            expect.objectContaining({
                select: expect.any(Function),
            }),
        )

        expect(usePostReportingV2Mock).toHaveBeenCalledWith(
            [defaultQuery],
            prevV2Query,
            expect.objectContaining({
                select: expect.any(Function),
            }),
        )
    })

    it('should return data when using V2 queries', () => {
        const currentV2Query = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        const prevV2Query = {
            metricName: METRIC_NAMES.TEST_METRIC,
            scope: 'test-scope',
            measures: ['testMeasure'],
            filters: [],
        } as any

        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: 42,
        } as UseQueryResult)
        usePostReportingV2Mock.mockReturnValueOnce({
            ...defaultReporting,
            data: 21,
        } as UseQueryResult)

        const { result } = renderHook(() =>
            useMetricTrend(
                defaultQuery,
                defaultQuery,
                currentV2Query,
                prevV2Query,
            ),
        )

        expect(result.current.data).toEqual({
            value: 42,
            prevValue: 21,
        })
    })
})

describe('fetchMetricTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
        data: [],
    } as UseQueryResult

    beforeEach(() => {
        fetchPostReportingMock.mockResolvedValue({
            data: defaultReporting,
        } as any)
    })

    it('should fetch both queries', async () => {
        const result = await fetchMetricTrend(defaultQuery, defaultQuery)

        expect(result).toEqual({
            data: {
                value: null,
                prevValue: null,
            },
            isError: false,
            isFetching: false,
        })
    })

    it('should return undefined if one of the queries is empty', async () => {
        fetchPostReportingMock.mockResolvedValueOnce({
            data: defaultReporting,
        } as any)
        fetchPostReportingMock.mockResolvedValueOnce({
            data: { data: undefined },
        } as any)

        const result = await fetchMetricTrend(defaultQuery, defaultQuery)

        expect(result).toEqual({
            data: undefined,
            isError: false,
            isFetching: false,
        })
    })

    it('should return error', async () => {
        fetchPostReportingMock.mockRejectedValue({})

        const result = await fetchMetricTrend(defaultQuery, defaultQuery)

        expect(result).toEqual({
            data: undefined,
            isError: true,
            isFetching: false,
        })
    })
})
