import {
    fetchAutomationRateTrend,
    useAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    dynamicOverallAutomationRate,
    dynamicOverallAutomationRateQueryFactoryV2,
} from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useOverallAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const { stage } = useGetNewStatsFeatureFlagMigration(
        dynamicOverallAutomationRate.name,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1 = useAutomationRateTrend(filters, timezone, !isV2)
    const v2 = useStatsMetricTrend(
        dynamicOverallAutomationRateQueryFactoryV2({ filters, timezone }),
        dynamicOverallAutomationRateQueryFactoryV2({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
        isV2,
    )

    return isV2 ? v2 : v1
}

export const fetchOverallAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId?: number | undefined,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        dynamicOverallAutomationRate.name,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            dynamicOverallAutomationRateQueryFactoryV2({ filters, timezone }),
            dynamicOverallAutomationRateQueryFactoryV2({
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            }),
        )
    }

    return fetchAutomationRateTrend(filters, timezone, aiAgentUserId)
}
