import {
    getCampaignEventsOrdersPerformanceData,
    getCampaignEventsPerformanceData,
    getCampaignEventsTotalsData,
    getCampaignOrderPerformanceData,
    getCampaignOrderTotalsData,
    getGMVUpliftGraphData,
} from 'pages/stats/revenue/clients/CampaignCubeQueries'
import {
    CampaignsPerformanceDataset,
    CampaignsTotals,
    GMVGraphDataPoint,
} from 'pages/stats/revenue/services/types'
import {
    getDataFromResultSet,
    getDataFromStatResult,
    transformToCampaignEventsTotals,
    transformToCampaignOrdersTotals,
    transformToCampaignsPerformanceTable,
    transformToGMVUpliftOverTime,
} from 'pages/stats/revenue/services/CampaignMetricsHelper'
import {getCampaignTicketsPerformanceData} from 'pages/stats/revenue/clients/RevenueAttributionClient'
import {
    CubeFilterParams,
    CubeMetric,
    FilterParams,
    TimeGranularity,
} from 'pages/stats/revenue/clients/types'

export const getTotals = async (
    integrationId: number,
    startDate: string,
    endDate: string
): Promise<CampaignsTotals> => {
    const attrs: CubeFilterParams = {
        integrationId,
        startDate,
        endDate,
    }

    const [eventsTotals, orderTotals] = await Promise.all([
        getCampaignEventsTotalsData(attrs),
        getCampaignOrderTotalsData(attrs),
    ])

    const eventsTotalsData = getDataFromResultSet(eventsTotals)
    const orderTotalsData = getDataFromResultSet(orderTotals)

    return {
        ...transformToCampaignEventsTotals(eventsTotalsData),
        ...transformToCampaignOrdersTotals(orderTotalsData),
    } as CampaignsTotals
}

export const getGMVUplift = async (
    startDate: string,
    endDate: string,
    campaignIds: string[],
    timeGranularity: TimeGranularity = 'day'
): Promise<GMVGraphDataPoint[]> => {
    if (campaignIds?.length === 0) return []

    const attrs = {
        campaignIds,
        startDate,
        endDate,
        timeGranularity,
    }

    const gmvGraph = await getGMVUpliftGraphData(attrs)
    const gmvGraphData = getDataFromResultSet(gmvGraph)

    return gmvGraphData.map((dataPoint: CubeMetric) =>
        transformToGMVUpliftOverTime(dataPoint, timeGranularity)
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
