import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'
import {
    TicketMessagesCube,
    TicketMessagesMeasure,
} from 'models/reporting/cubes/TicketMessagesCube'

import {usePostReporting} from 'models/reporting/queries'
import {ReportingQuery} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'

import {useMetric} from '../useMetric'

jest.mock('models/reporting/queries')
const usePostReportingMock = assumeMock(usePostReporting)

describe('useMetric', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult

    const defaultQuery: ReportingQuery<TicketMessagesCube> = {
        measures: [TicketMessagesMeasure.MedianFirstResponseTime],
        dimensions: [],
        filters: [],
    }

    beforeEach(() => {
        jest.resetAllMocks()
        usePostReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=false when no queries are fetching', () => {
        const {result} = renderHook(() => useMetric(defaultQuery))

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const {result} = renderHook(() => useMetric(defaultQuery))

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=false when no queries errored', () => {
        const {result} = renderHook(() => useMetric(defaultQuery))

        expect(result.current.isError).toBe(false)
    })

    it('should return isError=true when one the queries errored', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() => useMetric(defaultQuery))

        expect(result.current.isError).toBe(true)
    })

    it('should not return data when one the queries does not have data', () => {
        const {result} = renderHook(() => useMetric(defaultQuery))

        expect(result.current.data).toBe(undefined)
    })

    it('should return data', () => {
        usePostReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            data: 1,
        } as UseQueryResult)

        const {result} = renderHook(() => useMetric(defaultQuery))

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
            })
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
            } as any)
        ).toEqual(medianFirstResponseTime)
    })
})
