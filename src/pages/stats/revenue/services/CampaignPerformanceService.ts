import {
    getCampaignsPerformanceGraphData,
    getRevenueUpliftGraphData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    CampaignChatPerformanceData,
    CampaignGraphData,
    RevenueGraphDataPoint,
} from 'pages/stats/revenue/services/types'
import {
    backfillGraphData,
    getDataFromResultSet,
    getDataFromStatResult,
    transformToCampaignConversionRateOverTime,
    transformToCampaignCTROverTime,
    transformToChatConversionRateOverTime,
    transformToRevenueUpliftOverTime,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {getTicketsPerformanceData} from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {CubeMetric, TimeGranularity} from 'pages/stats/revenue/clients/types'
import {TicketChannel} from 'business/types/ticket'

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
