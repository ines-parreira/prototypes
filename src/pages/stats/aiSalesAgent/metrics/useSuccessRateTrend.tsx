import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'
import {
    fetchTotalNumberOfAgentConverationsTrend,
    useTotalNumberOfAgentConverationsTrend,
} from './useTotalNumberOfAgentConverationsTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from './useTotalNumberOfAutomatedSalesTrend'

const useSuccessRateTrend = (filters: StatsFilters, timezone: string) =>
    useGenericTrend(
        {
            totalNumberOfAgentConverations:
                useTotalNumberOfAgentConverationsTrend(filters, timezone),
            totalNumberOfAutomatedSales: useTotalNumberOfAutomatedSalesTrend(
                filters,
                timezone,
            ),
        },
        ({ totalNumberOfAgentConverations, totalNumberOfAutomatedSales }) =>
            safeDivide(
                totalNumberOfAutomatedSales,
                totalNumberOfAgentConverations,
            ),
    )

const fetchSuccessRateTrend = (filters: StatsFilters, timezone: string) =>
    fetchGenericTrend(
        {
            totalNumberOfAgentConverations:
                fetchTotalNumberOfAgentConverationsTrend(filters, timezone),
            totalNumberOfAutomatedSales: fetchTotalNumberOfAutomatedSalesTrend(
                filters,
                timezone,
            ),
        },
        ({ totalNumberOfAgentConverations, totalNumberOfAutomatedSales }) =>
            safeDivide(
                totalNumberOfAutomatedSales,
                totalNumberOfAgentConverations,
            ),
    )

export { useSuccessRateTrend, fetchSuccessRateTrend }
