import {useGetAgent} from 'models/agents/queries'

export function useAgentDetails(agentId: number) {
    const initialAgentData = window.GORGIAS_STATE?.agents?.all?.find(
        (agent) => agent.id === agentId
    )

    const agentResponse = useGetAgent(agentId, {
        retry: false,
        staleTime: 30 * 60 * 1000, // 30 minutes
        initialData: initialAgentData,
    })

    return agentResponse
}
