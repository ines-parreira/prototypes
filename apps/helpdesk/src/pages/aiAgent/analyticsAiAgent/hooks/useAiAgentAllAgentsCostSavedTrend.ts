import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useAiAgentAllAgentsCostSavedTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const { stage, isLoading } = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useFilteredAutomatedInteractions(
        filteredFilters,
        timezone,
        !isLoading && !isV2,
    )
    const v2Trend = useStatsMetricTrend(
        dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
            filters: filteredFilters,
            timezone,
        }),
        dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...filteredFilters,
                period: getPreviousPeriod(filteredFilters.period),
            },
            timezone,
        }),
        !isLoading && isV2,
    )

    const trend = isV2 ? v2Trend : v1Trend

    return {
        ...trend,
        data: formatCostSavedData(trend, costSavedPerInteraction),
    }
}

export const fetchAiAgentAllAgentsCostSavedTrend: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    const filteredFilters = applyAiAgentFilter(statsFilters, aiAgentUserId)

    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const automatedInteractionTrend = isV2
        ? await fetchStatsMetricTrend(
              dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                  filters: filteredFilters,
                  timezone: userTimezone,
              }),
              dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                  filters: {
                      ...filteredFilters,
                      period: getPreviousPeriod(filteredFilters.period),
                  },
                  timezone: userTimezone,
              }),
          )
        : await fetchFilteredAutomatedInteractions(
              filteredFilters,
              userTimezone,
          )

    return {
        data: formatCostSavedData(
            automatedInteractionTrend,
            costSavedPerInteraction,
        ),
        isFetching: false,
        isError: false,
    }
}
