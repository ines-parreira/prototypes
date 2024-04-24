import {renderHook} from '@testing-library/react-hooks'
import {useTicketSlaTimeSeries} from 'hooks/reporting/sla/useTicketSlaTimeSeries'
import {useTimeSeriesPerDimension} from 'hooks/reporting/useTimeSeries'
import {slaTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
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
        renderHook(() => useTicketSlaTimeSeries(filters, timeZone, granularity))

        expect(useTimeSeriesPerDimensionMock).toHaveBeenCalledWith(
            slaTicketsTimeSeriesQueryFactory(filters, timeZone, granularity)
        )
    })
})
