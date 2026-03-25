import useMetricTrend, {
    fetchMetricTrend,
} from 'domains/reporting/hooks/useMetricTrend'
import { totalNumberOfOrderQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { ordersInfluencedCountQueryV2Factory } from 'domains/reporting/models/scopes/aiSalesAgentOrdersPerformance'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

export const useAiAgentOrdersInfluencedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useMetricTrend(
        totalNumberOfOrderQueryFactory(filters, timezone),
        totalNumberOfOrderQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        ordersInfluencedCountQueryV2Factory({ filters, timezone }),
        ordersInfluencedCountQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )

export const fetchAiAgentOrdersInfluencedTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchMetricTrend(
        totalNumberOfOrderQueryFactory(filters, timezone),
        totalNumberOfOrderQueryFactory(
            { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        ),
        ordersInfluencedCountQueryV2Factory({ filters, timezone }),
        ordersInfluencedCountQueryV2Factory({
            filters: { ...filters, period: getPreviousPeriod(filters.period) },
            timezone,
        }),
    )
