import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalNumberOfOrdersTrend,
    useTotalNumberOfOrdersTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/automate/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'

const useConversionRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            totalNumberOfOrders: useTotalNumberOfOrdersTrend(filters, timezone),
            totalSalesOpportunityAIConv: useTotalSalesOpportunityAIConvTrend(
                filters,
                timezone,
            ),
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
            totalSalesOpportunityAIConv: fetchTotalSalesOpportunityAIConvTrend(
                filters,
                timezone,
            ),
        },
        ({ totalNumberOfOrders, totalSalesOpportunityAIConv }) =>
            safeDivide(totalNumberOfOrders, totalSalesOpportunityAIConv),
    )
export { useConversionRateTrend, fetchConversionRateTrend }
