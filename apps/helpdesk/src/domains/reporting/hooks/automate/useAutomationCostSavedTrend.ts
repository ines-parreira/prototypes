import {
    fetchFilteredAutomatedInteractions,
    useFilteredAutomatedInteractions,
} from 'domains/reporting/hooks/automate/automationTrends'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type {
    MetricTrend,
    MetricTrendFetch,
} from 'domains/reporting/hooks/useMetricTrend'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicOverallAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/overallAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { AGENT_COST_PER_TICKET } from 'pages/automate/automate-metrics/constants'
import { useMoneySavedPerInteractionWithAutomate } from 'pages/automate/common/hooks/useMoneySavedPerInteractionWithAutomate'

export const formatCostSavedData = (
    automatedInteractionTrend: MetricTrend,
    costSavedPerInteraction: number,
) => {
    return {
        value:
            (automatedInteractionTrend.data?.value ?? 0) *
            costSavedPerInteraction,
        prevValue:
            (automatedInteractionTrend.data?.prevValue ?? 0) *
            costSavedPerInteraction,
    }
}

export const useAutomationCostSavedTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const costSavedPerInteraction = useMoneySavedPerInteractionWithAutomate(
        AGENT_COST_PER_TICKET,
    )

    const { stage, isLoading } = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useFilteredAutomatedInteractions(
        statsFilters,
        userTimezone,
        !isLoading && !isV2,
    )
    const v2Trend = useStatsMetricTrend(
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicOverallAutomatedInteractionsQueryFactoryV2({
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

export const fetchAutomationCostSavedTrend: MetricTrendFetch = async (
    statsFilters: StatsFilters,
    userTimezone: string,
    _aiAgentUserId: number | undefined,
    costSavedPerInteraction: number,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_OVERALL_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const automatedInteractionTrend = isV2
        ? await fetchStatsMetricTrend(
              dynamicOverallAutomatedInteractionsQueryFactoryV2({
                  filters: statsFilters,
                  timezone: userTimezone,
              }),
              dynamicOverallAutomatedInteractionsQueryFactoryV2({
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
