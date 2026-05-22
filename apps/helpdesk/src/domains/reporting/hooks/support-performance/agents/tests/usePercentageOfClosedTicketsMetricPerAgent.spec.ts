import { assumeMock, renderHook } from '@repo/testing'
import moment from 'moment/moment'

import { TicketChannel } from 'business/types/ticket'
import {
    fetchClosedTicketsMetric,
    useClosedTicketsMetric,
} from 'domains/reporting/hooks/metrics'
import {
    fetchClosedTicketsMetricPerAgent,
    useClosedTicketsMetricPerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import {
    fetchPercentageOfClosedTicketsMetricPerAgent,
    usePercentageOfClosedTicketsMetricPerAgent,
} from 'domains/reporting/hooks/support-performance/agents/usePercentageOfClosedTicketsMetricPerAgent'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

jest.mock('domains/reporting/hooks/metricsPerAgent')
jest.mock('domains/reporting/hooks/metrics')
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
                        {
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${ticketCount}`,
                        },
                    ],
                    value: ticketCount,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
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
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${
                                (ticketCount / closedTickets) * 100
                            }`,
                        },
                    ],
                    allValues: [
                        {
                            dimension: agentId,
                            value: (ticketCount / closedTickets) * 100,
                            decile: null,
                        },
                    ],
                    value: (ticketCount / closedTickets) * 100,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should support v2 dimension and measure keys', () => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
                data: {
                    allData: [
                        {
                            agentId: agentId,
                            ticketCount: `${ticketCount}`,
                        },
                    ],
                    value: ticketCount,
                    decile: null,
                    dimensions: ['agentId'],
                    measures: ['ticketCount'],
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
                            agentId: agentId,
                            ticketCount: `${
                                (ticketCount / closedTickets) * 100
                            }`,
                        },
                    ],
                    allValues: [
                        {
                            dimension: agentId,
                            value: (ticketCount / closedTickets) * 100,
                            decile: null,
                        },
                    ],
                    value: (ticketCount / closedTickets) * 100,
                    decile: null,
                    dimensions: ['agentId'],
                    measures: ['ticketCount'],
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
                    allValues: [],
                    value: null,
                    decile: null,
                    dimensions: [],
                    measures: [],
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should return something on partial data', () => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
                data: {
                    allData: [
                        {
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${ticketCount}`,
                        },
                    ],
                    value: ticketCount,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
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
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${ticketCount}`,
                        },
                    ],
                    allValues: [
                        {
                            dimension: agentId,
                            value: ticketCount,
                            decile: null,
                        },
                    ],
                    value: null,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
                },
                isFetching: false,
                isError: false,
            })
        })

        it('should produce null allValues entry when measure value is null', () => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
                data: {
                    allData: [
                        {
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]:
                                null as unknown as string,
                        },
                    ],
                    value: null,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
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

            expect(result.current.data?.allValues).toEqual([
                { dimension: agentId, value: null, decile: null },
            ])
        })

        it('should reflect isFetching and isError from either metric', () => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
                data: null,
                isError: false,
                isFetching: false,
            })

            useClosedTicketsMetricMock.mockReturnValue({
                data: undefined,
                isError: true,
                isFetching: true,
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

            expect(result.current.isFetching).toBe(true)
            expect(result.current.isError).toBe(true)
        })
    })

    describe('fetchPercentageOfClosedTicketsMetricPerAgent', () => {
        it('should pass return percentage of closed tickets', async () => {
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
                data: {
                    allData: [
                        {
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${ticketCount}`,
                        },
                    ],
                    value: ticketCount,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
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
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${
                                (ticketCount / closedTickets) * 100
                            }`,
                        },
                    ],
                    allValues: [
                        {
                            dimension: agentId,
                            value: (ticketCount / closedTickets) * 100,
                            decile: null,
                        },
                    ],
                    value: (ticketCount / closedTickets) * 100,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
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
                    allValues: [],
                    value: null,
                    decile: null,
                    dimensions: [],
                    measures: [],
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
                        {
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${ticketCount}`,
                        },
                    ],
                    value: ticketCount,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
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
                            [TicketDimension.AssigneeUserId]: agentId,
                            [TicketMeasure.TicketCount]: `${ticketCount}`,
                        },
                    ],
                    allValues: [
                        {
                            dimension: agentId,
                            value: ticketCount,
                            decile: null,
                        },
                    ],
                    value: null,
                    decile: null,
                    dimensions: [TicketDimension.AssigneeUserId],
                    measures: [TicketMeasure.TicketCount],
                },
                isFetching: false,
                isError: false,
            })
        })
    })
})
