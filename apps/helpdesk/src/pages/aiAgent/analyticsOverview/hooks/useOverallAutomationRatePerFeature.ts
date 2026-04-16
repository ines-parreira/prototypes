import {
    fetchStatsMetricPerDimension,
    useStatsMetricPerDimension,
} from 'domains/reporting/hooks/useStatsMetricPerDimension'
import { automationRatePerFeatureQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'

export const useOverallAutomationRatePerFeature = (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = automationRatePerFeatureQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return useStatsMetricPerDimension(query)
}

export const fetchOverallAutomationRatePerFeature = async (
    statsFilters: StatsFilters,
    timezone: string,
) => {
    const query = automationRatePerFeatureQueryFactoryV2({
        filters: statsFilters,
        timezone,
    })
    return fetchStatsMetricPerDimension(query)
}
