import {
    fetchAIAgentAutomationRateTrend,
    useAIAgentAutomationRateTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomationRateQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomationRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useAiAgentAllAgentsAutomationRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const { stage, isLoading } = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATION_RATE,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useAIAgentAutomationRateTrend(
        filters,
        timezone,
        !isLoading && !isV2,
    )
    const v2Trend = useStatsMetricTrend(
        dynamicAllAgentsAutomationRateQueryFactoryV2({ filters, timezone }),
        dynamicAllAgentsAutomationRateQueryFactoryV2({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
        !isLoading && isV2,
    )

    return isV2 ? v2Trend : v1Trend
}

export const fetchAiAgentAllAgentsAutomationRateTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATION_RATE,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            dynamicAllAgentsAutomationRateQueryFactoryV2({ filters, timezone }),
            dynamicAllAgentsAutomationRateQueryFactoryV2({
                filters: {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            }),
        )
    }

    return fetchAIAgentAutomationRateTrend(filters, timezone, aiAgentUserId)
}
