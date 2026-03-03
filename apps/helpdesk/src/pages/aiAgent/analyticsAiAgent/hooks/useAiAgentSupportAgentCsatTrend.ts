import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { averageScoreQueryFactory } from 'domains/reporting/models/queryFactories/satisfaction/averageScoreQueryFactory'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

export const useAiAgentSupportAgentCsatTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return useMetricTrend(
        {
            ...averageScoreQueryFactory(filteredFilters, timezone),
            metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
        },
        {
            ...averageScoreQueryFactory(
                {
                    ...filteredFilters,
                    period: getPreviousPeriod(filteredFilters.period),
                },
                timezone,
            ),
            metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
        },
    )
}

export const fetchAiAgentSupportAgentCsatTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return fetchMetricTrend(
        {
            ...averageScoreQueryFactory(filteredFilters, timezone),
            metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
        },
        {
            ...averageScoreQueryFactory(
                {
                    ...filteredFilters,
                    period: getPreviousPeriod(filteredFilters.period),
                },
                timezone,
            ),
            metricName: METRIC_NAMES.AI_AGENT_CSAT_AVERAGE_SCORE,
        },
    )
}
