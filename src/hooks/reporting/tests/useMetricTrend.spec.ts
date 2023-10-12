import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMeasure,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMessagesMeasure} from 'models/reporting/cubes/TicketMessagesCube'

import {usePostReporting} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'

import useMetricTrend, {selectMeasure} from '../useMetricTrend'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useMetricTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const defaultQuery: ReportingQuery<HelpdeskMessageCubeWithJoins> = {
        measures: [TicketMessagesMeasure.FirstResponseTime],
        dimensions: [],
        filters: [],
    }

    beforeEach(() => {
        jest.resetAllMocks()
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=false when no queries are fetching', () => {
        const {result} = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery)
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const {result} = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery)
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=false when no queries errored', () => {
        const {result} = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery)
        )

        expect(result.current.isError).toBe(false)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery)
        )

        expect(result.current.isError).toBe(true)
    })

    it('should not return data when one the queries does not have data', () => {
        const {result} = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery)
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

        const {result} = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery)
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
                    {[TicketMessagesMeasure.MessagesAverage]: messagesAverage},
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
            })
        )
        expect(defaultSelect?.(data)).toEqual(null)

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [prevPeriodQuery],
            expect.objectContaining({
                select: usePostReportingMock.mock.calls[1][1]?.select,
            })
        )
        expect(previousSelect?.(data)).toEqual(messagesAverage)
    })

    describe('selectMeasure', () => {
        const ticketCount = 100
        const data = {
            data: {data: [{[TicketMeasure.TicketCount]: ticketCount}]},
        } as any

        it('should return the measure value', () => {
            expect(selectMeasure(TicketMeasure.TicketCount, data)).toEqual(
                ticketCount
            )
        })

        it('should return null for the missing measure', () => {
            expect(
                selectMeasure(HelpdeskMessageMeasure.TicketCount, data)
            ).toEqual(null)
        })
    })
})
