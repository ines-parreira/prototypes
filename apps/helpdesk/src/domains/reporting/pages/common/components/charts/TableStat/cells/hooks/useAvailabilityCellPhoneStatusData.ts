import { useMemo } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'
import { useAgentPhoneStatus } from '@repo/agent-status'

import { usePerformancePageAgentPhoneStatuses } from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentPhoneStatuses'

type UseAvailabilityCellPhoneStatusDataParams = {
    userId: number
}

type UseAvailabilityCellPhoneStatusDataReturn = {
    agentPhoneUnavailabilityStatus: AgentStatusWithSystem | undefined
    isLoading: boolean
    isError: boolean
}

/**
 * Hook that manages phone status data fetching for a single agent.
 * Observes batch query state while reading individual data from cache.
 */
export function useAvailabilityCellPhoneStatusData({
    userId,
}: UseAvailabilityCellPhoneStatusDataParams): UseAvailabilityCellPhoneStatusDataReturn {
    const batchPhoneQuery = usePerformancePageAgentPhoneStatuses({
        enabled: false,
    })

    const { agentPhoneUnavailabilityStatus } = useAgentPhoneStatus({
        userId,
        cacheOnly: true,
    })

    const isLoading = useMemo(
        () => batchPhoneQuery.isLoading && !agentPhoneUnavailabilityStatus,
        [batchPhoneQuery, agentPhoneUnavailabilityStatus],
    )
    const isError = useMemo(
        () => batchPhoneQuery.isError && !agentPhoneUnavailabilityStatus,
        [batchPhoneQuery, agentPhoneUnavailabilityStatus],
    )

    return {
        agentPhoneUnavailabilityStatus,
        isLoading,
        isError,
    }
}
