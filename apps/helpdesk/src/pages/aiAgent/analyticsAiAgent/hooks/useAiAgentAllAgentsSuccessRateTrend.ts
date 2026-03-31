import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { aiAgentAllAgentsSuccessRateTrendQueryFactory } from 'domains/reporting/models/scopes/aiAgentSuccessRate'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAllAgentsSuccessRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        aiAgentAllAgentsSuccessRateTrendQueryFactory({ filters, timezone }),
        aiAgentAllAgentsSuccessRateTrendQueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export const fetchAiAgentAllAgentsSuccessRateTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        aiAgentAllAgentsSuccessRateTrendQueryFactory({ filters, timezone }),
        aiAgentAllAgentsSuccessRateTrendQueryFactory({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
