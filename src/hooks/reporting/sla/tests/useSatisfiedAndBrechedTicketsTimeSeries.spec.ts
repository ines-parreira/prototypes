import {renderHook} from '@testing-library/react-hooks'
import {useSatisfiedOrBreachedTicketsTimeSeries} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {useTimeSeriesPerDimension} from 'hooks/reporting/useTimeSeries'
import {satisfiedOrBreachedTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useTimeSeries')
const useTimeSeriesPerDimensionMock = assumeMock(useTimeSeriesPerDimension)

describe('useTicketSlaTimeSeries', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const timeZone = 'UTC'
    const granularity = ReportingGranularity.Day

    it('should call a queryFactory', () => {
        renderHook(() =>
            useSatisfiedOrBreachedTicketsTimeSeries(
                filters,
                timeZone,
                granularity
            )
        )

        expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
            satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
                filters,
                timeZone,
                granularity
            )
        )
    })
})
