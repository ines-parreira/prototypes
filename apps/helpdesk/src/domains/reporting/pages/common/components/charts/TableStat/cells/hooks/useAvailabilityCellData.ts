import { useMemo } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'
import {
    useAgentPhoneStatus,
    useUserAvailabilityStatus,
} from '@repo/agent-status'
import { DurationInMs } from '@repo/utils'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import { usePerformancePageAgentAvailabilities } from 'domains/reporting/pages/live/agents/hooks/usePerformancePageAgentAvailabilities'

type UseAvailabilityCellDataParams = {
    userId: number
}

type UseAvailabilityCellDataReturn = {
    availability: UserAvailability | undefined
    status: AgentStatusWithSystem | undefined
    agentPhoneUnavailabilityStatus: AgentStatusWithSystem | undefined
    isLoading: boolean
    isError: boolean
    isPhoneError: boolean
}

/**
 * Hook that manages data fetching and state coordination for agent availability cell.
 *
 * Coordinates between:
 * - Batch query (usePerformancePageAgentAvailabilities) - observes batch query state
 * - Individual cache read (useUserAvailabilityStatus with cacheOnly) - reads from cache
 * - Phone status query - checks if agent is on phone
 *
 * Solves the "eternal loading" problem by observing batch query state
 * while reading individual data from cache.
 */
export function useAvailabilityCellData({
    userId,
}: UseAvailabilityCellDataParams): UseAvailabilityCellDataReturn {
    // Just observing batch query state (React Query dedupes across all cells)
    const batchQuery = usePerformancePageAgentAvailabilities({
        enabled: false,
    })

    const { availability, status } = useUserAvailabilityStatus({
        userId,
        cacheOnly: true,
    })

    const {
        agentPhoneUnavailabilityStatus,
        isLoading: isLoadingPhone,
        isError: isErrorPhone,
    } = useAgentPhoneStatus({
        userId,
        staleTime: DurationInMs.FiveMinutes,
        cacheTime: DurationInMs.FifteenMinutes,
    })

    const isLoadingAvailability = useMemo(
        () => batchQuery.isLoading && !availability,
        [batchQuery, availability],
    )

    const shouldShowError = useMemo(() => {
        const isBatchError = batchQuery.isError && !availability
        const isAvailabilityMissing = !!batchQuery.data && !availability
        return isBatchError || isAvailabilityMissing
    }, [batchQuery, availability])

    return {
        availability,
        status,
        agentPhoneUnavailabilityStatus,
        isLoading: isLoadingAvailability || isLoadingPhone,
        isError: shouldShowError,
        isPhoneError: isErrorPhone,
    }
}
