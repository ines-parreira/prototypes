import { assumeMock, renderHook } from '@repo/testing'
import { UseQueryResult } from '@tanstack/react-query'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { fetchMetric, useMetric } from 'domains/reporting/hooks/useMetric'
import {
    TicketMessagesCube,
    TicketMessagesMeasure,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    fetchPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { ReportingQuery } from 'domains/reporting/models/types'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

describe('Metric', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const defaultQuery: ReportingQuery<TicketMessagesCube> = {
        measures: [TicketMessagesMeasure.MedianFirstResponseTime],
        dimensions: [],
        filters: [],
        metricName: METRIC_NAMES.TEST_METRIC,
    }

    describe('useMetric', () => {
        beforeEach(() => {
            usePostReportingMock.mockReturnValue(defaultReporting)
        })

        it('should return isFetching=false when no queries are fetching', () => {
            const { result } = renderHook(() => useMetric(defaultQuery))

            expect(result.current.isFetching).toBe(false)
        })

        it('should return isFetching=true when one the queries is fetching', () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                isFetching: true,
            })

            const { result } = renderHook(() => useMetric(defaultQuery))

            expect(result.current.isFetching).toBe(true)
        })

        it('should return isError=false when no queries errored', () => {
            const { result } = renderHook(() => useMetric(defaultQuery))

            expect(result.current.isError).toBe(false)
        })

        it('should return isError=true when one the queries errored', () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                isError: true,
            } as UseQueryResult)

            const { result } = renderHook(() => useMetric(defaultQuery))

            expect(result.current.isError).toBe(true)
        })

        it('should not return data when one the queries does not have data', () => {
            const { result } = renderHook(() => useMetric(defaultQuery))

            expect(result.current.data).toBe(undefined)
        })

        it('should return data', () => {
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 1,
            } as UseQueryResult)

            const { result } = renderHook(() => useMetric(defaultQuery))

            expect(result.current.data).toEqual({
                value: 1,
            })
        })

        it('should call usePostReporting with the query', () => {
            const medianFirstResponseTime = 1000
            usePostReportingMock.mockReturnValueOnce({
                ...defaultReporting,
                data: 1,
            } as UseQueryResult)

            renderHook(() => useMetric(defaultQuery))

            const select = usePostReportingMock.mock.calls[0][1]?.select

            expect(usePostReportingMock).toHaveBeenCalledWith(
                [defaultQuery],
                expect.objectContaining({
                    select,
                }),
            )
            expect(
                select?.({
                    data: {
                        data: [
                            {
                                [TicketMessagesMeasure.MedianFirstResponseTime]:
                                    medianFirstResponseTime,
                            },
                        ],
                    },
                } as any),
            ).toEqual(medianFirstResponseTime)
        })
    })

    describe('fetchMetric', () => {
        const defaultReporting = {
            isFetching: false,
            isError: false,
        } as UseQueryResult

        const defaultQuery: ReportingQuery<TicketMessagesCube> = {
            measures: [TicketMessagesMeasure.MedianFirstResponseTime],
            dimensions: [],
            filters: [],
            metricName: METRIC_NAMES.TEST_METRIC,
        }
        const rawResponseValue = 12
        const rawResponse = [
            {
                [TicketMessagesMeasure.MedianFirstResponseTime]:
                    String(rawResponseValue),
            },
        ]

        beforeEach(() => {
            fetchPostReportingMock.mockResolvedValue({
                data: { ...defaultReporting, data: rawResponse },
            } as unknown as ReturnType<typeof fetchPostReporting>)
        })

        it('should return isFetching=false when no queries are fetching', async () => {
            const result = await fetchMetric(defaultQuery)

            expect(result.isFetching).toBe(false)
        })

        it('should return isError=false when no queries errored', async () => {
            const result = await fetchMetric(defaultQuery)

            expect(result.isError).toBe(false)
        })

        it('should return isError=true when one the queries errored', async () => {
            fetchPostReportingMock.mockRejectedValueOnce({})

            const result = await fetchMetric(defaultQuery)

            expect(result.isError).toBe(true)
        })

        it('should not return data when one the queries does not have data', async () => {
            fetchPostReportingMock.mockResolvedValue({
                data: { ...defaultReporting, data: undefined },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchMetric(defaultQuery)

            expect(result.data).toBe(undefined)
        })

        it('should return data', async () => {
            fetchPostReportingMock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: rawResponse,
                },
            } as unknown as ReturnType<typeof fetchPostReporting>)

            const result = await fetchMetric(defaultQuery)

            expect(result.data).toEqual({
                value: rawResponseValue,
            })
        })

        it('should call fetchPostReporting with the query', async () => {
            await fetchMetric(defaultQuery)

            expect(fetchPostReportingMock).toHaveBeenCalledWith([defaultQuery])
        })
    })
})
