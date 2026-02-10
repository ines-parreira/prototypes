import { useListUserAvailabilities } from '@repo/agent-status'

import useAppSelector from 'hooks/useAppSelector'
import { getUserIdsFromLiveAgentsPerformance } from 'state/entities/stats/selectors'

type UsePerformancePageAgentAvailabilitiesParams = {
    enabled: boolean
}

/**
 * Hook to fetch user availability data for all agents in the Live Agents performance table.
 *
 * Extracts user IDs from the live agents performance stat in Redux state
 * and fetches their availability statuses via a batch query.
 *
 * This populates the React Query cache with availability data for all visible agents,
 * which can then be read by individual cells using cache-only mode.
 *
 * @param enabled - Whether the batch query should run
 * @returns The batch query result with data, loading, and error states
 */
export function usePerformancePageAgentAvailabilities({
    enabled,
}: UsePerformancePageAgentAvailabilitiesParams) {
    const userIds = useAppSelector(getUserIdsFromLiveAgentsPerformance)

    return useListUserAvailabilities({
        userIds,
        enabled: enabled && userIds.length > 0,
    })
}
