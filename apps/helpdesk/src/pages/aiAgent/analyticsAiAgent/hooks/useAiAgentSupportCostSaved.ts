import type { MetricTrend } from '@repo/reporting'

import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { formatCostSavedData } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { MetricTrendFetch } from 'domains/reporting/hooks/useMetricTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const useAiAgentSupportCostSaved = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const { stage, isLoading } = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
        !isLoading && !isV2,
    )
    const v2Trend = useStatsMetricTrend(
        dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
        !isLoading && isV2,
    )
    const trend = isV2 ? v2Trend : v1Trend

    return {
        ...trend,
        data: formatCostSavedData(trend, costSavedPerInteraction),
    }
}

export const fetchAiAgentSupportCostSaved: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const automatedInteractionTrend = isV2
        ? await fetchStatsMetricTrend(
              dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                  filters: statsFilters,
                  timezone: userTimezone,
              }),
              dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                  filters: {
                      ...statsFilters,
                      period: getPreviousPeriod(statsFilters.period),
                  },
                  timezone: userTimezone,
              }),
          )
        : await fetchFilteredAutomatedInteractions(statsFilters, userTimezone)

    return {
        data: formatCostSavedData(
            automatedInteractionTrend,
            costSavedPerInteraction,
        ),
        isFetching: false,
        isError: false,
    }
}
