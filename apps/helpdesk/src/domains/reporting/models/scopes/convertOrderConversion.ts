import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const convertOrderConversion = defineScope({
    scope: MetricScope.ConvertOrderConversion,
    measures: [
        'campaignSales',
        'campaignSalesCount',
        'clickSales',
        'clickSalesCount',
        'discountSales',
        'discountSalesCount',
        'gmv',
        'ticketSales',
        'ticketSalesCount',
    ],
    dimensions: ['abVariant', 'campaignId'],
    timeDimensions: ['createdDatetime'],
    filters: [
        'abVariant',
        'campaignId',
        'createdDatetime',
        'periodEnd',
        'periodStart',
        'shopName',
    ],
    order: ['createdDatetime'],
})

type ConvertOrderConversionContext = Context<
    typeof convertOrderConversion.config
>

export const convertCampaignOrderPerformance = convertOrderConversion
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_PERFORMANCE)
    .defineQuery(() => ({
        measures: [
            'campaignSales',
            'ticketSales',
            'ticketSalesCount',
            'discountSales',
            'discountSalesCount',
            'clickSales',
            'clickSalesCount',
            'campaignSalesCount',
        ],
    }))

export const convertCampaignOrderPerformanceQueryFactoryV2 = (
    ctx: ConvertOrderConversionContext,
    dimension: 'abVariant' | 'campaignId',
) =>
    convertCampaignOrderPerformance.build({
        ...ctx,
        dimensions: [dimension],
    })

export const convertStoreRevenueTotal = convertOrderConversion
    .defineMetricName(METRIC_NAMES.CONVERT_STORE_REVENUE_TOTAL)
    .defineQuery(() => ({ measures: ['gmv'] }))

export const convertStoreRevenueTotalQueryFactoryV2 = (
    ctx: ConvertOrderConversionContext,
) => convertStoreRevenueTotal.build(ctx)

export const convertCampaignOrderTotals = convertOrderConversion
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_ORDER_TOTALS)
    .defineQuery(() => ({
        measures: ['campaignSales', 'campaignSalesCount'],
    }))

export const convertCampaignOrderTotalsQueryFactoryV2 = (
    ctx: ConvertOrderConversionContext,
) => convertCampaignOrderTotals.build(ctx)

export const convertCampaignShareGraph = convertOrderConversion
    .defineMetricName(METRIC_NAMES.CONVERT_REVENUE_SHARE_GRAPH)
    .defineQuery(({ ctx }) => ({
        measures: ['campaignSales'],
        time_dimensions: [
            {
                dimension: 'createdDatetime',
                granularity: ctx.granularity,
            },
        ],
        order: [['createdDatetime', 'asc']],
    }))

export const convertCampaignShareGraphQueryFactoryV2 = (
    ctx: ConvertOrderConversionContext,
) => convertCampaignShareGraph.build(ctx)

const convertCampaignOrdersTimeSeries = convertOrderConversion
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_ORDERS_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['campaignSalesCount'],
        time_dimensions: [
            {
                dimension: 'createdDatetime',
                granularity: ctx.granularity,
            },
        ],
        order: [['createdDatetime', 'asc']],
    }))

export const convertCampaignOrdersTimeSeriesQueryFactoryV2 = (
    ctx: ConvertOrderConversionContext,
) => convertCampaignOrdersTimeSeries.build(ctx)

const convertRevenueGraph = convertOrderConversion
    .defineMetricName(METRIC_NAMES.CONVERT_REVENUE_GRAPH)
    .defineQuery(({ ctx }) => ({
        measures: ['gmv'],
        time_dimensions: [
            {
                dimension: 'createdDatetime',
                granularity: ctx.granularity,
            },
        ],
        order: [['createdDatetime', 'asc']],
    }))

export const convertRevenueGraphQueryFactoryV2 = (
    ctx: ConvertOrderConversionContext,
) => convertRevenueGraph.build(ctx)
