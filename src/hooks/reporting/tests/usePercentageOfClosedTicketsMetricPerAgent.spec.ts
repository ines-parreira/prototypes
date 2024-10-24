import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'

import {TicketChannel} from 'business/types/ticket'
import {useClosedTicketsMetric} from 'hooks/reporting/metrics'
import {useClosedTicketsMetricPerAgent} from 'hooks/reporting/metricsPerAgent'
import {usePercentageOfClosedTicketsMetricPerAgent} from 'hooks/reporting/usePercentageOfClosedTicketsMetricPerAgent'
import {OrderDirection} from 'models/api/types'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'
import {LegacyStatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/metricsPerAgent')
jest.mock('hooks/reporting/metrics')
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent
)

describe('usePercentageOfClosedTicketsMetricPerAgent', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: LegacyStatsFilters = {
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
    const closedTickets = 3200
    const ticketCount = 200

    it('should pass return percentage of closed tickets', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [{[TicketMeasure.TicketCount]: `${ticketCount}`}],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useClosedTicketsMetricMock.mockReturnValue({
            data: {value: closedTickets},
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfClosedTicketsMetricPerAgent(
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
                decile: null,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should return null when missing data', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: null,
            isError: false,
            isFetching: false,
        })

        useClosedTicketsMetricMock.mockReturnValue({
            data: undefined,
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfClosedTicketsMetricPerAgent(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId
                ),
            {}
        )

        expect(result.current).toEqual({
            data: {
                allData: [],
                value: null,
                decile: null,
            },
            isFetching: false,
            isError: false,
        })
    })

    it('should return something on partial data', () => {
        useClosedTicketsMetricPerAgentMock.mockReturnValue({
            data: {
                allData: [{[TicketMeasure.TicketCount]: `${ticketCount}`}],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useClosedTicketsMetricMock.mockReturnValue({
            data: undefined,
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfClosedTicketsMetricPerAgent(
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
                        [TicketMeasure.TicketCount]: `${ticketCount}`,
                    },
                ],
                value: null,
                decile: null,
            },
            isFetching: false,
            isError: false,
        })
    })
})
