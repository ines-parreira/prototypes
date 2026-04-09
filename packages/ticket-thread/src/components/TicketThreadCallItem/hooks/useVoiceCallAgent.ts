import { useMemo } from 'react'

import { useListAllHumanAgents } from '@repo/users'

export function useVoiceCallAgent(agentId: number | null | undefined) {
    const { data: agents } = useListAllHumanAgents()

    return useMemo(() => {
        if (!agentId || !agents) return undefined
        return agents.find((agent) => agent.id === agentId)
    }, [agentId, agents])
}
