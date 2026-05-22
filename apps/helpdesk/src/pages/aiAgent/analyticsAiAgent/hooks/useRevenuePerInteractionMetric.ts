import type { MetricTrend } from '@repo/reporting'

import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { revenuePerInteractionQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentActivity'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { useAiAgentStatsFilters } from 'pages/aiAgent/hooks/useAiAgentStatsFilters'

export const useRevenuePerInteractionMetric = (): MetricTrend => {
    const { statsFilters, userTimezone } = useAiAgentStatsFilters()

    const { isFetching, isError, data } = useStatsMetricTrend(
        revenuePerInteractionQueryV2Factory({
            filters: statsFilters,
            timezone: userTimezone,
        }),
        revenuePerInteractionQueryV2Factory({
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
            label: 'Revenue influenced per interaction',
            value: data?.value ?? null,
            prevValue: data?.prevValue ?? null,
        },
    }
}

export const fetchRevenuePerInteractionMetric = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        revenuePerInteractionQueryV2Factory({ filters, timezone }),
        revenuePerInteractionQueryV2Factory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
