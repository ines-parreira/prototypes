import {
    LiveCallQueueAgent,
    LiveCallQueueAgentCallStatusesItem,
} from '@gorgias/api-queries'

export enum AgentStatusCategory {
    Busy = 'Busy',
    Available = 'Available',
    Unavailable = 'Unavailable',
}

export const isAgentBusy = (agent: LiveCallQueueAgent): boolean => {
    return !!agent.call_statuses?.length
}

export const isAgentAvailable = (agent: LiveCallQueueAgent): boolean => {
    return !!agent.is_available_for_call
}

const sortOnlineAgentsFirst = (
    agents: LiveCallQueueAgent[]
): LiveCallQueueAgent[] => {
    return agents.sort((agentA) => (agentA.online ? -1 : 1))
}

export const groupAgentsByStatus = (
    agents: LiveCallQueueAgent[]
): Record<AgentStatusCategory, LiveCallQueueAgent[]> => {
    const busyAgents: LiveCallQueueAgent[] = []
    const availableAgents: LiveCallQueueAgent[] = []
    const unavailableAgents: LiveCallQueueAgent[] = []

    agents.forEach((agent) => {
        if (isAgentBusy(agent)) {
            busyAgents.push(agent)
        } else if (isAgentAvailable(agent)) {
            availableAgents.push(agent)
        } else {
            unavailableAgents.push(agent)
        }
    })

    return {
        [AgentStatusCategory.Busy]: busyAgents,
        [AgentStatusCategory.Available]: sortOnlineAgentsFirst(availableAgents),
        [AgentStatusCategory.Unavailable]:
            sortOnlineAgentsFirst(unavailableAgents),
    }
}

export const getOldestCall = (
    agent: LiveCallQueueAgent
): LiveCallQueueAgentCallStatusesItem | null => {
    if (!agent.call_statuses?.length) {
        return null
    }

    return agent.call_statuses?.reduce((oldestCall, call) => {
        if (!oldestCall) {
            return call
        }

        return call.created_datetime &&
            oldestCall.created_datetime &&
            call.created_datetime < oldestCall.created_datetime
            ? call
            : oldestCall
    })
}
