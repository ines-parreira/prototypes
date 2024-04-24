import {renderHook} from '@testing-library/react-hooks'
import {useTicketsInPolicyPerStatus} from 'hooks/reporting/sla/useTicketsInPolicy'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {OrderDirection} from 'models/api/types'
import {TicketSLAStatus} from 'models/reporting/cubes/sla/TicketSLACube'
import {slaTicketsQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {StatsFilters} from 'models/stat/types'
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
