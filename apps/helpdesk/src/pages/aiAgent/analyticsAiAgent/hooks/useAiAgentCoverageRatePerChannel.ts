import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentCoverageRatePerChannelQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentCoverageRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAiAgentCoverageRatePerChannel = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentCoverageRatePerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAiAgentCoverageRatePerChannel = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentCoverageRatePerChannelQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
