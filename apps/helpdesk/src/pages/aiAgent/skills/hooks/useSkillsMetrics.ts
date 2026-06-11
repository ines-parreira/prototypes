import { useMemo } from 'react'

import {
    getLast28DaysDateRange,
    useAllResourcesMetrics,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useAppSelector } from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

type DateRange = {
    start_datetime: string
    end_datetime: string
}

/**
 * Hook to fetch metrics for all skills articles
 * Fetches metrics for the provided date range, or the last 28 days by default:
 * - Number of tickets where each article was used
 * - Number of handover tickets
 * - Average CSAT score
 */
export const useSkillsMetrics = (
    shopIntegrationId: number,
    enabled: boolean = true,
    dateRange?: DateRange,
) => {
    const timezone = useAppSelector(getTimezone)
    const defaultDateRange = useMemo(() => getLast28DaysDateRange(), [])
    const metricsDateRange = dateRange ?? defaultDateRange

    return useAllResourcesMetrics({
        shopIntegrationId,
        timezone: timezone ?? 'UTC',
        enabled: enabled && !!shopIntegrationId,
        loadIntents: false,
        dateRange: metricsDateRange,
    })
}
