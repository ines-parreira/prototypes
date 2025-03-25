import { calculateTotalCapacity } from 'hooks/reporting/helpers'
import { calculateMetricPerHour } from 'hooks/reporting/useMessagesSentPerHour'
import {
    AgentTimeTrackingDimension,
    AgentTimeTrackingMeasure,
} from 'models/reporting/cubes/agentxp/AgentTimeTrackingCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
} from 'models/reporting/cubes/HelpdeskMessageCube'

const messagesSentAgentId = HelpdeskMessageDimension.SenderId
const messagesSentMeasure = HelpdeskMessageMeasure.MessageCount

const onlineTimeMeasure = AgentTimeTrackingMeasure.OnlineTime
const onlineTimeAgentID = AgentTimeTrackingDimension.UserId

jest.mock('hooks/useAppSelector')

describe('calculateTotalCapacity', () => {
    const agentId = '789726418'
    const agentsMessagesSent = 62
    const agentsOnlineTime = 18044
    const agentBId = '696020168'
    const messagesSentPayload = [
        {
            [messagesSentAgentId]: agentId,
            [messagesSentMeasure]: String(agentsMessagesSent),
            decile: '9',
        },
        {
            [messagesSentAgentId]: agentBId,
            [messagesSentMeasure]: String(agentsMessagesSent),
            decile: '9',
        },
        {
            [messagesSentAgentId]: '696020168',
            [messagesSentMeasure]: '9',
            decile: '7',
        },
        {
            [messagesSentAgentId]: '778779062',
            [messagesSentMeasure]: '1',
            decile: ' 5',
        },
        {
            [messagesSentAgentId]: '360037000',
            [messagesSentMeasure]: '1',
            decile: '3',
        },
        {
            [messagesSentAgentId]: '789752988',
            [messagesSentMeasure]: '1',
            decile: '1',
        },
    ]

    const onlineTime = [
        {
            [onlineTimeAgentID]: agentId,
            [onlineTimeMeasure]: String(agentsOnlineTime),
            decile: '9',
        },
        {
            [onlineTimeAgentID]: agentBId,
            [onlineTimeMeasure]: String(agentsOnlineTime),
            decile: '9',
        },
    ]

    it('should calculate a sum of each active agents capacity', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            messagesSentAgentId,
            messagesSentMeasure,
        )

        const agentACapacity = calculateMetricPerHour(
            agentsMessagesSent,
            agentsOnlineTime,
        )
        const agentBCapacity = calculateMetricPerHour(
            agentsMessagesSent,
            agentsOnlineTime,
        )

        expect(result).toEqual({ value: agentACapacity + agentBCapacity })
    })

    it('should return 0 if there is no corresponding agentId', () => {
        const messagesSentPayload = [
            {
                [messagesSentAgentId]: '789752988',
                [messagesSentMeasure]: '1',
                decile: '1',
            },
        ]

        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            messagesSentAgentId,
            messagesSentMeasure,
        )

        expect(result).toEqual({ value: 0 })
    })

    it('should return null if there is no online time data', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            undefined,
            messagesSentAgentId,
            messagesSentMeasure,
        )

        expect(result).toEqual({ value: null })
    })

    it('should return null if there is no messages sent data', () => {
        const result = calculateTotalCapacity(
            undefined,
            onlineTime,
            messagesSentAgentId,
            messagesSentMeasure,
        )

        expect(result).toEqual({ value: null })
    })

    it('should return 0 if its a wrong dimension', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            'wrong_id',
            messagesSentMeasure,
        )

        expect(result).toEqual({ value: 0 })
    })

    it('should return 0 if its a wrong measure', () => {
        const result = calculateTotalCapacity(
            messagesSentPayload,
            onlineTime,
            messagesSentAgentId,
            'wrong-measure',
        )

        expect(result).toEqual({ value: 0 })
    })
})
