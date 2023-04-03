import {UseQueryResult} from '@tanstack/react-query'
import {renderHook} from '@testing-library/react-hooks'

import {useGetAnalytics} from 'models/analytics/queries'
import {AnalyticsMeasure} from 'models/analytics/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'
import {useGetMetricTrend} from '../useGetMetricTrend'

jest.mock('models/analytics/queries')
const useGetAnalyticsMock = assumeMock(useGetAnalytics)

describe('useGetMetricTrend', () => {
    const defaultAnalytics = {
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
        useGetAnalyticsMock.mockReturnValue(defaultAnalytics)
    })

    it('should return isFetching=false when no queries is fetching', () => {
        const {result} = renderHook(() =>
            useGetMetricTrend(AnalyticsMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isFetching).toBe(false)
    })

    it('should return isFetching=true when one the queries is fetching', () => {
        useGetAnalyticsMock.mockReturnValueOnce({
            ...defaultAnalytics,
            isFetching: true,
        })

        const {result} = renderHook(() =>
            useGetMetricTrend(AnalyticsMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isFetching).toBe(true)
    })

    it('should return isError=false when no queries errored', () => {
        const {result} = renderHook(() =>
            useGetMetricTrend(AnalyticsMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isError).toBe(false)
    })

    it('should return isError=true when one the queries errored', () => {
        useGetAnalyticsMock.mockReturnValueOnce({
            ...defaultAnalytics,
            isError: true,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useGetMetricTrend(AnalyticsMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.isError).toBe(true)
    })

    it('should not return data when one the queries does not have data', () => {
        const {result} = renderHook(() =>
            useGetMetricTrend(AnalyticsMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.data).toBe(undefined)
    })

    it('should return data', () => {
        useGetAnalyticsMock.mockReturnValueOnce({
            ...defaultAnalytics,
            data: 1,
        } as UseQueryResult)
        useGetAnalyticsMock.mockReturnValueOnce({
            ...defaultAnalytics,
            data: 2,
        } as UseQueryResult)

        const {result} = renderHook(() =>
            useGetMetricTrend(AnalyticsMeasure.OpenTickets, defaultFilters)
        )

        expect(result.current.data).toEqual({
            value: 1,
            prevValue: 2,
        })
    })
})
