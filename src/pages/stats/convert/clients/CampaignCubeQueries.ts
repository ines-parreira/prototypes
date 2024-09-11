import {OrderDirection} from 'models/api/types'
import {
    CampaignCubeFilterParams,
    CubeFilter,
    CubeFilterParams,
    DefaultFilterParams,
} from 'pages/stats/convert/clients/types'
import {
    CampaignOrderEventsDimension,
    CampaignOrderEventsMeasure,
    Cube,
    EventsMeasure,
    EventsSegment,
    FilterOperator,
    OrderConversionDimension,
    OrderConversionMeasure,
    SharedDimension,
} from 'pages/stats/convert/clients/constants'
import {
    ReportingGranularity,
    ReportingParams,
    ReportingQuery,
} from 'models/reporting/types'
import {getDateRange} from 'pages/stats/convert/clients/utils'
import {ConvertOrderConversionCube} from 'models/reporting/cubes/ConvertOrderConversionCube'
import {LogicalOperatorEnum} from 'pages/stats/common/components/Filter/constants'
import {FilterOperatorMap} from 'models/reporting/queryFactories/utils'

const _getDefaultFilters = ({
    startDate,
    endDate,
    cubeName,
    campaignIds,
    campaignsOperator,
    shopName,
    abVariant,
}: DefaultFilterParams): CubeFilter[] => {
    const filters = [_inDateRangeFilter(startDate, endDate, cubeName)]

    if (campaignIds && campaignsOperator && campaignIds?.length) {
        filters.push(
            _campaignEqualsFilter(campaignIds, campaignsOperator, cubeName)
        )
    }

    if (shopName) {
        filters.push(_shopNameEqualsFilter(shopName, cubeName))
    }

    if (abVariant) {
        filters.push(_abVariantEqualsFilter(abVariant, cubeName))
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
        values: getDateRange(startDate, endDate),
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

const _abVariantEqualsFilter = (
    abVariant: string,
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimension.abVariant}`,
        operator: FilterOperator.equals,
        values: [abVariant],
    }
}

const _campaignEqualsFilter = (
    campaignIds: string[],
    campaignIdsOperator: LogicalOperatorEnum,
    cubeName: string
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimension.campaignId}`,
        operator: FilterOperatorMap[campaignIdsOperator],
        values: campaignIds,
    }
}

