import { useMemo } from 'react'

import type { AgentStatusWithSystem } from '../types'
import { useAgentStatuses } from './useAgentStatuses'

export function useCustomUserUnavailabilityStatus(
    statusId: string | null | undefined,
): AgentStatusWithSystem | undefined {
    const { data: allStatuses } = useAgentStatuses()

    return useMemo(() => {
        if (!statusId || !allStatuses) {
            return undefined
        }

        return allStatuses.find((status) => status.id === statusId)
    }, [statusId, allStatuses])
}
