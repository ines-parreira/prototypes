import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchTicketsCreatedMetric,
    useTicketsCreatedMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchCreatedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
} from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import {
    fetchPercentageOfCreatedTicketsMetricPerChannel,
    usePercentageOfCreatedTicketsMetricPerChannel,
} from 'domains/reporting/hooks/support-performance/channels/usePercentageOfCreatedTicketsMetricPerChannel'
import { TicketMeasure } from 'domains/reporting/models/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock(
    'domains/reporting/hooks/support-performance/channels/metricsPerChannel',
)
jest.mock('domains/reporting/hooks/metrics')
const useTicketsCreatedMetricMock = assumeMock(useTicketsCreatedMetric)
const useTicketsCreatedMetricPerChannelMock = assumeMock(
    useCreatedTicketsMetricPerChannel,
)
const fetchTicketsCreatedMetricMock = assumeMock(fetchTicketsCreatedMetric)
const fetchTicketsCreatedMetricPerChannelMock = assumeMock(
    fetchCreatedTicketsMetricPerChannel,
)

describe('PercentageOfCreatedTicketsMetricPerChannel', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([
            TicketChannel.Email,
            TicketChannel.Chat,
        ]),
        integrations: withDefaultLogicalOperator([1]),
        tags: [
            {
                ...withDefaultLogicalOperator([1, 2]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc
    const agentId = 'someId'
    const closedTickets = 3200
    const ticketCount = 200

    describe('usePercentageOfCreatedTicketsMetricPerChannel', () => {
        it('should pass return percentage of closed tickets', () => {
            useTicketsCreatedMetricPerChannelMock.mockReturnValue({
                data: {
                    allData: [
                        { [TicketMeasure.TicketCount]: `${ticketCount}` },
                    ],
                    value: ticketCount,
                    decile: null,
                },
                isError: false,
                isFetching: false,
            })

            useTicketsCreatedMetricMock.mockReturnValue({
                data: { value: closedTickets },
                isError: false,
                isFetching: false,
            })

            const { result } = renderHook(
                () =>
                    usePercentageOfCreatedTicketsMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId,
                    ),
                {},
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

            const { result } = renderHook(
                () =>
                    usePercentageOfCreatedTicketsMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId,
                    ),
                {},
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
                    allData: [
                        { [TicketMeasure.TicketCount]: `${ticketCount}` },
                    ],
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

            const { result } = renderHook(
                () =>
                    usePercentageOfCreatedTicketsMetricPerChannel(
                        statsFilters,
                        timezone,
                        sorting,
                        agentId,
                    ),
                {},
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

    describe('fetchPercentageOfCreatedTicketsMetricPerChannel', () => {
        it('should pass return percentage of closed tickets', async () => {
            fetchTicketsCreatedMetricPerChannelMock.mockResolvedValue({
                data: {
                    allData: [
                        { [TicketMeasure.TicketCount]: `${ticketCount}` },
                    ],
                    value: ticketCount,
                    decile: null,
                },
                isError: false,
                isFetching: false,
            })

            fetchTicketsCreatedMetricMock.mockResolvedValue({
                data: { value: closedTickets },
                isError: false,
                isFetching: false,
            })

            const result =
                await fetchPercentageOfCreatedTicketsMetricPerChannel(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                )

            expect(result).toEqual({
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

        it('should return null when missing data', async () => {
            fetchTicketsCreatedMetricPerChannelMock.mockResolvedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            fetchTicketsCreatedMetricMock.mockResolvedValue({
                data: undefined,
                isError: false,
                isFetching: false,
            })

            const result =
                await fetchPercentageOfCreatedTicketsMetricPerChannel(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                )

            expect(result).toEqual({
                data: {
                    allData: [],
                    value: null,
                    decile: null,
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should return something on partial data', async () => {
            fetchTicketsCreatedMetricPerChannelMock.mockResolvedValue({
                data: {
                    allData: [
                        { [TicketMeasure.TicketCount]: `${ticketCount}` },
                    ],
                    value: ticketCount,
                    decile: null,
                },
                isError: false,
                isFetching: false,
            })

            fetchTicketsCreatedMetricMock.mockResolvedValue({
                data: undefined,
                isError: false,
                isFetching: false,
            })

            const result =
                await fetchPercentageOfCreatedTicketsMetricPerChannel(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                )

            expect(result).toEqual({
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

        it('should return no data on error', async () => {
            fetchTicketsCreatedMetricPerChannelMock.mockRejectedValue({})

            fetchTicketsCreatedMetricMock.mockResolvedValue({
                data: undefined,
                isError: false,
                isFetching: false,
            })

            const result =
                await fetchPercentageOfCreatedTicketsMetricPerChannel(
                    statsFilters,
                    timezone,
                    sorting,
                    agentId,
                )

            expect(result).toEqual({
                data: null,
                isFetching: false,
                isError: true,
            })
        })
    })
})
