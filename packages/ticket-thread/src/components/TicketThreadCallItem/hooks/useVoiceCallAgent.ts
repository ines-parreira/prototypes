import { useMemo } from 'react'

import { useAllUsers } from '@repo/users'

export function useVoiceCallAgent(agentId: number | null | undefined) {
    const agents = useAllUsers()

    return useMemo(() => {
        if (!agentId) return undefined
        return agents.find((agent) => agent.id === agentId)
    }, [agentId, agents])
}
