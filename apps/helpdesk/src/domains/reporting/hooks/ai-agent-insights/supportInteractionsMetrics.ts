import { useMetric } from 'domains/reporting/hooks/useMetric'
import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    supportInteractionsPerIntentQueryFactory,
    supportInteractionsTotalQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/supportInteractionsMetrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useSupportInteractionsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
) => {
    return useMetricPerDimension(
        supportInteractionsPerIntentQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
            intentCustomFieldId,
        ),
    )
}

export const useSupportInteractionsTotal = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
) => {
    return useMetric(
        supportInteractionsTotalQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
            intentCustomFieldId,
        ),
    )
}
