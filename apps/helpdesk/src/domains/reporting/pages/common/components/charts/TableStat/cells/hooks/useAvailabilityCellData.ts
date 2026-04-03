import { useMemo } from 'react'

import type { AgentStatusWithSystem } from '@repo/agent-status'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

import { useAvailabilityCellAvailabilityData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellAvailabilityData'
import { useAvailabilityCellPhoneStatusData } from 'domains/reporting/pages/common/components/charts/TableStat/cells/hooks/useAvailabilityCellPhoneStatusData'

type UseAvailabilityCellDataParams = {
    userId: number
}

type UseAvailabilityCellDataReturn = {
    availability: UserAvailability | undefined
    status: AgentStatusWithSystem | undefined
    agentPhoneUnavailabilityStatus: AgentStatusWithSystem | undefined
    isOnActiveCall: boolean
    isLoading: boolean
    hasNoData: boolean
    isLoadingAny: boolean
    errorMessage: string | null
}

/**
 * Hook that manages data fetching and state coordination for agent availability cell.
 *
 * Coordinates between:
 * - Batch queries & corresponding individual cache reads
 * - Child hooks that implement the "eternal loading" solution
 *
 * Loading/Error behavior:
 * - isLoading: true when either child hook reports loading (child hooks check batch loading && no cached data)
 * - hasNoData: true when we have neither availability nor phone status data
 * - errorMessage: describes which query failed (availability, phone status, or both)
 *
 * Solves the "eternal loading" problem by having child hooks observe batch query state
 * while reading individual data from cache.
 */
export function useAvailabilityCellData({
    userId,
}: UseAvailabilityCellDataParams): UseAvailabilityCellDataReturn {
    const {
        availability,
        status,
        isLoading: isLoadingAvailability,
        isError: isErrorAvailability,
    } = useAvailabilityCellAvailabilityData({ userId })

    const {
        agentPhoneUnavailabilityStatus,
        isOnActiveCall,
        isLoading: isLoadingPhoneStatus,
        isError: isErrorPhoneStatus,
    } = useAvailabilityCellPhoneStatusData({ userId })

    const isLoadingAny = useMemo(() => {
        return isLoadingAvailability || isLoadingPhoneStatus
    }, [isLoadingAvailability, isLoadingPhoneStatus])

    const hasNoData = useMemo(() => {
        return !availability && !agentPhoneUnavailabilityStatus
    }, [availability, agentPhoneUnavailabilityStatus])

    const errorMessage = useMemo(() => {
        if (isErrorAvailability && isErrorPhoneStatus) {
            return 'Failed to load availability and phone status'
        }
        if (isErrorAvailability) {
            return 'Failed to load availability status'
        }
        if (isErrorPhoneStatus) {
            return 'Failed to load phone status'
        }
        return null
    }, [isErrorAvailability, isErrorPhoneStatus])

    return {
        availability,
        status,
        agentPhoneUnavailabilityStatus,
        isOnActiveCall,
        isLoading: isLoadingAvailability || isLoadingPhoneStatus,
        hasNoData,
        isLoadingAny,
        errorMessage,
    }
}
