import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignEventsTotalsData,
    getCampaignOrderPerformanceData,
    getCampaignOrderTotalsData,
    getRevenueUpliftGraphData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    CampaignsPerformanceDataset,
    CampaignsTotals,
    RevenueGraphDataPoint,
} from 'pages/stats/revenue/services/types'
import {
    getDataFromResultSet,
    getDataFromStatResult,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToCampaignsPerformanceTable,
    transformToRevenueUpliftOverTime,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {getCampaignTicketsPerformanceData} from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {
    CubeFilterParams,
    CubeMetric,
    FilterParams,
    TimeGranularity,
} from 'pages/stats/revenue/clients/types'

export const getTotals = async (
    namespacedShopName: string,
    campaignIds: string[],
    currency: string,
    startDate: string,
    endDate: string
): Promise<CampaignsTotals> => {
    const attrs: CubeFilterParams = {
        shopName: namespacedShopName,
        campaignIds,
        startDate,
        endDate,
    }

    const [eventsTotals, orderTotals] = await Promise.all([
        getCampaignEventsTotalsData(attrs),
        getCampaignOrderTotalsData(attrs),
    ])

    const eventsTotalsData = getDataFromResultSet(eventsTotals)
    const orderTotalsData = getDataFromResultSet(orderTotals)

    return [
        ...transformToCampaignEventsTotals(eventsTotalsData),
        ...transformToCampaignOrdersTotals(orderTotalsData, currency),
    ]
}

export const getRevenueUpliftOverTime = async (
    startDate: string,
    endDate: string,
    namespacedShopName: string,
    campaignIds: string[],
    timeGranularity: TimeGranularity = 'day'
): Promise<RevenueGraphDataPoint[]> => {
    const attrs = {
        shopName: namespacedShopName,
        campaignIds,
        startDate,
        endDate,
        granularity: timeGranularity,
    }

    const revenueGraph = await getRevenueUpliftGraphData(attrs)
    const revenueGraphData = getDataFromResultSet(revenueGraph)

    return revenueGraphData.map((dataPoint: CubeMetric) =>
        transformToRevenueUpliftOverTime(dataPoint, timeGranularity)
    )
}

export const getCampaignsPerformance = async (
    startDate: string,
    endDate: string,
    campaignIds: string[],
    limit = 100,
    offset = 0
): Promise<CampaignsPerformanceDataset> => {
    if (campaignIds?.length === 0) return {}

    const attrs: FilterParams = {
        startDate,
        endDate,
        campaignIds,
        limit,
        offset,
    }

    const [
        eventsPerformance,
        ordersPerformance,
        campaignsOrdersPerformance,
        ticketsPerformance,
    ] = await Promise.all([
        getCampaignEventsPerformanceData(attrs),
        getCampaignOrderPerformanceData(attrs),
        getCampaignEventsOrdersPerformanceData(attrs),
        getCampaignTicketsPerformanceData(attrs),
    ])

    const eventsPerformanceData = getDataFromResultSet(eventsPerformance)
    const ordersPerformanceData = getDataFromResultSet(ordersPerformance)
    const campaignsOrdersPerformanceData = getDataFromResultSet(
        campaignsOrdersPerformance
    )
    const ticketsPerformanceData = getDataFromStatResult(ticketsPerformance)

    return transformToCampaignsPerformanceTable(
        eventsPerformanceData,
        ordersPerformanceData,
        campaignsOrdersPerformanceData,
        ticketsPerformanceData
    )
}
