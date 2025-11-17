import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchGmvInfluencedTrendInUSD,
    useGmvInfluencedTrendInUSD,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { infinityNanToZero } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'

const calculateRoiRate = ({
    gmvInfluenced,
    totalConversations,
    totalAutomatedSales,
}: {
    gmvInfluenced?: number | null
    totalConversations?: number | null
    totalAutomatedSales?: number | null
}): number => {
    const gmv = gmvInfluenced ?? 0
    const conversations = totalConversations ?? 0
    const automatedSales = totalAutomatedSales ?? 0

    const denominator = conversations * 0.2 + automatedSales
    if (denominator === 0) {
        return 0
    }

    return infinityNanToZero(gmv / denominator)
}

const useRoiRateTrend = (filters: StatsFilters, timezone: string) => {
    return useGenericTrend(
        {
            gmvInfluenced: useGmvInfluencedTrendInUSD(filters, timezone),
            totalConversations: useTotalNumberOfSalesConversationsTrend(
                filters,
                timezone,
            ),
            totalAutomatedSales: useTotalNumberOfAutomatedSalesTrend(
                filters,
                timezone,
            ),
        },
        calculateRoiRate,
    )
}

const fetchRoiRateTrend = (filters: StatsFilters, timezone: string) => {
    return fetchGenericTrend(
        {
            gmvInfluenced: fetchGmvInfluencedTrendInUSD(filters, timezone),
            totalConversations: fetchTotalNumberOfSalesConversationsTrend(
                filters,
                timezone,
            ),
            totalAutomatedSales: fetchTotalNumberOfAutomatedSalesTrend(
                filters,
                timezone,
            ),
        },
        calculateRoiRate,
    )
}

export { useRoiRateTrend, fetchRoiRateTrend }
