import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    handoverInteractionsPerIntentQueryFactory,
    snoozedInteractionsPerIntentQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/intentMetrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intent?: string,
) => {
    return useMetricPerDimension(
        handoverInteractionsPerIntentQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
        ),
        intent,
    )
}

export const useSnoozedInteractionsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intent?: string,
) => {
    return useMetricPerDimension(
        snoozedInteractionsPerIntentQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
        ),
        intent,
    )
}
