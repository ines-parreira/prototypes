import client from 'pages/stats/revenue/clients/CubeProxyClient'
import {
    CubeFilter,
    CubeFilterParams,
    CubeResponse,
    DefaultFilterParams,
} from 'pages/stats/revenue/clients/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    Cube,
    EventsDimension,
    EventsMeasure,
    EventsSegment,
    FilterOperator,
    OrderConversionDimension,
    OrderConversionMeasure,
    SharedDimension,
} from 'pages/stats/revenue/clients/constants'
import {ReportingGranularity, ReportingParams} from 'models/reporting/types'

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
        member: `${cubeName}.${SharedDimension.createdDatetime}`,
        operator: FilterOperator.inDateRange,
        values: [startDate, endDate],
    }
}

const _shopNameEqualsFilter = (
    shopName: string,
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimension.shopName}`,
        operator: FilterOperator.equals,
        values: [shopName],
    }
}

const _campaignEqualsFilter = (
    campaignIds: string[],
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimension.campaignId}`,
        operator: FilterOperator.equals,
        values: campaignIds,
    }
}

export const getCampaignEventsPerformanceData = ({
    startDate,
    endDate,
    campaignIds,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [EventsDimension.campaignId],
            measures: [
                EventsMeasure.impressions,
                EventsMeasure.firstCampaignDisplay,
                EventsMeasure.lastCampaignDisplay,
                EventsMeasure.clicks,
                EventsMeasure.clicksRate,
            ],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.events,
                campaignIds,
            }),
            segments: [EventsSegment.campaignEventsOnly],
        },
    ]
}

export const getTrafficData = ({
    shopName,
    startDate,
    endDate,
    granularity = ReportingGranularity.Day,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            timeDimensions: [
                {
                    dimension: EventsDimension.createdDatetime,
                    dateRange: [startDate, endDate],
                    granularity: granularity as ReportingGranularity,
                },
            ],
            measures: [EventsMeasure.traffic],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.events,
                shopName,
            }),
        },
    ]
}

export const getCampaignOrderPerformanceData = ({
    startDate,
    endDate,
    campaignIds,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [OrderConversionDimension.campaignId],
            measures: [
                OrderConversionMeasure.campaignSales,
                OrderConversionMeasure.ticketSales,
                OrderConversionMeasure.ticketSalesCount,
                OrderConversionMeasure.discountSales,
                OrderConversionMeasure.discountSalesCount,
                OrderConversionMeasure.clickSales,
                OrderConversionMeasure.clickSalesCount,
                OrderConversionMeasure.campaignSalesCount,
            ],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                campaignIds,
            }),
        },
    ]
}

export const getCampaignEventsOrdersPerformanceData = ({
    startDate,
    endDate,
    campaignIds,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [CampaignOrderEventsDimension.campaignId],
            measures: [CampaignOrderEventsMeasure.engagement],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.campaignOrderEvents,
                campaignIds,
            }),
        },
    ]
}

export const getCampaignEventsTotalsData = ({
    shopName,
    campaignIds,
    startDate,
    endDate,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            measures: [
                CampaignOrderEventsMeasure.impressions,
                CampaignOrderEventsMeasure.engagement,
            ],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.campaignOrderEvents,
                shopName,
                campaignIds,
            }),
        },
    ]
}

export const getCampaignOrderTotalsData = ({
    shopName,
    campaignIds,
    startDate,
    endDate,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            measures: [
                OrderConversionMeasure.influencedRevenueUplift,
                OrderConversionMeasure.campaignSales,
                OrderConversionMeasure.campaignSalesCount,
            ],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                shopName,
                campaignIds,
            }),
        },
    ]
}

export const getStoreRevenueTotalData = ({
    shopName,
    startDate,
    endDate,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            measures: [OrderConversionMeasure.gmv],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                shopName,
            }),
        },
    ]
}

export const getRevenueUpliftGraphData = ({
    shopName,
    campaignIds,
    startDate,
    endDate,
    granularity = ReportingGranularity.Day,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            timeDimensions: [
                {
                    dimension: OrderConversionDimension.createdDatatime,
                    dateRange: [startDate, endDate],
                    granularity: granularity as ReportingGranularity,
                },
            ],
            measures: [OrderConversionMeasure.campaignSales],
            order: [[OrderConversionDimension.createdDatatime, 'asc']],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                campaignIds,
                shopName,
            }),
        },
    ]
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
                dimension: CampaignOrderEventsDimension.createdDatatime,
                dateRange: [startDate, endDate],
                granularity: granularity,
            },
        ],
        measures: [
            CampaignOrderEventsMeasure.campaignCTR,
            CampaignOrderEventsMeasure.totalConversionRate,
        ],
        order: [[CampaignOrderEventsDimension.createdDatatime, 'asc']],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cube.campaignOrderEvents,
            campaignIds,
            shopName,
        }),
    })
}
