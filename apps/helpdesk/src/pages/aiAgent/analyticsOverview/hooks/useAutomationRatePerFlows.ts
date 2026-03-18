import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { overallAutomationRatePerFlowsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useAutomationRatePerFlows = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallAutomationRatePerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchAutomationRatePerFlows = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = overallAutomationRatePerFlowsQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
