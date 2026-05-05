import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiSalesAgentConversionRateScope = defineScope({
    scope: MetricScope.AiSalesAgentConversionRate,
    measures: ['conversionRate'],
    dimensions: [
        'channel',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
        'aiIntentCustomField',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['conversionRate', 'eventDatetime', 'ticketId'],
})

export type AiSalesAgentConversionRateContext = Context<
    typeof aiSalesAgentConversionRateScope.config
>

export const conversionRate = aiSalesAgentConversionRateScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_CONVERSION_RATE)
    .defineQuery(() => ({
        measures: ['conversionRate'] as const,
    }))

export const conversionRateQueryV2Factory = (
    ctx: AiSalesAgentConversionRateContext,
) => conversionRate.build(ctx)

export const dynamicConversionRate = aiSalesAgentConversionRateScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_CONVERSION_RATE,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['conversionRate'],
        dimensions: ctx.dimensions,
    }))

export const dynamicConversionRateQueryFactoryV2 = (ctx: Context) =>
    dynamicConversionRate.build(ctx)

export const dynamicConversionRateTimeseries = aiSalesAgentConversionRateScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_CONVERSION_RATE_TIMESERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['conversionRate'],
        time_dimensions: [
            {
                dimension: 'eventDatetime',
                granularity: ctx.granularity,
            },
        ],
        dimensions: ctx.dimensions,
        limit: 10000,
    }))

export const dynamicConversionRateTimeseriesQueryFactoryV2 = (ctx: Context) =>
    dynamicConversionRateTimeseries.build(ctx)

export const aiAgentSalesConversionRatePerChannel =
    aiSalesAgentConversionRateScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_CONVERSION_RATE_PER_CHANNEL,
        )
        .defineQuery(() => ({
            measures: ['conversionRate'] as const,
            dimensions: ['channel'] as const,
        }))

export const aiAgentSalesConversionRatePerChannelQueryV2Factory = (
    ctx: AiSalesAgentConversionRateContext,
) => aiAgentSalesConversionRatePerChannel.build(ctx)

export const aiAgentSalesConversionRatePerEngagementType =
    aiSalesAgentConversionRateScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_CONVERSION_RATE_PER_ENGAGEMENT_TYPE,
        )
        .defineQuery(() => ({
            measures: ['conversionRate'] as const,
            dimensions: ['engagementType'] as const,
        }))

export const aiAgentSalesConversionRatePerEngagementTypeQueryV2Factory = (
    ctx: AiSalesAgentConversionRateContext,
) => aiAgentSalesConversionRatePerEngagementType.build(ctx)

export const aiAgentSalesConversionRatePerIntent =
    aiSalesAgentConversionRateScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_CONVERSION_RATE_PER_INTENT,
        )
        .defineQuery(() => ({
            measures: ['conversionRate'] as const,
            dimensions: ['aiIntentCustomField'] as const,
        }))

export const aiAgentSalesConversionRatePerIntentQueryV2Factory = (
    ctx: AiSalesAgentConversionRateContext,
) => aiAgentSalesConversionRatePerIntent.build(ctx)
