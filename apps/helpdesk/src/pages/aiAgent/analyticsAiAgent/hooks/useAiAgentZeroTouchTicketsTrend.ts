import { useAIAgentUserId } from 'domains/reporting/hooks/automate/useAIAgentUserId'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { zeroTouchTicketsQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { applyAiAgentFilter } from 'pages/aiAgent/analyticsAiAgent/utils/applyAiAgentFilter'

export const useAiAgentZeroTouchTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    const aiAgentUserId = useAIAgentUserId()
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return useMetricTrend(
        {
            ...zeroTouchTicketsQueryFactory(filteredFilters, timezone),
            metricName: METRIC_NAMES.AI_AGENT_ZERO_TOUCH_TICKETS,
        },
        {
            ...zeroTouchTicketsQueryFactory(
                {
                    ...filteredFilters,
                    period: getPreviousPeriod(filteredFilters.period),
                },
                timezone,
            ),
            metricName: METRIC_NAMES.AI_AGENT_ZERO_TOUCH_TICKETS,
        },
    )
}

export const fetchAiAgentZeroTouchTicketsTrend = (
    filters: StatsFilters,
    timezone: string,
    aiAgentUserId: number | undefined,
) => {
    const filteredFilters = applyAiAgentFilter(filters, aiAgentUserId)
    return fetchMetricTrend(
        {
            ...zeroTouchTicketsQueryFactory(filteredFilters, timezone),
            metricName: METRIC_NAMES.AI_AGENT_ZERO_TOUCH_TICKETS,
        },
        {
            ...zeroTouchTicketsQueryFactory(
                {
                    ...filteredFilters,
                    period: getPreviousPeriod(filteredFilters.period),
                },
                timezone,
            ),
            metricName: METRIC_NAMES.AI_AGENT_ZERO_TOUCH_TICKETS,
        },
    )
}
