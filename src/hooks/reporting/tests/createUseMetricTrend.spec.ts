import {renderHook} from '@testing-library/react-hooks'

import {statsFilters} from 'fixtures/stats'
import {ReportingQuery, TicketMeasure} from 'models/reporting/types'
import {assumeMock} from 'utils/testing'

import createUseMetricTrend from '../createUseMetricTrend'
import useMetricTrend, {MetricTrend} from '../useMetricTrend'

jest.mock('../useMetricTrend')
const useMetricTrendMock = assumeMock(useMetricTrend)

describe('createUseMetricTrend', () => {
    const defaultReportingQuery: ReportingQuery = {
        measures: [TicketMeasure.FirstResponseTime],
        dimensions: [],
        filters: [],
    }
    const defaultMetricTrend: MetricTrend = {
        isError: false,
        isFetching: true,
    }
    const defaultTimezone = 'Europe/Paris'

    beforeEach(() => {
        jest.resetAllMocks()
        useMetricTrendMock.mockReturnValue(defaultMetricTrend)
    })

    it('should call the query factory with the current period filter', () => {
        const queryFactory = jest.fn()
        const useTrendFn = createUseMetricTrend(queryFactory)

        renderHook(() => useTrendFn(statsFilters, defaultTimezone))

        expect(queryFactory).toHaveBeenCalledWith(statsFilters, defaultTimezone)
    })

    it('should call the query factory with the previous period filter', () => {
        const queryFactory = jest.fn()
        const useTrendFn = createUseMetricTrend(queryFactory)

        renderHook(() =>
            useTrendFn(
                {
                    ...statsFilters,
                    period: {
                        start_datetime: '2020-02-14T12:00:00+02:00',
                        end_datetime: '2020-02-16T17:59:59+02:00',
                    },
                },
                defaultTimezone
            )
        )

        expect(queryFactory).toHaveBeenCalledWith(
            {
                ...statsFilters,
                period: {
                    start_datetime: '2020-02-12T06:00:00+02:00',
                    end_datetime: '2020-02-14T11:59:59+02:00',
                },
            },
            defaultTimezone
        )
    })

    it('should call useMetricQuery with the created queries', () => {
        const useTrendFn = createUseMetricTrend(() => defaultReportingQuery)

        renderHook(() => useTrendFn(statsFilters, defaultTimezone))

        expect(useMetricTrendMock).toHaveBeenCalledWith(
            defaultReportingQuery,
            defaultReportingQuery
        )
    })

    it('should return metric trend', () => {
        const useTrendFn = createUseMetricTrend(() => defaultReportingQuery)

        const {result} = renderHook(() =>
            useTrendFn(statsFilters, defaultTimezone)
        )

        expect(result.current).toEqual(defaultMetricTrend)
    })
})
