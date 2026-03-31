import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiSupportAgentSuccessRatePerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useSuccessRatePerSupportAgentIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportAgentSuccessRatePerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchSuccessRatePerSupportAgentIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiSupportAgentSuccessRatePerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
