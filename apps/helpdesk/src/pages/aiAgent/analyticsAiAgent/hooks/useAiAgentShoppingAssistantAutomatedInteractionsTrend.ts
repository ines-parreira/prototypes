import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchAutomatedSalesConversationsTrend,
    useAutomatedSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useAutomatedSalesConversationsTrend'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useAiAgentShoppingAssistantAutomatedInteractionsTrend = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { stage, isLoading } = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1 = useAutomatedSalesConversationsTrend(
        statsFilters,
        userTimezone,
        !isLoading && !isV2,
    )
    const v2 = useStatsMetricTrend(
        dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
        !isLoading && isV2,
    )

    const { isFetching, isError, data } = isV2 ? v2 : v1

    return {
        isFetching,
        isError,
        data: {
            label: 'Automated interactions',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}

export const fetchAiAgentShoppingAssistantAutomatedInteractionsTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    return isV2
        ? fetchStatsMetricTrend(
              dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2({
                  filters,
                  timezone,
              }),
              dynamicShoppingAssistantAutomatedInteractionsQueryFactoryV2({
                  filters: {
                      ...filters,
                      period: getPreviousPeriod(filters.period),
                  },
                  timezone,
              }),
          )
        : fetchAutomatedSalesConversationsTrend(filters, timezone)
}
