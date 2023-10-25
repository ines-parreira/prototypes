import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'
import {
    useClosedTicketsMetricPerAgent,
    useOneTouchTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerDimension'
import {useOneTouchTicketsPercentageMetricPerAgent} from 'hooks/reporting/useOneTouchTicketsPercentageMetricPerAgent'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'

jest.mock('hooks/reporting/metricsPerDimension')
const useOneTouchTicketsMetricPerAgentMock = assumeMock(
    useOneTouchTicketsMetricPerAgent
)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)

describe('useOneTouchTicketsPercentageMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Email, TicketChannel.Chat],
        integrations: [1],
        tags: [1, 2],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc
    const agentId = 'someId'
    const closedTickets = 320
    const ticketCount = 15

    it('should return percentage of one touch tickets', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [{[TicketMeasure.TicketCount]: `${closedTickets}`}],
                value: closedTickets,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useOneTouchTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [{[TicketMeasure.TicketCount]: `${ticketCount}`}],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                useOneTouchTicketsPercentageMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId
                ),
            {}
        )

        expect(result.current).toEqual({
            data: {
                allData: [
                    {
                        [TicketMeasure.TicketCount]: `${
                            (ticketCount / closedTickets) * 100
                        }`,
                    },
                ],
                value: (ticketCount / closedTickets) * 100,
                decile: 9,
            },
            isFetching: false,
            isError: false,
        })
    })
})
