import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {useGetReporting} from 'models/reporting/queries'
import {ReportingQuery, TicketStateMeasure} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'
import useMetricTrend, {ANALYTICS_STALE_TIME_MS} from '../useMetricTrend'

jest.mock('models/reporting/queries')
const useGetReportingMock = assumeMock(useGetReporting)

describe('useMetricTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const defaultQuery: ReportingQuery = {
        measures: [TicketStateMeasure.FirstResponseTime],
        dimensions: [],
        filters: [],
    }

    beforeEach(() => {
        jest.resetAllMocks()
        useGetReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=false when no queries are fetching', () => {
        const {result} = renderHook(() =>
            useMetricTrend(defaultQuery, defaultQuery)
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        useGetReportingMock.mockReturnValueOnce({
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
        useGetReportingMock.mockReturnValueOnce({
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
        useGetReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: 1,
        } as UseQueryResult)
        useGetReportingMock.mockReturnValueOnce({
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

    it('should call useGetReporting with stale time', () => {
        const prevPeriodQuery = {
            ...defaultQuery,
            measures: [TicketStateMeasure.MessagesAverage],
        }
        useGetReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: 1,
        } as UseQueryResult)
        useGetReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: 2,
        } as UseQueryResult)

        renderHook(() => useMetricTrend(defaultQuery, prevPeriodQuery))

        expect(useGetReportingMock).toHaveBeenCalledWith(
            [defaultQuery],
            expect.objectContaining({
                staleTime: ANALYTICS_STALE_TIME_MS,
            })
        )
        expect(useGetReportingMock).toHaveBeenCalledWith(
            [prevPeriodQuery],
            expect.objectContaining({
                staleTime: ANALYTICS_STALE_TIME_MS,
            })
        )
    })
})
