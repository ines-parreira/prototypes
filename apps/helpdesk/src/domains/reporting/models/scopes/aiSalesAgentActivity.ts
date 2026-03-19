import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiSalesAgentActivityScope = defineScope({
    scope: MetricScope.AiSalesAgentActivity,
    measures: ['recommendedProductCount', 'revenuePerInteraction'],
    dimensions: [
        'attributedRevenue',
        'channel',
        'engagementType',
        'productRecommended',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'eventDatetime',
        'productRecommendations',
        'revenuePerInteraction',
        'ticketId',
    ],
})

export type AiSalesAgentActivityContext = Context<
    typeof aiSalesAgentActivityScope.config
>

export const recommendedProductCount = aiSalesAgentActivityScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_PRODUCT_RECOMMENDATIONS,
    )
    .defineQuery(() => ({
        measures: ['recommendedProductCount'] as const,
    }))

export const recommendedProductCountQueryV2Factory = (
    ctx: AiSalesAgentActivityContext,
) => recommendedProductCount.build(ctx)

export const revenuePerInteraction = aiSalesAgentActivityScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
    )
    .defineQuery(() => ({
        measures: ['revenuePerInteraction'] as const,
    }))

export const revenuePerInteractionQueryV2Factory = (
    ctx: AiSalesAgentActivityContext,
) => revenuePerInteraction.build(ctx)
