import {LiveCallQueueAgent} from '@gorgias/api-queries'

export enum AgentStatusCategory {
    Busy = 'Busy',
    Available = 'Available',
    Unavailable = 'Unavailable',
}

export const groupAgentsByStatus = (
    agents: LiveCallQueueAgent[]
): Record<AgentStatusCategory, LiveCallQueueAgent[]> => {
    const busyAgents: LiveCallQueueAgent[] = []
    const availableAgents: LiveCallQueueAgent[] = []
    const unavailableAgents: LiveCallQueueAgent[] = []

    agents.forEach((agent) => {
        if (agent.call_statuses?.length) {
            busyAgents.push(agent)
        } else if (agent.is_available_for_call) {
            availableAgents.push(agent)
        } else {
            unavailableAgents.push(agent)
        }
    })

    return {
        [AgentStatusCategory.Busy]: busyAgents,
        [AgentStatusCategory.Available]: availableAgents,
        [AgentStatusCategory.Unavailable]: unavailableAgents,
    }
}
