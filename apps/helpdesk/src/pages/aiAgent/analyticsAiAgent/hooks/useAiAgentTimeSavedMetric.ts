import type { MetricTrend } from '@repo/reporting'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { dynamicAllAgentsTimeSavedQueryFactoryV2 } from 'domains/reporting/models/scopes/aiAgentTimeSaved'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useAiAgentAllAgentsTimeSavedMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const { isFetching, isError, data } = useStatsMetricTrend(
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

export const fetchAiAgentAllAgentsTimeSavedTrend = (
    statsFilters: StatsFilters,
    userTimezone: string,
) =>
    fetchStatsMetricTrend(
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
