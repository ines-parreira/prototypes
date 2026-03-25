import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentHandoverInteractionsPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/handoverInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { buildIntentFilters } from 'pages/aiAgent/analyticsAiAgent/hooks/intentFilters'

export const useHandoverInteractionsPerAllAgentsIntent = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentHandoverInteractionsPerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchHandoverInteractionsPerAllAgentsIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentHandoverInteractionsPerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