const _campaignNotEqualsFilter = (cubeName: string): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimension.campaignId}`,
        operator: FilterOperator.notEquals,
        values: [''],
    }
}

export const getCampaignEventsPerformanceData = ({
    groupDimension,
    startDate,
    endDate,
    campaignIds,
    campaignsOperator,
    timezone,
}: CampaignCubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [`${Cube.events}.${groupDimension}`],
            measures: [
                EventsMeasure.impressions,
                EventsMeasure.firstCampaignDisplay,
                EventsMeasure.lastCampaignDisplay,
                EventsMeasure.clicks,
                EventsMeasure.clicksRate,
                EventsMeasure.ticketsCreated,
            ],
            timezone: timezone,
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.events,
                campaignIds,
                campaignsOperator,
            }),
            segments: [EventsSegment.campaignEventsOnly],
        },
    ]
}

export const getCampaignOrderPerformanceData = ({
    groupDimension,
    startDate,
    endDate,
    campaignIds,
    campaignsOperator,
    timezone,
}: CampaignCubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [`${Cube.orderConversion}.${groupDimension}`],
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
            timezone: timezone,
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                campaignIds,
                campaignsOperator,
            }),
        },
    ]
}

export const getCampaignOrderPerformanceDrillDownData = ({
    startDate,
    endDate,
    shopName,
    campaignIds,
    campaignsOperator,
    abVariant,
    timezone,
    sorting,
}: CubeFilterParams): ReportingQuery<ConvertOrderConversionCube> => {
    return {
        dimensions: [
            OrderConversionDimension.customerId,
            OrderConversionDimension.orderId,
            OrderConversionDimension.orderAmount,
            OrderConversionDimension.orderCurrency,
            OrderConversionDimension.orderProductIds,
            OrderConversionDimension.campaignId,
            OrderConversionDimension.createdDatatime,
        ],
        measures: [],
        timezone: timezone,
        filters: [
            ..._getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                campaignIds,
                campaignsOperator,
                shopName,
                abVariant,
            }),
            _campaignNotEqualsFilter(Cube.orderConversion),
        ],
        order: [
            [
                OrderConversionDimension.createdDatatime,
                sorting || OrderDirection.Desc,
            ],
        ],
    }
}

export const getCampaignEventsOrdersPerformanceData = ({
    groupDimension,
    startDate,
    endDate,
    campaignIds,
    campaignsOperator,
    timezone,
}: CampaignCubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [`${Cube.campaignOrderEvents}.${groupDimension}`],
            measures: [
                CampaignOrderEventsMeasure.engagement,
                CampaignOrderEventsMeasure.totalConversionRate,
                CampaignOrderEventsMeasure.campaignCTR,
            ],
            timezone: timezone,
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.campaignOrderEvents,
                campaignIds,
                campaignsOperator,
            }),
        },
    ]
}

export const getCampaignEventsTotalsData = ({
    shopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    timezone,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            measures: [
                CampaignOrderEventsMeasure.impressions,
                CampaignOrderEventsMeasure.engagement,
            ],
            timezone: timezone,
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.campaignOrderEvents,
                shopName,
                campaignIds,
                campaignsOperator,
            }),
        },
    ]
}

export const getCampaignOrderTotalsData = ({
    shopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    timezone,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            measures: [
                OrderConversionMeasure.campaignSales,
                OrderConversionMeasure.campaignSalesCount,
            ],
            timezone: timezone,
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                shopName,
                campaignIds,
                campaignsOperator,
            }),
        },
    ]
}

export const getStoreRevenueTotalData = ({
    shopName,
    startDate,
    endDate,
    timezone,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            measures: [OrderConversionMeasure.gmv],
            timezone: timezone,
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                shopName,
            }),
        },
    ]
}

export const getRevenueGraphData = ({
    shopName,
    startDate,
    endDate,
    granularity = ReportingGranularity.Day,
    timezone,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            timeDimensions: [
                {
                    dimension: OrderConversionDimension.createdDatatime,
                    dateRange: getDateRange(startDate, endDate),
                    granularity: granularity,
                },
            ],
            timezone: timezone,
            measures: [OrderConversionMeasure.gmv],
            order: [
                [OrderConversionDimension.createdDatatime, OrderDirection.Asc],
            ],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                shopName,
            }),
        },
    ]
}

export const getRevenueShareGraphData = ({
    shopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    granularity = ReportingGranularity.Day,
    timezone,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            timeDimensions: [
                {
                    dimension: OrderConversionDimension.createdDatatime,
                    dateRange: getDateRange(startDate, endDate),
                    granularity: granularity,
                },
            ],
            timezone: timezone,
            measures: [OrderConversionMeasure.campaignSales],
            order: [
                [OrderConversionDimension.createdDatatime, OrderDirection.Asc],
            ],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.orderConversion,
                campaignsOperator,
                campaignIds,
                shopName,
            }),
        },
    ]
}

export const getCampaignsPerformanceGraphData = ({
    shopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    granularity = ReportingGranularity.Day,
    timezone,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            timeDimensions: [
                {
                    dimension: CampaignOrderEventsDimension.createdDatatime,
                    dateRange: getDateRange(startDate, endDate),
                    granularity: granularity,
                },
            ],
            timezone: timezone,
            measures: [
                CampaignOrderEventsMeasure.campaignCTR,
                CampaignOrderEventsMeasure.totalConversionRate,
            ],
            order: [
                [
                    CampaignOrderEventsDimension.createdDatatime,
                    OrderDirection.Asc,
                ],
            ],
            filters: _getDefaultFilters({
                startDate,
                endDate,
                cubeName: Cube.campaignOrderEvents,
                campaignsOperator,
                campaignIds,
                shopName,
            }),
        },
    ]
}

export const getCampaignABTestEvents = ({
    shopName,
    startDate,
    endDate,
}: CubeFilterParams): ReportingParams => {
    return [
        {
            dimensions: [],
            timeDimensions: [],
            measures: [
                CampaignOrderEventsMeasure.orderCount,
                CampaignOrderEventsMeasure.firstCampaignDisplay,
            ],
            filters: [
                _inDateRangeFilter(
                    startDate,
                    endDate,
                    Cube.campaignOrderEvents
                ),
                _shopNameEqualsFilter(
                    shopName as string,
                    Cube.campaignOrderEvents
                ),
            ] as CubeFilter[],
        },
    ]
}
