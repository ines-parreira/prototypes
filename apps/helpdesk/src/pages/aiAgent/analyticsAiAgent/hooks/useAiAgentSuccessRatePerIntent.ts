import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSuccessRatePerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentSuccessRatePerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSuccessRatePerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentSuccessRatePerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSuccessRatePerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
