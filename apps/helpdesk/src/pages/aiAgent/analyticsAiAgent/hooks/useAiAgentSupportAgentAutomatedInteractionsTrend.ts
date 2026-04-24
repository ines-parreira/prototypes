import {
    fetchAiAgentSupportInteractionsTrend,
    useAiAgentSupportInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicSupportAgentAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useAiAgentSupportAgentAutomatedInteractionsTrend = () => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const { stage, isLoading } = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1 = useAiAgentSupportInteractionsTrend(
        statsFilters,
        userTimezone,
        !isLoading && !isV2,
    )
    const v2 = useStatsMetricTrend(
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

export const fetchAiAgentSupportAgentAutomatedInteractionsTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    return isV2
        ? fetchStatsMetricTrend(
              dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                  filters,
                  timezone,
              }),
              dynamicSupportAgentAutomatedInteractionsQueryFactoryV2({
                  filters: {
                      ...filters,
                      period: getPreviousPeriod(filters.period),
                  },
                  timezone,
              }),
          )
        : fetchAiAgentSupportInteractionsTrend(filters, timezone)
}
