import { useMetricPerDimension } from 'domains/reporting/hooks/useMetricPerDimension'
import {
    handoverInteractionsPerIntentQueryFactory,
    snoozedInteractionsPerIntentQueryFactory,
    totalInteractionsPerIntentQueryFactory,
} from 'domains/reporting/models/queryFactories/ai-agent-insights/intentMetrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useHandoverInteractionsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
) => {
    return useMetricPerDimension(
        handoverInteractionsPerIntentQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
            intentCustomFieldId,
        ),
    )
}

export const useSnoozedInteractionsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
) => {
    return useMetricPerDimension(
        snoozedInteractionsPerIntentQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
            intentCustomFieldId,
        ),
    )
}

export const useTotalInteractionsPerIntent = (
    filters: StatsFilters,
    timezone: string,
    outcomeCustomFieldId: number,
    intentCustomFieldId: number,
) => {
    return useMetricPerDimension(
        totalInteractionsPerIntentQueryFactory(
            filters,
            timezone,
            outcomeCustomFieldId,
            intentCustomFieldId,
        ),
    )
}
