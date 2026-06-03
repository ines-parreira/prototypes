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
 * Coordinates the data for an agent availability cell.
 *
 * Availability + derived status are read from the shared, account-wide
 * availability list cache (no per-cell loading/error). Phone status is fetched
 * per page, so its loading/error drive the cell's `isLoading` and
 * `errorMessage`.
 *
 * - hasNoData: true when we have neither availability nor phone status data
 * - errorMessage: set when the phone status query fails
 */
export function useAvailabilityCellData({
    userId,
}: UseAvailabilityCellDataParams): UseAvailabilityCellDataReturn {
    const { availability, status } = useAvailabilityCellAvailabilityData({
        userId,
    })

    const {
        agentPhoneUnavailabilityStatus,
        isOnActiveCall,
        isLoading: isLoadingPhoneStatus,
        isError: isErrorPhoneStatus,
    } = useAvailabilityCellPhoneStatusData({ userId })

    const hasNoData = useMemo(() => {
        return !availability && !agentPhoneUnavailabilityStatus
    }, [availability, agentPhoneUnavailabilityStatus])

    const errorMessage = useMemo(() => {
        return isErrorPhoneStatus ? 'Failed to load phone status' : null
    }, [isErrorPhoneStatus])

    return {
        availability,
        status,
        agentPhoneUnavailabilityStatus,
        isOnActiveCall,
        isLoading: isLoadingPhoneStatus,
        hasNoData,
        isLoadingAny: isLoadingPhoneStatus,
        errorMessage,
    }
}
