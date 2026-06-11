import { useMemo } from 'react'

import {
    getLast28DaysDateRange,
    useResourceMetricsByDay,
} from 'domains/reporting/models/queryFactories/knowledge/knowledgeInsightsMetrics'
import { useAppSelector } from 'hooks/useAppSelector'
import { getTimezone } from 'state/currentUser/selectors'

type DateRange = {
    start_datetime: string
    end_datetime: string
}

/**
 * Hook to fetch per-day metrics for a single skill article.
 * Returns one row per day with ticket count and handover ticket count.
 */
export const useSkillsMetricsByDay = (
    shopIntegrationId: number,
    resourceSourceId: number,
    resourceSourceSetId: number,
    enabled: boolean = true,
    dateRange?: DateRange,
) => {
    const timezone = useAppSelector(getTimezone)
    const defaultDateRange = useMemo(() => getLast28DaysDateRange(), [])
    const metricsDateRange = dateRange ?? defaultDateRange

    return useResourceMetricsByDay({
        shopIntegrationId,
        resourceSourceId,
        resourceSourceSetId,
        timezone: timezone ?? 'UTC',
        enabled:
            enabled &&
            !!shopIntegrationId &&
            !!resourceSourceId &&
            !!resourceSourceSetId,
        dateRange: metricsDateRange,
    })
}
