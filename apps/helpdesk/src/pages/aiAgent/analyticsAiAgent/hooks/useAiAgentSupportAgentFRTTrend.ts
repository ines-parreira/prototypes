import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import {
    fetchDecreaseInFirstResponseTimeTrend,
    useDecreaseInFirstResponseTimeTrend,
} from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import { aiAgentSupportAgentDecreaseInFRTQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentDecreaseInFirstResponseTime'
import { APIOnlyFilterKey } from 'domains/reporting/models/stat/types'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

const applySupportAgentFilter = (filters: StatsFilters) => ({
    ...filters,
    [APIOnlyFilterKey.AiAgentRole]: withDefaultLogicalOperator([
        AIAgentSkills.AIAgentSupport,
    ]),
})

export const useAiAgentSupportAgentFRTTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const agentFilters = applyAiAgentFilter(filters, aiAgentUserId)
    const v1Filters = applySupportAgentFilter(agentFilters)

    const { stage, isLoading } = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_DECREASE_IN_FRT,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useDecreaseInFirstResponseTimeTrend(
        v1Filters,
        timezone,
        !isLoading && !isV2,
    )
    const v2Trend = useStatsMetricTrend(
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
            filters: agentFilters,
            timezone,
        }),
        aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
            filters: {
                ...agentFilters,
                period: getPreviousPeriod(agentFilters.period),
            },
            timezone,
        }),
        !isLoading && isV2,
    )

    return isV2 ? v2Trend : v1Trend
}

export const fetchAiAgentSupportAgentFRTTrend = async (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const agentFilters = applyAiAgentFilter(filters, aiAgentUserId)
    const v1Filters = applySupportAgentFilter(agentFilters)

    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_SUPPORT_AGENT_DECREASE_IN_FRT,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
                filters: agentFilters,
                timezone,
            }),
            aiAgentSupportAgentDecreaseInFRTQueryV2Factory({
                filters: {
                    ...agentFilters,
                    period: getPreviousPeriod(agentFilters.period),
                },
                timezone,
            }),
        )
    }

    return fetchDecreaseInFirstResponseTimeTrend(
        v1Filters,
        timezone,
        aiAgentUserId,
    )
}
