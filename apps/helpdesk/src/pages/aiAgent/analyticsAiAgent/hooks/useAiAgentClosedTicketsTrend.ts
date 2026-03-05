import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { closedTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

export const useAiAgentClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return useMetricTrend(
        {
            ...closedTicketsQueryFactory(filteredFilters, timezone),
            metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
        },
        {
            ...closedTicketsQueryFactory(
                {
                    ...filteredFilters,
                    period: getPreviousPeriod(filteredFilters.period),
                },
                timezone,
            ),
            metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
        },
    )
}

export const fetchAiAgentClosedTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return fetchMetricTrend(
        {
            ...closedTicketsQueryFactory(filteredFilters, timezone),
            metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
        },
        {
            ...closedTicketsQueryFactory(
                {
                    ...filteredFilters,
                    period: getPreviousPeriod(filteredFilters.period),
                },
                timezone,
            ),
            metricName: METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS,
        },
    )
}
