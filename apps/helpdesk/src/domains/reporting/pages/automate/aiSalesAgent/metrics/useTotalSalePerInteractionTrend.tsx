import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    fetchGenericTrend,
    useGenericTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGenericTrend'
import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import {
    fetchTotalNumberOfSalesConversationsTrend,
    useTotalNumberOfSalesConversationsTrend,
} from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'

const calculateTotalSalePerInteraction = (
    gmvInfluenced: number,
    numberOfInteractions: number,
) => {
    return safeDivide(gmvInfluenced, numberOfInteractions)
}
const useTotalSalePerInteractionTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    useGenericTrend(
        {
            gmvInfluenced: useGmvInfluencedTrend(filters, timezone),
            totalNumberOfAgentSalesConverations:
                useTotalNumberOfSalesConversationsTrend(filters, timezone),
        },
        ({ gmvInfluenced, totalNumberOfAgentSalesConverations }) =>
            calculateTotalSalePerInteraction(
                gmvInfluenced,
                totalNumberOfAgentSalesConverations,
            ),
    )

const fetchTotalSalePerInteractionTrend = (
    filters: StatsFilters,
    timezone: string,
) =>
    fetchGenericTrend(
        {
            gmvInfluenced: fetchGmvInfluencedTrend(filters, timezone),
            totalNumberOfAgentSalesConverations:
                fetchTotalNumberOfSalesConversationsTrend(filters, timezone),
        },
        ({ gmvInfluenced, totalNumberOfAgentSalesConverations }) =>
            calculateTotalSalePerInteraction(
                gmvInfluenced,
                totalNumberOfAgentSalesConverations,
            ),
    )

export { useTotalSalePerInteractionTrend, fetchTotalSalePerInteractionTrend }
