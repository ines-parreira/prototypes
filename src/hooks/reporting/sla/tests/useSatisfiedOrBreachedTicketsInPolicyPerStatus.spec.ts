import {renderHook} from '@testing-library/react-hooks'
import {
    useSatisfiedOrBreachedTicketsInPolicyPerStatus,
    useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsInPolicyPerStatus'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {satisfiedOrBreachedTicketsQueryFactory} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useSatisfiedOrBreachedTicketsInPolicyPerStatus', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const timeZone = 'UTC'
    const sorting = OrderDirection.Desc
    const slaStatus = TicketSLAStatus.Breached

    it('should call a queryFactory', () => {
        renderHook(() =>
            useSatisfiedOrBreachedTicketsInPolicyPerStatus(
                filters,
                timeZone,
                sorting
            )
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            satisfiedOrBreachedTicketsQueryFactory(filters, timeZone, sorting),
            undefined
        )
    })

    it('should call a queryFactory with specific SlaStatus', () => {
        renderHook(() =>
            useSatisfiedOrBreachedTicketsInPolicyPerStatus(
                filters,
                timeZone,
                sorting,
                slaStatus
            )
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            satisfiedOrBreachedTicketsQueryFactory(filters, timeZone, sorting),
            slaStatus
        )
    })
})

describe('useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend', () => {
    const startDate = '2021-05-01T00:00:00+02:00'
    const endDate = '2021-05-04T23:59:59+02:00'
    const filters: StatsFilters = {
        period: {
            start_datetime: startDate,
            end_datetime: endDate,
        },
    }
    const timeZone = 'UTC'
    const sorting = OrderDirection.Desc
    const slaStatus = TicketSLAStatus.Breached

    it('should call a queryFactory for current and previousPeriod', () => {
        renderHook(() =>
            useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting
            )
        )

        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            1,
            satisfiedOrBreachedTicketsQueryFactory(filters, timeZone, sorting),
            undefined
        )
        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            2,
            satisfiedOrBreachedTicketsQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timeZone,
                sorting
            ),
            undefined
        )
    })

    it('should call a queryFactory with specific SlaStatus', () => {
        renderHook(() =>
            useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting,
                slaStatus
            )
        )

        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            1,
            satisfiedOrBreachedTicketsQueryFactory(filters, timeZone, sorting),
            slaStatus
        )
        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            2,
            satisfiedOrBreachedTicketsQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timeZone,
                sorting
            ),
            slaStatus
        )
    })

    it('should return loading state', () => {
        const isFetching = true
        useMetricPerDimensionMock.mockReturnValue({
            isFetching,
            isError: false,
            data: null,
        })

        const {result} = renderHook(() =>
            useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting,
                slaStatus
            )
        )

        expect(result.current.isFetching).toEqual(isFetching)
    })

    it('should return error state', () => {
        const isError = true
        useMetricPerDimensionMock.mockReturnValue({
            isFetching: false,
            isError,
            data: null,
        })

        const {result} = renderHook(() =>
            useSatisfiedOrBreachedTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting,
                slaStatus
            )
        )

        expect(result.current.isError).toEqual(isError)
    })
})
