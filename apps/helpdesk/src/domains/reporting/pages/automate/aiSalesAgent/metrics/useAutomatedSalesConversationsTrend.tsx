import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { automatedSalesConversationsQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useAutomatedSalesConversationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        automatedSalesConversationsQueryFactory(filters, timezone),
        automatedSalesConversationsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

const fetchAutomatedSalesConversationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        automatedSalesConversationsQueryFactory(filters, timezone),
        automatedSalesConversationsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

export {
    useAutomatedSalesConversationsTrend,
    fetchAutomatedSalesConversationsTrend,
}
