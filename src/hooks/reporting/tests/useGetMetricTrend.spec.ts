import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {useGetReporting} from 'models/reporting/queries'
import {ReportingMeasure} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'
import {useGetMetricTrend} from '../useGetMetricTrend'

jest.mock('models/reporting/queries')
const useGetReportingMock = assumeMock(useGetReporting)

describe('useGetMetricTrend', () => {
    const defaultReporting = {
        isFetching: false,
        isError: false,
    } as UseQueryResult
    const defaultFilters: StatsFilters = {
        period: {
            start_datetime: '2021-01-01T00:00:00.000Z',
            end_datetime: '2021-01-01T23:59:59.999Z',
        },
    }

    beforeEach(() => {
        jest.resetAllMocks()
        useGetReportingMock.mockReturnValue(defaultReporting)
    })

    it('should return isFetching=false when no queries is fetching', () => {
        const {result} = renderHook(() =>
            useGetMetricTrend(ReportingMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        useGetReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isFetching: true,
        })

        const {result} = renderHook(() =>
            useGetMetricTrend(ReportingMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=false when no queries errored', () => {
        const {result} = renderHook(() =>
            useGetMetricTrend(ReportingMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isError).toBe(false)
    })

    it('should return isError=true when one the queries errored', () => {
        useGetReportingMock.mockReturnValueOnce({
            ...defaultReporting,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useGetMetricTrend(ReportingMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isError).toBe(true)
    })

    it('should not return data when one the queries does not have data', () => {
        const {result} = renderHook(() =>
            useGetMetricTrend(ReportingMeasure.OpenTickets, defaultFilters)
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
            data: 2,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useGetMetricTrend(ReportingMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.data).toEqual({
            value: 1,
            prevValue: 2,
        })
    })
})
