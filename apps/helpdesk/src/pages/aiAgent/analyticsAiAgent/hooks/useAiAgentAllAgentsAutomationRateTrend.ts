import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAllAgentsAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        dynamicAllAgentsAutomationRateQueryFactoryV2({ filters, timezone }),
        dynamicAllAgentsAutomationRateQueryFactoryV2({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentAllAgentsAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        dynamicAllAgentsAutomationRateQueryFactoryV2({ filters, timezone }),
        dynamicAllAgentsAutomationRateQueryFactoryV2({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
