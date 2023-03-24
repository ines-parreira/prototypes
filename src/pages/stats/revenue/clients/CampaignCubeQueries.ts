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
            EventsMeasures.traffic,
            EventsMeasures.impressions,
            EventsMeasures.uniqueImpressions,
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
        // TODO: we need to add support for offset to analytics endpoint first
        // offset: offset,
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
            OrderConversionMeasures.gmv,
            OrderConversionMeasures.influencedRevenueUplift,
            OrderConversionMeasures.ticketSales,
            OrderConversionMeasures.ticketSalesCount,
            OrderConversionMeasures.discountSales,
            OrderConversionMeasures.discountSalesCount,
            OrderConversionMeasures.clickSales,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.orderConversion,
            campaignIds,
        }),
        limit: limit,
        // TODO: we need to add support for offset to analytics endpoint first
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
        measures: [
            CampaignOrderEventsMeasures.engagement,
            CampaignOrderEventsMeasures.campaignCTR,
            CampaignOrderEventsMeasures.uniqueConversions,
            CampaignOrderEventsMeasures.totalConversionRate,
            CampaignOrderEventsMeasures.uniqueCampaignClicksConverted,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.campaignOrderEvents,
            campaignIds,
        }),
        limit: limit,
        // TODO: we need to add support for offset to analytics endpoint first
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
        dimensions: [CampaignOrderEventsDimensions.accountId],
        measures: [
            CampaignOrderEventsMeasures.impressions,
            CampaignOrderEventsMeasures.engagement,
            CampaignOrderEventsMeasures.uniqueConversions,
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
        dimensions: [OrderConversionDimensions.accountId],
        measures: [
            OrderConversionMeasures.gmv,
            OrderConversionMeasures.influencedRevenueUplift,
            OrderConversionMeasures.campaignSales,
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

export const getRevenueUpliftGraphData = async ({
    shopName,
    campaignIds,
    startDate,
    endDate,
    granularity = 'day',
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [OrderConversionDimensions.accountId],
        timeDimensions: [
            {
                dimension: OrderConversionDimensions.createdDatatime,
                dateRange: [startDate, endDate],
                granularity: granularity,
            },
        ],
        measures: [OrderConversionMeasures.influencedRevenueUplift],
        // TODO: return order back once analytics supports it
        // order: {
        //     [OrderConversionDimensions.createdDatetime]: 'asc',
        // },
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cubes.orderConversion,
            campaignIds,
            shopName,
        }),
    })
}
