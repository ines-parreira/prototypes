import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {usePostReporting} from 'models/reporting/queries'
import {ReportingQuery, TicketStateMeasure} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'

import useMetricTrend from '../useMetricTrend'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

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
        const prevPeriodQuery = {
            ...defaultQuery,
            measures: [TicketStateMeasure.MessagesAverage],
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

        expect(usePostReportingMock).toHaveBeenCalledWith(
            [defaultQuery],
            expect.objectContaining({
                select: usePostReportingMock.mock.calls[0][1]?.select,
            })
        )
        expect(usePostReportingMock).toHaveBeenCalledWith(
            [prevPeriodQuery],
            expect.objectContaining({
                select: usePostReportingMock.mock.calls[1][1]?.select,
            })
        )
    })
})
