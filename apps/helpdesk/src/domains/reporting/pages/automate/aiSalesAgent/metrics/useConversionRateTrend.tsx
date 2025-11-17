import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchTotalNumberOfOrdersTrend,
    useTotalNumberOfOrdersTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'

const useConversionRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            totalNumberOfOrders: useTotalNumberOfOrdersTrend(filters, timezone),
            totalSalesOpportunityAIConv:
                useTotalNumberOfSalesConversationsTrend(filters, timezone),
        },
        ({ totalNumberOfOrders, totalSalesOpportunityAIConv }) =>
            safeDivide(totalNumberOfOrders, totalSalesOpportunityAIConv),
    )

const fetchConversionRateTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            totalNumberOfOrders: fetchTotalNumberOfOrdersTrend(
                filters,
                timezone,
            ),
            totalSalesOpportunityAIConv:
                fetchTotalNumberOfSalesConversationsTrend(filters, timezone),
        },
        ({ totalNumberOfOrders, totalSalesOpportunityAIConv }) =>
            safeDivide(totalNumberOfOrders, totalSalesOpportunityAIConv),
    )
export { useConversionRateTrend, fetchConversionRateTrend }
