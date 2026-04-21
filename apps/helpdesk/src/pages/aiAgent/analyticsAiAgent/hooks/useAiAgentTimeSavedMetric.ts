import type { MetricTrend } from '@repo/reporting'

import {
    fetchAiAgentTimeSavedByAgentsTrend,
    useAiAgentTimeSavedByAgentsTrend,
} from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { useAutomateFilters } from 'domains/reporting/hooks/automate/useAutomateFilters'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import {
    dynamicAllAgentsTimeSaved,
    dynamicAllAgentsTimeSavedQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useAiAgentAllAgentsTimeSavedMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const { stage, isLoading: isFlagLoading } =
        useGetNewStatsFeatureFlagMigration(
            METRIC_NAMES.AI_AGENT_DYNAMIC_ALL_AGENTS_TIME_SAVED_BY_AGENT,
        )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useAiAgentTimeSavedByAgentsTrend(
        statsFilters,
        userTimezone,
        !isFlagLoading && !isV2,
    )

    const v2Trend = useStatsMetricTrend(
        dynamicAllAgentsTimeSavedQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicAllAgentsTimeSavedQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
        !isFlagLoading && isV2,
    )

    const { isFetching, isError, data } = isV2 ? v2Trend : v1Trend

    return {
        isFetching: isFetching || isFlagLoading,
        isError,
        data: {
            label: 'Time saved by agents',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}

export const fetchAiAgentAllAgentsTimeSavedTrend = async (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        dynamicAllAgentsTimeSaved.name,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            dynamicAllAgentsTimeSavedQueryFactoryV2({
                filters: statsFilters,
                timezone: userTimezone,
            }),
            dynamicAllAgentsTimeSavedQueryFactoryV2({
                filters: {
                    ...statsFilters,
                    period: getPreviousPeriod(statsFilters.period),
                },
                timezone: userTimezone,
            }),
        )
    }
    return fetchAiAgentTimeSavedByAgentsTrend(statsFilters, userTimezone)
}
