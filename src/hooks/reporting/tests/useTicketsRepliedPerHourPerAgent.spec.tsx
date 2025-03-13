import { renderHook } from '@testing-library/react-hooks'

import { User } from 'config/types/user'
import {
    fetchOnlineTimePerAgent,
    fetchTicketsRepliedMetricPerAgent,
    useOnlineTimePerAgent,
    useTicketsRepliedMetricPerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {
    fetchTicketsRepliedPerHourPerAgent,
    useTicketsRepliedPerHourPerAgent,
} from 'hooks/reporting/useTicketsRepliedPerHourPerAgent'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import { HelpdeskMessageMeasure } from 'models/reporting/cubes/HelpdeskMessageCube'
import { TicketMember } from 'models/reporting/cubes/TicketCube'
import { withDefaultLogicalOperator } from 'models/reporting/queryFactories/utils'
import { StatsFilters, TagFilterInstanceId } from 'models/stat/types'
import { assumeMock } from 'utils/testing'

jest.mock('hooks/reporting/metricsPerAgent')
const useTicketsRepliedMetricPerAgentMock = assumeMock(
    useTicketsRepliedMetricPerAgent,
)
const useOnlineTimePerAgentMock = assumeMock(useOnlineTimePerAgent)
const fetchTicketsRepliedMetricPerAgentMock = assumeMock(
    fetchTicketsRepliedMetricPerAgent,
)
const fetchOnlineTimePerAgentMock = assumeMock(fetchOnlineTimePerAgent)

describe('TicketsRepliedPerHourPerAgent.ts', () => {
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
    const ticketsRepliedValue = 50
    const onlineTimeValue = 60 * 60 * 4
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const useRepliedTicketsMetricPerAgentReturnValue = {
        data: {
            value: ticketsRepliedValue,
            decile: 5,
            allData: [
                {
                    [HelpdeskMessageMeasure.TicketCount]:
                        String(ticketsRepliedValue),
                    [TicketMember.MessageSenderId]: String(agent.id),
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

    describe('useTicketsRepliedPerHourPerAgent()', () => {
        beforeEach(() => {
            useTicketsRepliedMetricPerAgentMock.mockReturnValue(
                useRepliedTicketsMetricPerAgentReturnValue,
            )
            useOnlineTimePerAgentMock.mockReturnValue(
                useOnlineTimePerAgentReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', () => {
            const { result } = renderHook(() =>
                useTicketsRepliedPerHourPerAgent(
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
                            [HelpdeskMessageMeasure.TicketCount]: String(
                                ticketsRepliedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketMember.MessageSenderId]: String(agent.id),
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
                useTicketsRepliedPerHourPerAgent(
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
                            [HelpdeskMessageMeasure.TicketCount]: String(
                                ticketsRepliedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketMember.MessageSenderId]: String(agent.id),
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
                useTicketsRepliedPerHourPerAgent(
                    statsFilters,
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(useTicketsRepliedMetricPerAgentMock).toHaveBeenCalledWith(
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
                useTicketsRepliedPerHourPerAgent(
                    {
                        period: statsFilters.period,
                    },
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(useTicketsRepliedMetricPerAgentMock).toHaveBeenCalledWith(
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
            useTicketsRepliedMetricPerAgentMock.mockReturnValue({
                ...useRepliedTicketsMetricPerAgentReturnValue,
                data: null,
            })
            useOnlineTimePerAgentMock.mockReturnValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const { result } = renderHook(() =>
                useTicketsRepliedPerHourPerAgent(
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

    describe('fetchTicketsRepliedPerHourPerAgent()', () => {
        beforeEach(() => {
            fetchTicketsRepliedMetricPerAgentMock.mockResolvedValue(
                useRepliedTicketsMetricPerAgentReturnValue,
            )
            fetchOnlineTimePerAgentMock.mockResolvedValue(
                useOnlineTimePerAgentReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', async () => {
            const result = await fetchTicketsRepliedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: {
                    allData: [
                        {
                            [HelpdeskMessageMeasure.TicketCount]: String(
                                ticketsRepliedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketMember.MessageSenderId]: String(agent.id),
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
            const result = await fetchTicketsRepliedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: {
                    allData: [
                        {
                            [HelpdeskMessageMeasure.TicketCount]: String(
                                ticketsRepliedValue /
                                    (onlineTimeValue / 60 / 60),
                            ),
                            [TicketMember.MessageSenderId]: String(agent.id),
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
            await fetchTicketsRepliedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(fetchTicketsRepliedMetricPerAgentMock).toHaveBeenCalledWith(
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
            await fetchTicketsRepliedPerHourPerAgent(
                {
                    period: statsFilters.period,
                },
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(fetchTicketsRepliedMetricPerAgentMock).toHaveBeenCalledWith(
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
            fetchTicketsRepliedMetricPerAgentMock.mockResolvedValue({
                ...useRepliedTicketsMetricPerAgentReturnValue,
                data: null,
            })
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const result = await fetchTicketsRepliedPerHourPerAgent(
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
            fetchTicketsRepliedMetricPerAgentMock.mockRejectedValue({
                ...useRepliedTicketsMetricPerAgentReturnValue,
                data: null,
            })
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const result = await fetchTicketsRepliedPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: null,
                isError: false,
                isFetching: false,
            })
        })
    })
})
