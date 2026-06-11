import {
    fetchStatsMetricTrend,
    useStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageAiAgentCsatQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCsat'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentAllAgentsAverageCsatTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        averageAiAgentCsatQueryV2Factory({ filters, timezone }),
        averageAiAgentCsatQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentAllAgentsAverageCsatTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        averageAiAgentCsatQueryV2Factory({ filters, timezone }),
        averageAiAgentCsatQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
