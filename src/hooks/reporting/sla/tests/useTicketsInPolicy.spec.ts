import {renderHook} from '@testing-library/react-hooks'
import {
    useTicketsInPolicyPerStatus,
    useTicketsInPolicyPerStatusTrend,
} from 'hooks/reporting/sla/useTicketsInPolicy'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {slaTicketsQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {StatsFilters} from 'models/stat/types'
import {getPreviousPeriod} from 'utils/reporting'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/useMetricPerDimension')
const useMetricPerDimensionMock = assumeMock(useMetricPerDimension)

describe('useTicketsInPolicyPerStatus', () => {
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
            useTicketsInPolicyPerStatus(filters, timeZone, sorting)
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            slaTicketsQueryFactory(filters, timeZone, sorting),
            undefined
        )
    })

    it('should call a queryFactory with specific SlaStatus', () => {
        renderHook(() =>
            useTicketsInPolicyPerStatus(filters, timeZone, sorting, slaStatus)
        )

        expect(useMetricPerDimensionMock).toHaveBeenCalledWith(
            slaTicketsQueryFactory(filters, timeZone, sorting),
            slaStatus
        )
    })
})

describe('useTicketsInPolicyPerStatusTrend', () => {
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
            useTicketsInPolicyPerStatusTrend(filters, timeZone, sorting)
        )

        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            1,
            slaTicketsQueryFactory(filters, timeZone, sorting),
            undefined
        )
        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            2,
            slaTicketsQueryFactory(
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
            useTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting,
                slaStatus
            )
        )

        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            1,
            slaTicketsQueryFactory(filters, timeZone, sorting),
            slaStatus
        )
        expect(useMetricPerDimensionMock).toHaveBeenNthCalledWith(
            2,
            slaTicketsQueryFactory(
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
            useTicketsInPolicyPerStatusTrend(
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
            useTicketsInPolicyPerStatusTrend(
                filters,
                timeZone,
                sorting,
                slaStatus
            )
        )

        expect(result.current.isError).toEqual(isError)
    })
})
