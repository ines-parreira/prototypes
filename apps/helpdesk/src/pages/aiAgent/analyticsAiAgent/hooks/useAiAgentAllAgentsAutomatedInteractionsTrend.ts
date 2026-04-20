import {
    fetchAIAgentAutomatedInteractionsTrend,
    useAIAgentAutomatedInteractionsTrend,
} from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsAutomatedInteractionsQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentAutomatedInteractions'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useAiAgentAllAgentsAutomatedInteractionsTrend = () => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const stage = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1 = useAIAgentAutomatedInteractionsTrend(
        statsFilters,
        userTimezone,
        !isV2,
    )
    const v2 = useStatsMetricTrend(
        dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
        isV2,
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

export const fetchAiAgentAllAgentsAutomatedInteractionsTrend = async (
    filters: StatsFilters,
    timezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_AUTOMATED_INTERACTIONS,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    return isV2
        ? fetchStatsMetricTrend(
              dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                  filters,
                  timezone,
              }),
              dynamicAllAgentsAutomatedInteractionsQueryFactoryV2({
                  filters: {
                      ...filters,
                      period: getPreviousPeriod(filters.period),
                  },
                  timezone,
              }),
          )
        : fetchAIAgentAutomatedInteractionsTrend(filters, timezone)
}
