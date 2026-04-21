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
    dynamicSupportAgentTimeSaved,
    dynamicSupportAgentTimeSavedQueryFactoryV2,
} from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getNewStatsFeatureFlagMigration } from 'domains/reporting/utils/getNewStatsFeatureFlagMigration'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useGetNewStatsFeatureFlagMigration } from 'domains/reporting/utils/useGetNewStatsFeatureFlagMigration'

export const useAiAgentSupportAgentTimeSavedMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAutomateFilters()

    const stage = useGetNewStatsFeatureFlagMigration(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SUPPORT_AGENT_TIME_SAVED,
    )
    const isV2 = stage === 'live' || stage === 'complete'

    const v1Trend = useAiAgentTimeSavedByAgentsTrend(
        statsFilters,
        userTimezone,
        !isV2,
    )

    const v2Trend = useStatsMetricTrend(
        dynamicSupportAgentTimeSavedQueryFactoryV2({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        dynamicSupportAgentTimeSavedQueryFactoryV2({
            filters: {
                ...statsFilters,
                period: getPreviousPeriod(statsFilters.period),
            },
            timezone: userTimezone,
        }),
        isV2,
    )

    const { isFetching, isError, data } = isV2 ? v2Trend : v1Trend

    return {
        isFetching,
        isError,
        data: {
            label: 'Time saved by agents',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}

export const fetchAiAgentSupportAgentTimeSavedTrend = async (
    statsFilters: StatsFilters,
    userTimezone: string,
) => {
    const stage = await getNewStatsFeatureFlagMigration(
        dynamicSupportAgentTimeSaved.name,
    )
    if (stage === 'live' || stage === 'complete') {
        return fetchStatsMetricTrend(
            dynamicSupportAgentTimeSavedQueryFactoryV2({
                filters: statsFilters,
                timezone: userTimezone,
            }),
            dynamicSupportAgentTimeSavedQueryFactoryV2({
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
