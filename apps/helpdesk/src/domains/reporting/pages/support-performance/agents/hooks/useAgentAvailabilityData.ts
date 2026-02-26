import { useMemo } from 'react'

import { useListCustomUserAvailabilityStatuses } from '@gorgias/helpdesk-queries'

import type { User } from 'config/types/user'
import {
    useAvailabilityPerAgentPerStatus,
    useOnlineTimePerAgentAvailability,
} from 'domains/reporting/hooks/availability/useAvailabilityMetrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { transformAvailabilityData } from 'domains/reporting/pages/support-performance/agents/utils'
import type { StatusDimensionData } from 'domains/reporting/pages/support-performance/agents/utils'

export function useAgentAvailabilityData(
    allAgents: User[],
    cleanStatsFilters: StatsFilters,
    userTimezone: string,
) {
    const {
        data: customStatusesResponse,
        isLoading: isLoadingStatuses,
        isError: isErrorCustomStatuses,
    } = useListCustomUserAvailabilityStatuses()

    // Query 1: Total online time per agent (already calculated server-side)
    const {
        data: onlineTimeData,
        isFetching: isFetchingOnlineTime,
        isError: isErrorOnlineTime,
    } = useOnlineTimePerAgentAvailability(
        cleanStatsFilters,
        userTimezone,
        undefined,
        undefined,
    )

    // Query 2: Time in each status per agent
    const {
        data: perStatusData,
        isFetching: isFetchingPerStatus,
        isError: isErrorPerStatus,
    } = useAvailabilityPerAgentPerStatus(cleanStatsFilters, userTimezone)

    const customStatuses = useMemo(
        () => customStatusesResponse?.data.data || [],
        [customStatusesResponse],
    )

    const transformedAgents = useMemo(() => {
        if (
            !onlineTimeData?.allValues ||
            !perStatusData?.allData ||
            !allAgents.length
        ) {
            return []
        }

        return transformAvailabilityData(
            onlineTimeData.allValues,
            perStatusData.allData as StatusDimensionData,
            allAgents,
            customStatuses,
        )
    }, [onlineTimeData, perStatusData, allAgents, customStatuses])

    return {
        agents: transformedAgents,
        customStatuses,
        isLoading:
            isLoadingStatuses || isFetchingOnlineTime || isFetchingPerStatus,
        isError: isErrorOnlineTime || isErrorPerStatus,
        isErrorCustomStatuses,
    }
}
