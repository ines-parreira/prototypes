import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalNumberOfSalesConversationsQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentConversations'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

const useTotalNumberOfSalesConversationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        totalNumberOfSalesConversationsQueryFactory(filters, timezone),
        totalNumberOfSalesConversationsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

const fetchTotalNumberOfSalesConversationsTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberOfSalesConversationsQueryFactory(filters, timezone),
        totalNumberOfSalesConversationsQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
        AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2({
            filters,
            timezone,
        }),
        AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

export {
    useTotalNumberOfSalesConversationsTrend,
    fetchTotalNumberOfSalesConversationsTrend,
}
