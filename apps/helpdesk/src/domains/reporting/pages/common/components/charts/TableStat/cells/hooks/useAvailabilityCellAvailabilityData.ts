import { useMemo } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'
import { useUserAvailabilityStatus } from '@repo/agent-status'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import { usePerformancePageAgentAvailabilities } from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentAvailabilities'

type UseAvailabilityCellAvailabilityDataParams = {
    userId: number
}

type UseAvailabilityCellAvailabilityDataReturn = {
    availability: UserAvailability | undefined
    status: AgentStatusWithSystem | undefined
    isLoading: boolean
    isError: boolean
}

/**
 * Hook that manages availability data fetching for a single agent.
 * Observes batch query state while reading individual data from cache.
 */
export function useAvailabilityCellAvailabilityData({
    userId,
}: UseAvailabilityCellAvailabilityDataParams): UseAvailabilityCellAvailabilityDataReturn {
    const batchQuery = usePerformancePageAgentAvailabilities({
        enabled: false,
    })

    const { availability, status } = useUserAvailabilityStatus({
        userId,
        cacheOnly: true,
    })

    const isLoading = useMemo(
        () => batchQuery.isLoading && !availability,
        [batchQuery, availability],
    )

    return {
        availability,
        status,
        isLoading,
        isError: batchQuery.isError,
    }
}
