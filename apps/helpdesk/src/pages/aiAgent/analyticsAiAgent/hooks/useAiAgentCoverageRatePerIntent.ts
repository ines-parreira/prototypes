import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentAutomationRatePerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentCoverageRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { buildIntentFilters } from 'pages/aiAgent/analyticsAiAgent/hooks/intentFilters'

export const useAiAgentCoverageRatePerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentAutomationRatePerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentCoverageRatePerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
    intentCustomFieldId: number,
) => {
    const query = aiAgentAutomationRatePerIntentQueryFactoryV2({
        filters: buildIntentFilters(statsFilters, intentCustomFieldId),
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
