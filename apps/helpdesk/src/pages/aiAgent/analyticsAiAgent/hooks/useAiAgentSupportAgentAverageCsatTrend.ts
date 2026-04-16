import useStatsMetricTrend, {
    fetchStatsMetricTrend,
} from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageAiAgentCsatSupportAgentQueryV2Factory } from 'domains/reporting/models/scopes/aiAgentCsat'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentSupportAgentAverageCsatTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useStatsMetricTrend(
        averageAiAgentCsatSupportAgentQueryV2Factory({ filters, timezone }),
        averageAiAgentCsatSupportAgentQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentSupportAgentAverageCsatTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchStatsMetricTrend(
        averageAiAgentCsatSupportAgentQueryV2Factory({ filters, timezone }),
        averageAiAgentCsatSupportAgentQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
