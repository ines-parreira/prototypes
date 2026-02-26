import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    type Context,
    defineScope,
} from 'domains/reporting/models/scopes/scope'

const convertCampaignOrderEvents = defineScope({
    scope: MetricScope.ConvertCampaignOrderEvents,
    measures: [
        'campaignCTR',
        'engagement',
        'impressions',
        'totalConversionRate',
        'orderCount',
        'firstCampaignDisplay',
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

type ConvertCampaignOrderEventsContext = Context<
    typeof convertCampaignOrderEvents.config
>

export const convertCampaignEventsOrdersPerformance = convertCampaignOrderEvents
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_ORDERS_PERFORMANCE)
    .defineQuery(() => ({
        measures: ['engagement', 'totalConversionRate', 'campaignCTR'],
    }))

export const convertCampaignEventsOrdersPerformanceQueryFactoryV2 = (
    ctx: ConvertCampaignOrderEventsContext,
    dimension: 'abVariant' | 'campaignId',
) =>
    convertCampaignEventsOrdersPerformance.build({
        ...ctx,
        dimensions: [dimension],
    })

export const convertCampaignEventsTotals = convertCampaignOrderEvents
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_TOTALS)
    .defineQuery(() => ({
        measures: ['impressions', 'engagement'],
    }))

export const convertCampaignEventsTotalsQueryFactoryV2 = (
    ctx: ConvertCampaignOrderEventsContext,
) => convertCampaignEventsTotals.build(ctx)

export const convertCampaignImpressionTimeSeries = convertCampaignOrderEvents
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_IMPRESSION_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['impressions'],
        time_dimensions: [
            {
                dimension: 'createdDatetime',
                granularity: ctx.granularity,
            },
        ],
        order: [['createdDatetime', 'asc']],
    }))

export const convertCampaignImpressionTimeSeriesQueryFactoryV2 = (
    ctx: ConvertCampaignOrderEventsContext,
) => convertCampaignImpressionTimeSeries.build(ctx)

const convertCampaignABTestEvents = convertCampaignOrderEvents
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_AB_TEST_EVENTS)
    .defineQuery(() => ({
        measures: ['orderCount', 'firstCampaignDisplay'],
    }))

export const convertCampaignABTestEventsQueryFactoryV2 = (
    ctx: ConvertCampaignOrderEventsContext,
) => convertCampaignABTestEvents.build(ctx)
