import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { aiAgentSalesConversionRatePerIntentQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentConversionRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useConversionRatePerIntent = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesConversionRatePerIntentQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchConversionRatePerIntent = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = aiAgentSalesConversionRatePerIntentQueryV2Factory({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
