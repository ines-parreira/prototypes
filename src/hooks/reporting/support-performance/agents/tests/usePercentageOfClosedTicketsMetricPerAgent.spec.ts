import { renderHook } from '@testing-library/react-hooks'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchClosedTicketsMetric,
    useClosedTicketsMetric,
} from 'hooks/reporting/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {
    fetchPercentageOfClosedTicketsMetricPerAgent,
    usePercentageOfClosedTicketsMetricPerAgent,
} from 'hooks/reporting/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import { OrderDirection } from 'models/api/types'
import { TicketMeasure } from 'models/reporting/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metricsPerAgent')
jest.mock('hooks/reporting/metrics')
const useClosedTicketsMetricMock = assumeMock(useClosedTicketsMetric)
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent,
)
const fetchClosedTicketsMetricMock = assumeMock(fetchClosedTicketsMetric)
const fetchClosedTicketsMetricPerAgentMock = assumeMock(
    fetchClosedTicketsMetricPerAgent,
)

describe('PercentageOfClosedTicketsMetricPerAgent', () => {
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

    describe('usePercentageOfClosedTicketsMetricPerAgent', () => {
        it('should pass return percentage of closed tickets', () => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
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

            useClosedTicketsMetricMock.mockReturnValue({
                data: { value: closedTickets },
                isError: false,
                isFetching: false,
            })

            const { result } = renderHook(
                () =>
                    usePercentageOfClosedTicketsMetricPerAgent(
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

            const { result } = renderHook(
                () =>
                    usePercentageOfClosedTicketsMetricPerAgent(
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
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
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

            useClosedTicketsMetricMock.mockReturnValue({
                data: undefined,
                isError: false,
                isFetching: false,
            })

            const { result } = renderHook(
                () =>
                    usePercentageOfClosedTicketsMetricPerAgent(
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

    describe('fetchPercentageOfClosedTicketsMetricPerAgent', () => {
        it('should pass return percentage of closed tickets', async () => {
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
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

            fetchClosedTicketsMetricMock.mockResolvedValue({
                data: { value: closedTickets },
                isError: false,
                isFetching: false,
            })

            const result = await fetchPercentageOfClosedTicketsMetricPerAgent(
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
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            fetchClosedTicketsMetricMock.mockResolvedValue({
                data: undefined,
                isError: false,
                isFetching: false,
            })

            const result = await fetchPercentageOfClosedTicketsMetricPerAgent(
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

        it('should return null on error', async () => {
            fetchClosedTicketsMetricPerAgentMock.mockRejectedValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            fetchClosedTicketsMetricMock.mockResolvedValue({
                data: undefined,
                isError: false,
                isFetching: false,
            })

            const result = await fetchPercentageOfClosedTicketsMetricPerAgent(
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

        it('should return something on partial data', async () => {
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
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

            fetchClosedTicketsMetricMock.mockResolvedValue({
                data: undefined,
                isError: false,
                isFetching: false,
            })

            const result = await fetchPercentageOfClosedTicketsMetricPerAgent(
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
    })
})
