import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSupportAgentTimeSavedPerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useTimeSavedByAgentPerSupportAgentIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSupportAgentTimeSavedPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchTimeSavedByAgentPerSupportAgentIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSupportAgentTimeSavedPerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
