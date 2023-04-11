import client from 'pages/stats/revenue/clients/CubeProxyClient'
import {
    CubeFilter,
    CubeFilterParams,
    CubeResponse,
    DefaultFilterParams,
} from 'pages/stats/revenue/clients/types'
import {
    CampaignOrderEventsDimensions,
    CampaignOrderEventsMeasures,
    Cubes,
    EventsDimensions,
    EventsMeasures,
    EventsSegments,
    FilterOperators,
    OrderConversionDimensions,
    OrderConversionMeasures,
    SharedDimensionNames,
} from 'pages/stats/revenue/clients/constants'

const _getDefaultFilters = ({
    startDate,
    endDate,
    cubeName,
    campaignIds,
    shopName,
}: DefaultFilterParams): CubeFilter[] => {
    const filters = [_inDateRangeFilter(startDate, endDate, cubeName)]

    if (campaignIds?.length) {
        filters.push(_campaignEqualsFilter(campaignIds, cubeName))
    }

    if (shopName) {
        filters.push(_shopNameEqualsFilter(shopName, cubeName))
    }

    return filters
}

const _inDateRangeFilter = (
    startDate: string,
    endDate: string,
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimensionNames.createdDatetime}`,
        operator: FilterOperators.inDateRange,
        values: [startDate, endDate],
    }
}

const _shopNameEqualsFilter = (
    shopName: string,
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimensionNames.shopName}`,
        operator: FilterOperators.equals,
        values: [shopName],
    }
}

const _campaignEqualsFilter = (
    campaignIds: string[],
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimensionNames.campaignId}`,
        operator: FilterOperators.equals,
        values: campaignIds,
    }
}

export const getCampaignEventsPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
    limit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    offset,
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [EventsDimensions.campaignId],
        measures: [
            EventsMeasures.impressions,
            EventsMeasures.uniqueImpressions,
            EventsMeasures.firstCampaignDisplay,
            EventsMeasures.lastCampaignDisplay,
            EventsMeasures.clicks,
            EventsMeasures.clicksRate,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.events,
            campaignIds,
        }),
        segments: [EventsSegments.campaignEventsOnly],
        limit: limit,
        // TODO: we need to add support for offset to reporting endpoint first
        // offset: offset,
    })
}

export const getTrafficData = async ({
    shopName,
    startDate,
    endDate,
    granularity = 'day',
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [],
        timeDimensions: [
            {
                dimension: EventsDimensions.createdDatetime,
                dateRange: [startDate, endDate],
                granularity: granularity,
            },
        ],
        measures: [EventsMeasures.traffic],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.events,
            shopName,
        }),
    })
}

export const getCampaignOrderPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
    limit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    offset,
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [OrderConversionDimensions.campaignId],
        measures: [
            OrderConversionMeasures.campaignSales,
            OrderConversionMeasures.ticketSales,
            OrderConversionMeasures.ticketSalesCount,
            OrderConversionMeasures.discountSales,
            OrderConversionMeasures.discountSalesCount,
            OrderConversionMeasures.clickSales,
            OrderConversionMeasures.clickSalesCount,
            OrderConversionMeasures.campaignSalesCount,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.orderConversion,
            campaignIds,
        }),
        limit: limit,
        // TODO: we need to add support for offset to reporting endpoint first
        // offset: offset,
    })
}

export const getCampaignEventsOrdersPerformanceData = async ({
    startDate,
    endDate,
    campaignIds,
    limit,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    offset,
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [CampaignOrderEventsDimensions.campaignId],
        measures: [CampaignOrderEventsMeasures.engagement],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.campaignOrderEvents,
            campaignIds,
        }),
        limit: limit,
        // TODO: we need to add support for offset to reporting endpoint first
        // offset: offset,
    })
}

export const getCampaignEventsTotalsData = async ({
    shopName,
    campaignIds,
    startDate,
    endDate,
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [],
        measures: [
            CampaignOrderEventsMeasures.impressions,
            CampaignOrderEventsMeasures.engagement,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.campaignOrderEvents,
            shopName,
            campaignIds,
        }),
    })
}

export const getCampaignOrderTotalsData = async ({
    shopName,
    campaignIds,
    startDate,
    endDate,
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [],
        measures: [
            OrderConversionMeasures.influencedRevenueUplift,
            OrderConversionMeasures.campaignSales,
            OrderConversionMeasures.campaignSalesCount,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.orderConversion,
            shopName,
            campaignIds,
        }),
    })
}

export const getStoreRevenueTotalData = async ({
    shopName,
    startDate,
    endDate,
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [],
        measures: [OrderConversionMeasures.gmv],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.orderConversion,
            shopName,
        }),
    })
}

export const getRevenueUpliftGraphData = async ({
    shopName,
    campaignIds,
    startDate,
    endDate,
    granularity = 'day',
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [],
        timeDimensions: [
            {
                dimension: OrderConversionDimensions.createdDatatime,
                dateRange: [startDate, endDate],
                granularity: granularity,
            },
        ],
        measures: [OrderConversionMeasures.influencedRevenueUplift],
        order: [[OrderConversionDimensions.createdDatatime, 'asc']],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.orderConversion,
            campaignIds,
            shopName,
        }),
    })
}

export const getCampaignsPerformanceGraphData = async ({
    shopName,
    campaignIds,
    startDate,
    endDate,
    granularity = 'day',
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [],
        timeDimensions: [
            {
                dimension: CampaignOrderEventsDimensions.createdDatatime,
                dateRange: [startDate, endDate],
                granularity: granularity,
            },
        ],
        measures: [
            CampaignOrderEventsMeasures.campaignCTR,
            CampaignOrderEventsMeasures.totalConversionRate,
        ],
        order: [[CampaignOrderEventsDimensions.createdDatatime, 'asc']],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.campaignOrderEvents,
            campaignIds,
            shopName,
        }),
    })
}
