import {renderHook} from '@testing-library/react-hooks'
import moment from 'moment/moment'
import {useCreatedTicketsMetricPerChannel} from 'hooks/reporting/metricsPerChannel'
import {usePercentageOfCreatedTicketsMetricPerChannel} from 'hooks/reporting/usePercentageOfCreatedTicketsMetricPerChannel'

import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {StatsFilters} from 'models/stat/types'
import {assumeMock} from 'utils/testing'
import {useTicketsCreatedMetric} from 'hooks/reporting/metrics'
import {TicketMeasure} from 'models/reporting/cubes/TicketCube'

jest.mock('hooks/reporting/metricsPerChannel')
jest.mock('hooks/reporting/metrics')
const useTicketsCreatedMetricMock = assumeMock(useTicketsCreatedMetric)
const useTicketsCreatedMetricPerChannelMock = assumeMock(
    useCreatedTicketsMetricPerChannel
)

describe('usePercentageOfCreatedTicketsMetricPerChannel', () => {
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
    const closedTickets = 3200
    const ticketCount = 200

    it('should pass return percentage of closed tickets', () => {
        useTicketsCreatedMetricPerChannelMock.mockReturnValue({
            data: {
                allData: [{[TicketMeasure.TicketCount]: `${ticketCount}`}],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useTicketsCreatedMetricMock.mockReturnValue({
            data: {value: closedTickets},
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfCreatedTicketsMetricPerChannel(
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
        useTicketsCreatedMetricPerChannelMock.mockReturnValue({
            data: null,
            isError: false,
            isFetching: false,
        })

        useTicketsCreatedMetricMock.mockReturnValue({
            data: undefined,
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfCreatedTicketsMetricPerChannel(
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
        useTicketsCreatedMetricPerChannelMock.mockReturnValue({
            data: {
                allData: [{[TicketMeasure.TicketCount]: `${ticketCount}`}],
                value: ticketCount,
                decile: null,
            },
            isError: false,
            isFetching: false,
        })

        useTicketsCreatedMetricMock.mockReturnValue({
            data: undefined,
            isError: false,
            isFetching: false,
        })

        const {result} = renderHook(
            () =>
                usePercentageOfCreatedTicketsMetricPerChannel(
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
