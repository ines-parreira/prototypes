import {renderHook} from '@testing-library/react-hooks'

import {TicketCustomFieldsMeasure} from 'models/reporting/cubes/TicketCustomFieldsCube'
import {assumeMock} from 'utils/testing'
import {useTicketsDistribution} from 'pages/stats/useTicketsDistribution'

jest.mock('pages/stats/useTicketsDistribution')
const useTicketsDistributionMock = assumeMock(useTicketsDistribution)

describe('useTicketsDistribution', () => {
    const ticketsDistribution: ReturnType<typeof useTicketsDistribution> = {
        isFetching: false,
        outsideTopTotal: 0,
        outsideTopTotalPercentage: 0,
        ticketsCountTotal: 5,
        topData: [
            {[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '1'},
            {[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '2'},
            {[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '3'},
            {[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '4'},
            {[TicketCustomFieldsMeasure.TicketCustomFieldsTicketCount]: '5'},
        ],
    }

    it('should return tickets distribution', () => {
        useTicketsDistributionMock.mockReturnValue(ticketsDistribution)
        const {result} = renderHook(() => useTicketsDistribution())

        expect(result.current).toEqual(ticketsDistribution)
    })
})
