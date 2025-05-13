import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/automate/aiSalesAgent/util/safeDivide'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from './useTotalNumberOfAutomatedSalesTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from './useTotalNumberOfSalesConversationsTrend'

const useSuccessRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            totalNumberOfSalesConversations:
                useTotalNumberOfSalesConversationsTrend(filters, timezone),
            totalNumberOfAutomatedSales: useTotalNumberOfAutomatedSalesTrend(
                filters,
                timezone,
            ),
        },
        ({ totalNumberOfSalesConversations, totalNumberOfAutomatedSales }) =>
            safeDivide(
                totalNumberOfAutomatedSales,
                totalNumberOfSalesConversations,
            ),
    )

const fetchSuccessRateTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            totalNumberOfSalesConversations:
                fetchTotalNumberOfSalesConversationsTrend(filters, timezone),
            totalNumberOfAutomatedSales: fetchTotalNumberOfAutomatedSalesTrend(
                filters,
                timezone,
            ),
        },
        ({ totalNumberOfSalesConversations, totalNumberOfAutomatedSales }) =>
            safeDivide(
                totalNumberOfAutomatedSales,
                totalNumberOfSalesConversations,
            ),
    )

export { useSuccessRateTrend, fetchSuccessRateTrend }
