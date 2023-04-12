import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignEventsTotalsData,
    getCampaignOrderPerformanceData,
    getCampaignOrderTotalsData,
    getCampaignsPerformanceGraphData,
    getRevenueUpliftGraphData,
    getStoreRevenueTotalData,
    getTrafficData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    CampaignChatPerformanceData,
    CampaignGraphData,
    CampaignsPerformanceDataset,
    CampaignsTotals,
    RevenueGraphDataPoint,
    TicketPerformanceData,
} from 'pages/stats/revenue/services/types'
import {
    backfillGraphData,
    getDataFromResultSet,
    getDataFromStatResult,
    transformToCampaignCalculatedTotals,
    transformToCampaignConversionRateOverTime,
    transformToCampaignCTROverTime,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToCampaignsPerformanceTable,
    transformToChatConversionRateOverTime,
    transformToRevenueUpliftOverTime,
    transformToStoreTotal,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {
    getCampaignTicketsPerformanceData,
    getTicketsPerformanceData,
} from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {
    CubeFilterParams,
    CubeMetric,
    FilterParams,
    TimeGranularity,
} from 'pages/stats/revenue/clients/types'
import {TicketChannel} from 'business/types/ticket'

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

    const [eventsTotals, orderTotals, storeTotal] = await Promise.all([
        getCampaignEventsTotalsData(attrs),
        getCampaignOrderTotalsData(attrs),
        getStoreRevenueTotalData(attrs),
    ])

    const eventsTotalsData = getDataFromResultSet(eventsTotals)
    const orderTotalsData = getDataFromResultSet(orderTotals)
    const storeTotalData = getDataFromResultSet(storeTotal)

    return {
        ...transformToCampaignEventsTotals(eventsTotalsData),
        ...transformToCampaignOrdersTotals(orderTotalsData, currency),
        ...transformToStoreTotal(storeTotalData, currency),
        ...transformToCampaignCalculatedTotals(orderTotalsData, storeTotalData),
    }
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

export const getCampaignsAndChatPerformanceOverTime = async (
    startDate: string,
    endDate: string,
    namespacedShopName: string,
    campaignIds: string[],
    integrationId: number | null,
    timeGranularity: TimeGranularity = 'day'
): Promise<CampaignChatPerformanceData | null> => {
    if (!integrationId) return null

    const attrs = {
        shopName: namespacedShopName,
        campaignIds,
        startDate,
        endDate,
        granularity: timeGranularity,
        integrationIds: [integrationId],
        channels: [TicketChannel.Chat],
    }

    const [campaignsPerformance, chatPerformance] = await Promise.all([
        getCampaignsPerformanceGraphData(attrs),
        getTicketsPerformanceData(attrs),
    ])

    const campaignsPerformanceData = getDataFromResultSet(campaignsPerformance)
    const chatPerformanceData = getDataFromStatResult(chatPerformance)

    // transform individual metrics to the same data format
    const campaignsCTR = campaignsPerformanceData.map((dataPoint: CubeMetric) =>
        transformToCampaignCTROverTime(dataPoint, timeGranularity)
    )
    const campaignConversionRate = campaignsPerformanceData.map(
        (dataPoint: CubeMetric) =>
            transformToCampaignConversionRateOverTime(
                dataPoint,
                timeGranularity
            )
    )
    const chatConversionRate = transformToChatConversionRateOverTime(
        chatPerformanceData as CampaignGraphData
    )

    // make sure there are no gaps in the data to cause lines misalignment
    const [bfCampaignCTR, bfCampaignConversionRate, bfChatConversionRate] =
        backfillGraphData(
            [campaignsCTR, campaignConversionRate, chatConversionRate],
            startDate,
            endDate
        )

    return {
        campaignCTR: bfCampaignCTR,
        campaignConversionRate: bfCampaignConversionRate,
        chatConversionRate: bfChatConversionRate,
    }
}

export const getCampaignsPerformance = async (
    startDate: string,
    endDate: string,
    campaignIds: string[],
    shopName: string,
    limit = 100,
    offset = 0
): Promise<CampaignsPerformanceDataset> => {
    if (campaignIds?.length === 0) return {}

    const attrs: FilterParams = {
        startDate,
        endDate,
        campaignIds,
        shopName,
        limit,
        offset,
    }

    const [
        eventsPerformance,
        ordersPerformance,
        campaignsOrdersPerformance,
        ticketsPerformance,
        traffic,
    ] = await Promise.all([
        getCampaignEventsPerformanceData(attrs),
        getCampaignOrderPerformanceData(attrs),
        getCampaignEventsOrdersPerformanceData(attrs),
        getCampaignTicketsPerformanceData(attrs),
        getTrafficData(attrs),
    ])

    const eventsPerformanceData = getDataFromResultSet(eventsPerformance)
    const ordersPerformanceData = getDataFromResultSet(ordersPerformance)
    const campaignsOrdersPerformanceData = getDataFromResultSet(
        campaignsOrdersPerformance
    )
    const trafficData = getDataFromResultSet(traffic)
    const ticketsPerformanceData = getDataFromStatResult(ticketsPerformance)

    return transformToCampaignsPerformanceTable(
        eventsPerformanceData,
        ordersPerformanceData,
        campaignsOrdersPerformanceData,
        trafficData,
        ticketsPerformanceData as TicketPerformanceData
    )
}
