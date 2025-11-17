import { assumeMock, renderHook } from '@repo/testing'

import type { User } from 'config/types/user'
import {
    fetchClosedTicketsMetricPerAgent,
    fetchOnlineTimePerAgent,
    useClosedTicketsMetricPerAgent,
    useOnlineTimePerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import {
    fetchTicketsClosedPerHourPerAgent,
    useTicketsClosedPerHourPerAgent,
} from 'domains/reporting/hooks/useTicketsClosedPerHourPerAgent'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import {
    TicketDimension,
    TicketMeasure,
} from 'domains/reporting/models/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TagFilterInstanceId } from 'domains/reporting/models/stat/types'

jest.mock('domains/reporting/hooks/metricsPerAgent')
const useClosedTicketsMetricPerAgentMock = assumeMock(
    useClosedTicketsMetricPerAgent,
)
const useOnlineTimePerAgentMock = assumeMock(useOnlineTimePerAgent)
const fetchClosedTicketsMetricPerAgentMock = assumeMock(
    fetchClosedTicketsMetricPerAgent,
)
const fetchOnlineTimePerAgentMock = assumeMock(fetchOnlineTimePerAgent)

describe('TicketsClosedPerAgent', () => {
    const statsFilters: StatsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        integrations: withDefaultLogicalOperator([456]),
        agents: withDefaultLogicalOperator([1, 2]),
        tags: [
            {
                ...withDefaultLogicalOperator([123]),
                filterInstanceId: TagFilterInstanceId.First,
            },
        ],
    }
    const timeZone = 'UTC'
    const ticketsClosedValue = 50
    const onlineTimeValue = 60 * 60 * 4
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const useClosedTicketsMetricPerAgentReturnValue = {
        data: {
            value: ticketsClosedValue,
            decile: 5,
            allData: [
                {
                    [TicketMeasure.TicketCount]: String(ticketsClosedValue),
                    [TicketDimension.AssigneeUserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }
    const useOnlineTimePerAgentReturnValue = {
        data: {
            value: onlineTimeValue,
            decile: 5,
            allData: [
                {
                    [AgentTimeTrackingMeasure.OnlineTime]:
                        String(onlineTimeValue),
                    [AgentTimeTrackingDimension.UserId]: String(agent.id),
                },
            ],
        },
        isFetching: false,
        isError: false,
    }

    describe('useTicketsClosedPerHourPerAgent.ts', () => {
        beforeEach(() => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue(
                useClosedTicketsMetricPerAgentReturnValue,
            )
            useOnlineTimePerAgentMock.mockReturnValue(
                useOnlineTimePerAgentReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', () => {
            const { result } = renderHook(() =>
                useTicketsClosedPerHourPerAgent(
                    statsFilters,
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(result.current).toEqual({
                data: {
                    allData: [
                        {
                            [TicketMeasure.TicketCount]: String(
                                ticketsClosedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketDimension.AssigneeUserId]: String(agent.id),
                        },
                    ],
                    decile: 9,
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should handle no data', () => {
            const { result } = renderHook(() =>
                useTicketsClosedPerHourPerAgent(
                    statsFilters,
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(result.current).toEqual({
                data: {
                    allData: [
                        {
                            [TicketMeasure.TicketCount]: String(
                                ticketsClosedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketDimension.AssigneeUserId]: String(agent.id),
                        },
                    ],
                    decile: 9,
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should strip the statsFilters to period and agents only', () => {
            renderHook(() =>
                useTicketsClosedPerHourPerAgent(
                    statsFilters,
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(useClosedTicketsMetricPerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
            expect(useOnlineTimePerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
        })

        it('should strip the statsFilters to period when no agents', () => {
            renderHook(() =>
                useTicketsClosedPerHourPerAgent(
                    {
                        period: statsFilters.period,
                    },
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(useClosedTicketsMetricPerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
            expect(useOnlineTimePerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
        })

        it('should return empty data when no data available', () => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
                ...useClosedTicketsMetricPerAgentReturnValue,
                data: null,
            })
            useOnlineTimePerAgentMock.mockReturnValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const { result } = renderHook(() =>
                useTicketsClosedPerHourPerAgent(
                    statsFilters,
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(result.current).toEqual({
                data: {
                    allData: [],
                    decile: -0,
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty data on error', () => {
            useClosedTicketsMetricPerAgentMock.mockReturnValue({
                ...useClosedTicketsMetricPerAgentReturnValue,
                data: null,
            })
            useOnlineTimePerAgentMock.mockReturnValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const { result } = renderHook(() =>
                useTicketsClosedPerHourPerAgent(
                    statsFilters,
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(result.current).toEqual({
                data: {
                    allData: [],
                    decile: -0,
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })
    })

    describe('fetchTicketsClosedPerHourPerAgent.ts', () => {
        beforeEach(() => {
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue(
                useClosedTicketsMetricPerAgentReturnValue,
            )
            fetchOnlineTimePerAgentMock.mockResolvedValue(
                useOnlineTimePerAgentReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', async () => {
            const result = await fetchTicketsClosedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: {
                    allData: [
                        {
                            [TicketMeasure.TicketCount]: String(
                                ticketsClosedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketDimension.AssigneeUserId]: String(agent.id),
                        },
                    ],
                    decile: 9,
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should handle no data', async () => {
            const result = await fetchTicketsClosedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: {
                    allData: [
                        {
                            [TicketMeasure.TicketCount]: String(
                                ticketsClosedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketDimension.AssigneeUserId]: String(agent.id),
                        },
                    ],
                    decile: 9,
                    value: 12.5,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should strip the statsFilters to period and agents only', async () => {
            await fetchTicketsClosedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(fetchClosedTicketsMetricPerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
            expect(fetchOnlineTimePerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                    agents: statsFilters.agents,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
        })

        it('should strip the statsFilters to period when no agents', async () => {
            await fetchTicketsClosedPerHourPerAgent(
                {
                    period: statsFilters.period,
                },
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(fetchClosedTicketsMetricPerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
            expect(fetchOnlineTimePerAgentMock).toHaveBeenCalledWith(
                {
                    period: statsFilters.period,
                },
                timeZone,
                undefined,
                String(agent.id),
            )
        })

        it('should return empty data when no data available', async () => {
            fetchClosedTicketsMetricPerAgentMock.mockResolvedValue({
                ...useClosedTicketsMetricPerAgentReturnValue,
                data: null,
            })
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const result = await fetchTicketsClosedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: {
                    allData: [],
                    decile: -0,
                    value: null,
                },
                isError: false,
                isFetching: false,
            })
        })

        it('should return empty data on error', async () => {
            fetchClosedTicketsMetricPerAgentMock.mockRejectedValue({
                ...useClosedTicketsMetricPerAgentReturnValue,
                data: null,
            })
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const result = await fetchTicketsClosedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: null,
                isError: true,
                isFetching: false,
            })
        })
    })
})
