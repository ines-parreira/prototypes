import { StatsFilters } from 'models/stat/types'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'pages/stats/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfAutomatedSalesTrend,
    useTotalNumberOfAutomatedSalesTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfAutomatedSalesTrend'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
import { infinityNanToZero } from 'pages/stats/aiSalesAgent/metrics/utils'

import { fetchGenericTrend, useGenericTrend } from './useGenericTrend'

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
            gmvInfluenced: useGmvInfluencedTrend(filters, timezone),
            totalConversations: useTotalSalesOpportunityAIConvTrend(
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
            gmvInfluenced: fetchGmvInfluencedTrend(filters, timezone),
            totalConversations: fetchTotalSalesOpportunityAIConvTrend(
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
