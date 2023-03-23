import client from 'pages/stats/revenue/clients/CubeProxyClient'
import {
    CubeFilter,
    CubeFilterParams,
    CubeResponse,
    DefaultFilterParams,
} from 'pages/stats/revenue/clients/types'

export const EVENTS_CUBE = 'CampaignEvents'
export const ORDER_CUBE = 'OrderConversion'
export const CAMPAIGN_ORDER_CUBE = 'CampaignOrderEvents'

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
        member: `${cubeName}.createdDatetime`,
        operator: 'inDateRange',
        values: [startDate, endDate],
    }
}

const _shopNameEqualsFilter = (
    shopName: string,
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.shopName`,
        operator: 'equals',
        values: [shopName],
    }
}

const _campaignEqualsFilter = (
    campaignIds: string[],
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.campaignId`,
        operator: 'equals',
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
        dimensions: [`${EVENTS_CUBE}.campaignId`],
        measures: [
            `${EVENTS_CUBE}.traffic`,
            `${EVENTS_CUBE}.impressions`,
            `${EVENTS_CUBE}.uniqueImpressions`,
            `${EVENTS_CUBE}.clicks`,
            `${EVENTS_CUBE}.clicksRate`,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: EVENTS_CUBE,
            campaignIds,
        }),
        segments: [`${EVENTS_CUBE}.campaignEventsOnly`],
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
        dimensions: [`${ORDER_CUBE}.campaignId`],
        measures: [
            `${ORDER_CUBE}.gmv`,
            `${ORDER_CUBE}.influencedRevenueUplift`,
            `${ORDER_CUBE}.ticketSales`,
            `${ORDER_CUBE}.ticketSalesCount`,
            `${ORDER_CUBE}.discountSales`,
            `${ORDER_CUBE}.discountSalesCount`,
            `${ORDER_CUBE}.clickSales`,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: ORDER_CUBE,
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
        dimensions: [`${CAMPAIGN_ORDER_CUBE}.campaignId`],
        measures: [
            `${CAMPAIGN_ORDER_CUBE}.engagement`,
            `${CAMPAIGN_ORDER_CUBE}.campaignCTR`,
            `${CAMPAIGN_ORDER_CUBE}.uniqueConversions`,
            `${CAMPAIGN_ORDER_CUBE}.totalConversionRate`,
            `${CAMPAIGN_ORDER_CUBE}.uniqueCampaignClicksConverted`,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: CAMPAIGN_ORDER_CUBE,
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
        dimensions: [`${CAMPAIGN_ORDER_CUBE}.accountId`],
        measures: [
            `${CAMPAIGN_ORDER_CUBE}.impressions`,
            `${CAMPAIGN_ORDER_CUBE}.engagement`,
            `${CAMPAIGN_ORDER_CUBE}.uniqueConversions`,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: CAMPAIGN_ORDER_CUBE,
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
        dimensions: [`${ORDER_CUBE}.accountId`],
        measures: [
            `${ORDER_CUBE}.gmv`,
            `${ORDER_CUBE}.influencedRevenueUplift`,
            `${ORDER_CUBE}.campaignSales`,
        ],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: ORDER_CUBE,
            shopName,
            campaignIds,
        }),
    })
}

export const getGMVUpliftGraphData = async ({
    campaignIds,
    startDate,
    endDate,
    granularity = 'day',
}: CubeFilterParams): Promise<CubeResponse> => {
    return await client.load({
        dimensions: [`${ORDER_CUBE}.accountId`],
        timeDimensions: [
            {
                dimension: `${ORDER_CUBE}.createdDatetime`,
                dateRange: [startDate, endDate],
                granularity: granularity,
            },
        ],
        measures: [`${ORDER_CUBE}.influencedRevenueUplift`],
        // TODO: return order back once analytics supports it
        // order: {
        //     [`${ORDER_CUBE}.createdDatetime`]: 'asc',
        // },
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: ORDER_CUBE,
            campaignIds,
        }),
    })
}
