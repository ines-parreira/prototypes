import { User } from 'config/types/user'
import {
    fetchMessagesSentMetricPerAgent,
    fetchOnlineTimePerAgent,
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
} from 'domains/reporting/hooks/metricsPerAgent'
import {
    fetchMessagesSentPerHourPerAgent,
    useMessagesSentPerHourPerAgent,
} from 'domains/reporting/hooks/useMessagesSentPerHourPerAgent'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'domains/reporting/models/cubes/agentxp/AgentTimeTrackingCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    StatsFilters,
    TagFilterInstanceId,
} from 'domains/reporting/models/stat/types'
import { assumeMock } from 'utils/testing'
import { renderHook } from 'utils/testing/renderHook'

jest.mock('domains/reporting/hooks/metricsPerAgent')
const useMessagesSentMetricPerAgentMock = assumeMock(
    useMessagesSentMetricPerAgent,
)
const useOnlineTimePerAgentMock = assumeMock(useOnlineTimePerAgent)
const fetchMessagesSentMetricPerAgentMock = assumeMock(
    fetchMessagesSentMetricPerAgent,
)
const fetchOnlineTimePerAgentMock = assumeMock(fetchOnlineTimePerAgent)

describe('MessagesSentPerAgent', () => {
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
    const messagesSentValue = 50
    const onlineTimeValue = 60 * 60 * 4
    const agent = {
        id: 123,
        name: 'User',
    } as User
    const useMessagesSentMetricPerAgentReturnValue = {
        data: {
            value: messagesSentValue,
            decile: 5,
            allData: [
                {
                    [HelpdeskMessageMeasure.MessageCount]:
                        String(messagesSentValue),
                    [HelpdeskMessageDimension.SenderId]: String(agent.id),
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

    describe('useMessagesSentPerHourPerAgent', () => {
        beforeEach(() => {
            useMessagesSentMetricPerAgentMock.mockReturnValue(
                useMessagesSentMetricPerAgentReturnValue,
            )
            useOnlineTimePerAgentMock.mockReturnValue(
                useOnlineTimePerAgentReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', () => {
            const { result } = renderHook(() =>
                useMessagesSentPerHourPerAgent(
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
                            [HelpdeskMessageMeasure.MessageCount]: String(
                                messagesSentValue / (onlineTimeValue / 60 / 60),
                            ),
                            [HelpdeskMessageDimension.SenderId]: String(
                                agent.id,
                            ),
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
                useMessagesSentPerHourPerAgent(
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
                            [HelpdeskMessageMeasure.MessageCount]: String(
                                messagesSentValue / (onlineTimeValue / 60 / 60),
                            ),
                            [HelpdeskMessageDimension.SenderId]: String(
                                agent.id,
                            ),
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
                useMessagesSentPerHourPerAgent(
                    statsFilters,
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(useMessagesSentMetricPerAgentMock).toHaveBeenCalledWith(
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
                useMessagesSentPerHourPerAgent(
                    {
                        period: statsFilters.period,
                    },
                    timeZone,
                    undefined,
                    String(agent.id),
                ),
            )

            expect(useMessagesSentMetricPerAgentMock).toHaveBeenCalledWith(
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
            useMessagesSentMetricPerAgentMock.mockReturnValue({
                ...useMessagesSentMetricPerAgentReturnValue,
                data: null,
            })
            useOnlineTimePerAgentMock.mockReturnValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const { result } = renderHook(() =>
                useMessagesSentPerHourPerAgent(
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

    describe('fetchMessagesSentPerHourPerAgent', () => {
        beforeEach(() => {
            fetchMessagesSentMetricPerAgentMock.mockResolvedValue(
                useMessagesSentMetricPerAgentReturnValue,
            )
            fetchOnlineTimePerAgentMock.mockResolvedValue(
                useOnlineTimePerAgentReturnValue,
            )
        })

        it('should calculate the metric from messages sent and online time', async () => {
            const result = await fetchMessagesSentPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: {
                    allData: [
                        {
                            [HelpdeskMessageMeasure.MessageCount]: String(
                                messagesSentValue / (onlineTimeValue / 60 / 60),
                            ),
                            [HelpdeskMessageDimension.SenderId]: String(
                                agent.id,
                            ),
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
            const result = await fetchMessagesSentPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(result).toEqual({
                data: {
                    allData: [
                        {
                            [HelpdeskMessageMeasure.MessageCount]: String(
                                messagesSentValue / (onlineTimeValue / 60 / 60),
                            ),
                            [HelpdeskMessageDimension.SenderId]: String(
                                agent.id,
                            ),
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
            await fetchMessagesSentPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(fetchMessagesSentMetricPerAgentMock).toHaveBeenCalledWith(
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
            await fetchMessagesSentPerHourPerAgent(
                {
                    period: statsFilters.period,
                },
                timeZone,
                undefined,
                String(agent.id),
            )

            expect(fetchMessagesSentMetricPerAgentMock).toHaveBeenCalledWith(
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
            fetchMessagesSentMetricPerAgentMock.mockResolvedValue({
                ...useMessagesSentMetricPerAgentReturnValue,
                data: null,
            })
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const result = await fetchMessagesSentPerHourPerAgent(
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
            fetchMessagesSentMetricPerAgentMock.mockRejectedValue({
                ...useMessagesSentMetricPerAgentReturnValue,
                data: null,
            })
            fetchOnlineTimePerAgentMock.mockResolvedValue({
                ...useOnlineTimePerAgentReturnValue,
                data: null,
            })

            const result = await fetchMessagesSentPerHourPerAgent(
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
