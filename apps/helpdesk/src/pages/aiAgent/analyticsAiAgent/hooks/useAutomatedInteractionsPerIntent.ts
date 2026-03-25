import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentAutomatedInteractionsPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { buildIntentFilters } from 'pages/aiAgent/analyticsAiAgent/hooks/intentFilters'

export const useAutomatedInteractionsPerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentAutomatedInteractionsPerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomatedInteractionsPerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentAutomatedInteractionsPerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
