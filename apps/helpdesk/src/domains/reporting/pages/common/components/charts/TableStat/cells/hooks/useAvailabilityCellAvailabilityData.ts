import type { AgentStatusWithSystem } from '@repo/agent-status'
import { useUserAvailabilityStatus } from '@repo/agent-status'

import type { UserAvailability } from '@gorgias/helpdesk-queries'

type UseAvailabilityCellAvailabilityDataParams = {
    userId: number
}

type UseAvailabilityCellAvailabilityDataReturn = {
    availability: UserAvailability | undefined
    status: AgentStatusWithSystem | undefined
}

/**
 * Resolves a single agent's availability and derived status from the shared,
 * account-wide availability list cache (kept fresh app-wide by
 * `useUsersRealtimeUpdates`). There's no per-cell loading/error state — the
 * status is read from cache, not fetched here.
 */
export function useAvailabilityCellAvailabilityData({
    userId,
}: UseAvailabilityCellAvailabilityDataParams): UseAvailabilityCellAvailabilityDataReturn {
    const { availability, status } = useUserAvailabilityStatus({ userId })

    return { availability, status }
}
