import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalNumberOfOrdersTrend,
    useTotalNumberOfOrdersTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'

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
