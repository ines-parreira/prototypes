import { assumeMock, renderHook } from '@repo/testing'
import { UseQueryResult } from '@tanstack/react-query'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    fetchMetric,
    selectMeasure,
    useMetric,
} from 'domains/reporting/hooks/useMetric'
import { HelpdeskMessageMeasure } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesCube,
    TicketMessagesMeasure,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    fetchPostReportingV2,
    usePostReportingV2,
} from 'domains/reporting/models/queries'
import { medianFirstResponseTime } from 'domains/reporting/models/scopes/firstResponseTime'
import { ReportingQuery } from 'domains/reporting/models/types'

jest.mock('domains/reporting/models/queries')
const usePostReportingV2Mock = assumeMock(usePostReportingV2)
const fetchPostReportingV2Mock = assumeMock(fetchPostReportingV2)

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

    const defaultQueryV2 = medianFirstResponseTime.build({
        timezone: 'UTC',
        filters: {
            period: {
                start_datetime: '2023-01-01',
                end_datetime: '2023-01-31',
            },
        },
    })

    describe('useMetric', () => {
        beforeEach(() => {
            usePostReportingV2Mock.mockReturnValue(defaultReporting)
        })

        it('should return isFetching=false when no queries are fetching', () => {
            const { result } = renderHook(() =>
                useMetric(defaultQuery, defaultQueryV2),
            )

            expect(result.current.isFetching).toBe(false)
        })

        it('should return isFetching=true when one the queries is fetching', () => {
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                isFetching: true,
            })

            const { result } = renderHook(() =>
                useMetric(defaultQuery, defaultQueryV2),
            )

            expect(result.current.isFetching).toBe(true)
        })

        it('should return isError=false when no queries errored', () => {
            const { result } = renderHook(() =>
                useMetric(defaultQuery, defaultQueryV2),
            )

            expect(result.current.isError).toBe(false)
        })

        it('should return isError=true when one the queries errored', () => {
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                isError: true,
            } as UseQueryResult)

            const { result } = renderHook(() =>
                useMetric(defaultQuery, defaultQueryV2),
            )

            expect(result.current.isError).toBe(true)
        })

        it('should not return data when one the queries does not have data', () => {
            const { result } = renderHook(() =>
                useMetric(defaultQuery, defaultQueryV2),
            )

            expect(result.current.data).toBe(undefined)
        })

        it('should return data', () => {
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: 1,
            } as UseQueryResult)

            const { result } = renderHook(() =>
                useMetric(defaultQuery, defaultQueryV2),
            )

            expect(result.current.data).toEqual({
                value: 1,
            })
        })

        it('should call usePostReportingV2 with the query', () => {
            const medianFirstResponseTime = 1000
            usePostReportingV2Mock.mockReturnValueOnce({
                ...defaultReporting,
                data: 1,
            } as UseQueryResult)

            renderHook(() => useMetric(defaultQuery, defaultQueryV2))

            const select = usePostReportingV2Mock.mock.calls[0][2]?.select

            expect(usePostReportingV2Mock).toHaveBeenCalledWith(
                [defaultQuery],
                defaultQueryV2,
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
            fetchPostReportingV2Mock.mockResolvedValue({
                data: { ...defaultReporting, data: rawResponse },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)
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
            fetchPostReportingV2Mock.mockRejectedValueOnce({})

            const result = await fetchMetric(defaultQuery)

            expect(result.isError).toBe(true)
        })

        it('should not return data when one the queries does not have data', async () => {
            fetchPostReportingV2Mock.mockResolvedValue({
                data: { ...defaultReporting, data: undefined },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchMetric(defaultQuery)

            expect(result.data).toBe(undefined)
        })

        it('should return data', async () => {
            fetchPostReportingV2Mock.mockResolvedValueOnce({
                data: {
                    ...defaultReporting,
                    data: rawResponse,
                },
            } as unknown as ReturnType<typeof fetchPostReportingV2>)

            const result = await fetchMetric(defaultQuery)

            expect(result.data).toEqual({
                value: rawResponseValue,
            })
        })

        it('should call fetchPostReportingV2 with the query', async () => {
            await fetchMetric(defaultQuery)

            expect(fetchPostReportingV2Mock).toHaveBeenCalledWith(
                [defaultQuery],
                undefined,
            )
        })

        it('should call fetchPostReportingV2 with both V1 and V2 queries', async () => {
            const queryV2 = {
                metricName: METRIC_NAMES.TEST_METRIC,
                scope: MetricScope.SatisfactionSurveys,
                measures: [],
                dimensions: [],
                filters: [],
            }

            await fetchMetric(defaultQuery, queryV2)

            expect(fetchPostReportingV2Mock).toHaveBeenCalledWith(
                [defaultQuery],
                queryV2,
            )
        })
    })

    describe('selectMeasure', () => {
        const ticketCount = 100
        const data = {
            data: { data: [{ [TicketMeasure.TicketCount]: ticketCount }] },
        } as any

        it('should return the measure value', () => {
            expect(selectMeasure(TicketMeasure.TicketCount, data)).toEqual(
                ticketCount,
            )
        })

        it('should return null for the missing measure', () => {
            expect(
                selectMeasure(HelpdeskMessageMeasure.TicketCount, data),
            ).toEqual(null)
        })
    })
})
