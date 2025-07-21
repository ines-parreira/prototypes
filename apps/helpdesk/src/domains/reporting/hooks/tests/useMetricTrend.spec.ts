import { UseQueryResult } from '@tanstack/react-query'

import useMetricTrend, {
    fetchMetricTrend,
    selectMeasure,
} from 'domains/reporting/hooks/useMetricTrend'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMeasure,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesMeasure } from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    fetchPostReporting,
    usePostReporting,
} from 'domains/reporting/models/queries'
import { ReportingQuery } from 'domains/reporting/models/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/models/queries')
const usePostReportingMock = assumeMock(usePostReporting)
const fetchPostReportingMock = assumeMock(fetchPostReporting)

const defaultReporting = {
    isFetching: false,
    isError: false,
} as UseQueryResult

const defaultQuery: ReportingQuery<HelpdeskMessageCubeWithJoins> = {
    measures: [TicketMessagesMeasure.MedianFirstResponseTime],
    dimensions: [],
    filters: [],
}

describe('useMetricTrend', () => {
    beforeEach(() => {
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=false when no queries are fetching', () => {
        const { result } = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery),
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingMock.mockReturnValueOnce({
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
        usePostReportingMock.mockReturnValueOnce({
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
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: 1,
        } as UseQueryResult)
        usePostReportingMock.mockReturnValueOnce({
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

    it('should call usePostReporting with the query', () => {
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
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: 1,
        } as UseQueryResult)
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: 2,
        } as UseQueryResult)

        renderHook(() => useMetricTrend(defaultQuery, prevPeriodQuery))

        const defaultSelect = usePostReportingMock.mock.calls[0][1]?.select
        const previousSelect = usePostReportingMock.mock.calls[1][1]?.select

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [defaultQuery],
            expect.objectContaining({
                select: defaultSelect,
            }),
        )
        expect(defaultSelect?.(data)).toEqual(null)

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [prevPeriodQuery],
            expect.objectContaining({
                select: usePostReportingMock.mock.calls[1][1]?.select,
            }),
        )
        expect(previousSelect?.(data)).toEqual(messagesAverage)
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

describe('fetchMetricTrend', () => {
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
            data: undefined,
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
