import moment from 'moment'
import {TicketChannel} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {LegacyStatsFilters} from 'models/stat/types'
import {campaignSalesDrillDownQueryFactory} from 'pages/stats/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import {
    Cube,
    FilterOperator,
    OrderConversionDimension,
    SharedDimension,
} from 'pages/stats/convert/clients/constants'
import {getDateRange} from 'pages/stats/convert/clients/utils'

describe('campaignSalesDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const selectedCampaignIds = ['13b8f506-f77f-4740-bbc1-e61412029445']
    const statsFilters: LegacyStatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: [TicketChannel.Chat],
        integrations: [1],
        campaigns: [
            '13b8f506-f77f-4740-bbc1-e61412029445',
            '1c1edb2c-2ffc-4a5f-a59e-8267e804e252',
        ],
    }
    const shopName = 'shopify:athlete-shift'
    const timezone = 'someTimeZone'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            campaignSalesDrillDownQueryFactory(
                shopName,
                [],
                statsFilters,
                timezone,
                sorting
            )
        ).toEqual({
            dimensions: [
                OrderConversionDimension.customerId,
                OrderConversionDimension.orderId,
                OrderConversionDimension.orderAmount,
                OrderConversionDimension.orderCurrency,
                OrderConversionDimension.orderProductIds,
                OrderConversionDimension.campaignId,
                OrderConversionDimension.createdDatatime,
            ],
            filters: [
                {
                    member: `${Cube.orderConversion}.${SharedDimension.createdDatetime}`,
                    operator: FilterOperator.inDateRange,
                    values: getDateRange(
                        periodStart.toISOString(),
                        periodEnd.toISOString()
                    ),
                },
                {
                    member: `${Cube.orderConversion}.${SharedDimension.campaignId}`,
                    operator: FilterOperator.equals,
                    values: statsFilters.campaigns,
                },
                {
                    member: `${Cube.orderConversion}.${SharedDimension.shopName}`,
                    operator: FilterOperator.equals,
                    values: [shopName],
                },
                {
                    member: OrderConversionDimension.campaignId,
                    operator: FilterOperator.notEquals,
                    values: [''],
                },
            ],
            measures: [],
            timezone: timezone,
            order: [[OrderConversionDimension.createdDatatime, sorting]],
        })
    })

    it('should build a query giving priority to selectedCampaignIds', () => {
        expect(
            campaignSalesDrillDownQueryFactory(
                shopName,
                selectedCampaignIds,
                statsFilters,
                timezone,
                sorting
            )
        ).toEqual({
            dimensions: [
                OrderConversionDimension.customerId,
                OrderConversionDimension.orderId,
                OrderConversionDimension.orderAmount,
                OrderConversionDimension.orderCurrency,
                OrderConversionDimension.orderProductIds,
                OrderConversionDimension.campaignId,
                OrderConversionDimension.createdDatatime,
            ],
            filters: [
                {
                    member: `${Cube.orderConversion}.${SharedDimension.createdDatetime}`,
                    operator: FilterOperator.inDateRange,
                    values: getDateRange(
                        periodStart.toISOString(),
                        periodEnd.toISOString()
                    ),
                },
                {
                    member: `${Cube.orderConversion}.${SharedDimension.campaignId}`,
                    operator: FilterOperator.equals,
                    values: selectedCampaignIds,
                },
                {
                    member: `${Cube.orderConversion}.${SharedDimension.shopName}`,
                    operator: FilterOperator.equals,
                    values: [shopName],
                },
                {
                    member: OrderConversionDimension.campaignId,
                    operator: FilterOperator.notEquals,
                    values: [''],
                },
            ],
            measures: [],
            timezone: timezone,
            order: [[OrderConversionDimension.createdDatatime, sorting]],
        })
    })
})
