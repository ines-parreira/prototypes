import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSuccessRatePerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { buildIntentFilters } from 'pages/aiAgent/analyticsAiAgent/hooks/intentFilters'

export const useAiAgentSuccessRatePerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentSuccessRatePerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentSuccessRatePerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentSuccessRatePerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
