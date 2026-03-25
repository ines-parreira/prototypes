import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentAutomationRatePerIntentQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentCoverageRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentCoverageRatePerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentAutomationRatePerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentCoverageRatePerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentAutomationRatePerIntentQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
