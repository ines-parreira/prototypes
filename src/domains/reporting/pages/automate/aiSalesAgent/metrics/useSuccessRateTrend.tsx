import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'

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
