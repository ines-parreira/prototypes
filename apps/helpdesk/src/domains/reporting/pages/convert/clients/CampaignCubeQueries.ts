import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { ConvertOrderConversionCube } from 'domains/reporting/models/cubes/ConvertOrderConversionCube'
import { ConvertOrderEventsCube } from 'domains/reporting/models/cubes/ConvertOrderEventsCube'
import { FilterOperatorMap } from 'domains/reporting/models/queryFactories/utils'
import {
    ReportingGranularity,
    ReportingParams,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
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
} from 'domains/reporting/pages/convert/clients/constants'
import {
    CampaignCubeFilterParams,
    CubeFilter,
    CubeFilterParams,
    DefaultFilterParams,
} from 'domains/reporting/pages/convert/clients/types'
import { getDateRange } from 'domains/reporting/pages/convert/clients/utils'
import { OrderDirection } from 'models/api/types'

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
            _campaignEqualsFilter(campaignIds, campaignsOperator, cubeName),
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
    cubeName: string,
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimension.createdDatetime}`,
        operator: FilterOperator.inDateRange,
        values: getDateRange(startDate, endDate),
    }
}

const _shopNameEqualsFilter = (
    shopName: string,
    cubeName: string,
): CubeFilter => {
    return {
        member: `${cubeName}.${SharedDimension.shopName}`,
        operator: FilterOperator.equals,
        values: [shopName],
    }
}

const _abVariantEqualsFilter = (
    abVariant: string,
    cubeName: string,
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
    cubeName: string,
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
            metricName: METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_PERFORMANCE,
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
            metricName: METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE,
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
        metricName: METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE_DRILL_DOWN,
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
            metricName: METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_ORDERS_PERFORMANCE,
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
            metricName: METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_TOTALS,
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
            metricName: METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_TOTALS,
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
            metricName: METRIC_NAMES.CONVERT_STORE_REVENUE_TOTAL,
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
            metricName: METRIC_NAMES.CONVERT_REVENUE_GRAPH,
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
            metricName: METRIC_NAMES.CONVERT_REVENUE_SHARE_GRAPH,
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
            metricName: METRIC_NAMES.CONVERT_CAMPAIGNS_PERFORMANCE_GRAPH,
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
                    Cube.campaignOrderEvents,
                ),
                _shopNameEqualsFilter(
                    shopName as string,
                    Cube.campaignOrderEvents,
                ),
            ] as CubeFilter[],
            metricName: METRIC_NAMES.CONVERT_CAMPAIGN_AB_TEST_EVENTS,
        },
    ]
}

export const campaignImpressionTimeSeriesQueryFactory = ({
    shopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    granularity = ReportingGranularity.Day,
    timezone,
}: CubeFilterParams): TimeSeriesQuery<ConvertOrderEventsCube> => {
    return {
        dimensions: [],
        timeDimensions: [
            {
                dimension: CampaignOrderEventsDimension.createdDatatime,
                dateRange: getDateRange(startDate, endDate),
                granularity: granularity,
            },
        ],
        measures: [CampaignOrderEventsMeasure.impressions],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cube.campaignOrderEvents,
            campaignsOperator,
            campaignIds,
            shopName,
        }),
        order: [
            [CampaignOrderEventsDimension.createdDatatime, OrderDirection.Asc],
        ],
        timezone: timezone,
        metricName: METRIC_NAMES.CONVERT_CAMPAIGN_IMPRESSION_TIME_SERIES,
    }
}

export const campaignOrdersTimeSeriesQueryFactory = ({
    shopName,
    campaignIds,
    campaignsOperator,
    startDate,
    endDate,
    granularity = ReportingGranularity.Day,
    timezone,
}: CubeFilterParams): TimeSeriesQuery<ConvertOrderConversionCube> => {
    return {
        dimensions: [],
        timeDimensions: [
            {
                dimension: OrderConversionDimension.createdDatatime,
                dateRange: getDateRange(startDate, endDate),
                granularity: granularity,
            },
        ],
        measures: [OrderConversionMeasure.campaignSalesCount],
        filters: _getDefaultFilters({
            startDate,
            endDate,
            cubeName: Cube.orderConversion,
            campaignsOperator,
            campaignIds,
            shopName,
        }),
        order: [[OrderConversionDimension.createdDatatime, OrderDirection.Asc]],
        timezone: timezone,
        metricName: METRIC_NAMES.CONVERT_CAMPAIGN_ORDERS_TIME_SERIES,
    }
}
