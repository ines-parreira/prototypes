import {renderHook} from '@testing-library/react-hooks'

import {User} from 'config/types/user'
import {
    useMessagesSentMetricPerAgent,
    useOnlineTimePerAgent,
} from 'hooks/reporting/metricsPerAgent'
import {useMessagesSentPerHourPerAgent} from 'hooks/reporting/useMessagesSentPerHourPerAgent'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {assumeMock} from 'utils/testing'

jest.mock('hooks/reporting/metricsPerAgent')
const useMessagesSentMetricPerAgentMock = assumeMock(
    useMessagesSentMetricPerAgent
)
const useOnlineTimePerAgentMock = assumeMock(useOnlineTimePerAgent)

describe('useMessagesSentPerHourPerAgent.ts', () => {
    const statsFilters = {
        period: {
            start_datetime: '2021-05-29T00:00:00+02:00',
            end_datetime: '2021-06-04T23:59:59+02:00',
        },
        integrations: [456],
        agents: [1, 2],
        tags: [123],
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

    beforeEach(() => {
        useMessagesSentMetricPerAgentMock.mockReturnValue(
            useMessagesSentMetricPerAgentReturnValue
        )
        useOnlineTimePerAgentMock.mockReturnValue(
            useOnlineTimePerAgentReturnValue
        )
    })

    it('should calculate the metric from messages sent and online time', () => {
        const {result} = renderHook(() =>
            useMessagesSentPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id)
            )
        )

        expect(result.current).toEqual({
            data: {
                allData: [
                    {
                        [HelpdeskMessageMeasure.MessageCount]: String(
                            messagesSentValue / (onlineTimeValue / 60 / 60)
                        ),
                        [HelpdeskMessageDimension.SenderId]: String(agent.id),
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
        const {result} = renderHook(() =>
            useMessagesSentPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id)
            )
        )

        expect(result.current).toEqual({
            data: {
                allData: [
                    {
                        [HelpdeskMessageMeasure.MessageCount]: String(
                            messagesSentValue / (onlineTimeValue / 60 / 60)
                        ),
                        [HelpdeskMessageDimension.SenderId]: String(agent.id),
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
                String(agent.id)
            )
        )

        expect(useMessagesSentMetricPerAgentMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
                agents: statsFilters.agents,
            },
            timeZone,
            undefined,
            String(agent.id)
        )
        expect(useOnlineTimePerAgentMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
                agents: statsFilters.agents,
            },
            timeZone,
            undefined,
            String(agent.id)
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
                String(agent.id)
            )
        )

        expect(useMessagesSentMetricPerAgentMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
            },
            timeZone,
            undefined,
            String(agent.id)
        )
        expect(useOnlineTimePerAgentMock).toHaveBeenCalledWith(
            {
                period: statsFilters.period,
            },
            timeZone,
            undefined,
            String(agent.id)
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

        const {result} = renderHook(() =>
            useMessagesSentPerHourPerAgent(
                statsFilters,
                timeZone,
                undefined,
                String(agent.id)
            )
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
