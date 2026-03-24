import { useMemo } from 'react'

import {
    getLast28DaysDateRange,
    useAllResourcesMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import useAppSelector from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

/**
 * Hook to fetch metrics for all skills articles
 * Fetches metrics for the last 28 days:
 * - Number of tickets where each article was used
 * - Number of handover tickets
 * - Average CSAT score
 */
export const useSkillsMetrics = (
    shopIntegrationId: number,
    enabled: boolean = true,
) => {
    const timezone = useAppSelector(getTimezone)
    const metricsDateRange = useMemo(() => getLast28DaysDateRange(), [])

    return useAllResourcesMetrics({
        shopIntegrationId,
        timezone: timezone ?? 'UTC',
        enabled: enabled && !!shopIntegrationId,
        loadIntents: false, // Don't load intents for skills table
        dateRange: metricsDateRange,
    })
}
