import moment from 'moment'

import { TicketChannel } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { withDefaultLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    Cube,
    FilterOperator,
    OrderConversionDimension,
    SharedDimension,
} from 'domains/reporting/pages/convert/clients/constants'
import { campaignSalesDrillDownQueryFactory } from 'domains/reporting/pages/convert/clients/queryFactories/campaignSalesDrillDownQueryFactory'
import { formatReportingQueryDate } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

describe('campaignSalesDrillDownQueryFactory', () => {
    const periodStart = moment()
    const periodEnd = periodStart.add(7, 'days')
    const selectedCampaignIds = ['13b8f506-f77f-4740-bbc1-e61412029445']
    const statsFilters: StatsFilters = {
        period: {
            end_datetime: periodEnd.toISOString(),
            start_datetime: periodStart.toISOString(),
        },
        channels: withDefaultLogicalOperator([TicketChannel.Chat]),
        integrations: withDefaultLogicalOperator([1]),
        campaigns: withDefaultLogicalOperator([
            '13b8f506-f77f-4740-bbc1-e61412029445',
            '1c1edb2c-2ffc-4a5f-a59e-8267e804e252',
        ]),
    }
    const shopName = 'shopify:athlete-shift'
    const timezone = 'someTimeZone'
    const abVariant = 'CVAASP33YDHGCHQDDZT49KJ54A'
    const sorting = OrderDirection.Asc

    it('should build a query', () => {
        expect(
            campaignSalesDrillDownQueryFactory(
                shopName,
                [],
                LogicalOperatorEnum.ONE_OF,
                statsFilters,
                timezone,
                sorting,
                abVariant,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE_DRILL_DOWN,
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
                    member: `${Cube.orderConversion}.periodStart`,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(periodStart.toISOString()),
                    ],
                },
                {
                    member: `${Cube.orderConversion}.periodEnd`,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd.toISOString())],
                },
                {
                    member: `${Cube.orderConversion}.${SharedDimension.campaignId}`,
                    operator: FilterOperator.equals,
                    values: statsFilters.campaigns?.values,
                },
                {
                    member: `${Cube.orderConversion}.${SharedDimension.shopName}`,
                    operator: FilterOperator.equals,
                    values: [shopName],
                },
                {
                    member: `${Cube.orderConversion}.${SharedDimension.abVariant}`,
                    operator: FilterOperator.equals,
                    values: [abVariant],
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
                LogicalOperatorEnum.ONE_OF,
                statsFilters,
                timezone,
                sorting,
            ),
        ).toEqual({
            metricName:
                METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE_DRILL_DOWN,
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
                    member: `${Cube.orderConversion}.periodStart`,
                    operator: ReportingFilterOperator.AfterDate,
                    values: [
                        formatReportingQueryDate(periodStart.toISOString()),
                    ],
                },
                {
                    member: `${Cube.orderConversion}.periodEnd`,
                    operator: ReportingFilterOperator.BeforeDate,
                    values: [formatReportingQueryDate(periodEnd.toISOString())],
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
