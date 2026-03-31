import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiSupportAgentSuccessRateTrendQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentSupportAgentSuccessRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        aiSupportAgentSuccessRateTrendQueryFactory({ filters, timezone }),
        aiSupportAgentSuccessRateTrendQueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchAiAgentSupportAgentSuccessRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        aiSupportAgentSuccessRateTrendQueryFactory({ filters, timezone }),
        aiSupportAgentSuccessRateTrendQueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
