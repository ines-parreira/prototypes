import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import {
    type Context,
    defineScope,
} from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { CAMPAIGN_EVENTS } from 'domains/reporting/pages/convert/clients/constants'

const convertCampaignEvents = defineScope({
    scope: MetricScope.ConvertCampaignEvents,
    measures: [
        'clicks',
        'clicksRate',
        'firstCampaignDisplay',
        'impressions',
        'lastCampaignDisplay',
        'ticketsCreated',
        'uniqClicks',
    ],
    dimensions: ['abVariant', 'campaignId', 'productId'],
    filters: [
        'abVariant',
        'campaignId',
        'createdDatetime',
        'periodEnd',
        'periodStart',
        'source',
        'eventType',
    ],
})

type ConvertCampaignEventsContext = Context<typeof convertCampaignEvents.config>

export const convertCampaignEventsPerformance = convertCampaignEvents
    .defineMetricName(METRIC_NAMES.CONVERT_CAMPAIGN_EVENTS_PERFORMANCE)
    .defineQuery(({ ctx, config }) => ({
        measures: [
            'impressions',
            'firstCampaignDisplay',
            'lastCampaignDisplay',
            'clicks',
            'clicksRate',
            'ticketsCreated',
        ],
        filters: createScopeFilters(
            { ...ctx.filters, eventType: withLogicalOperator(CAMPAIGN_EVENTS) },
            config,
        ),
    }))

export const convertCampaignEventsPerformanceQueryFactoryV2 = (
    ctx: ConvertCampaignEventsContext,
    dimension: 'campaignId' | 'abVariant',
) => convertCampaignEventsPerformance.build({ ...ctx, dimensions: [dimension] })

export const aiSalesAgentProductClicks = convertCampaignEvents
    .defineMetricName(METRIC_NAMES.AI_SALES_AGENT_PRODUCT_CLICKS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['uniqClicks'],
        dimensions: ['productId'],
        filters: createScopeFilters(
            {
                period: ctx.filters.period,
                source: withLogicalOperator(['ai-agent']),
            },
            config,
        ),
    }))

export const aiSalesAgentProductClicksQueryFactoryV2 = (ctx: Context) =>
    aiSalesAgentProductClicks.build(ctx)

const aiSalesAgentUniqueClicks = convertCampaignEvents
    .defineMetricName(METRIC_NAMES.AI_SALES_AGENT_UNIQUE_CLICKS)
    .defineQuery(({ ctx, config }) => ({
        measures: ['uniqClicks'],
        filters: createScopeFilters(
            {
                period: ctx.filters.period,
                source: withLogicalOperator(['ai-agent']),
            },
            config,
        ),
    }))

export const aiSalesAgentUniqueClicksQueryFactoryV2 = (ctx: Context) =>
    aiSalesAgentUniqueClicks.build(ctx)
