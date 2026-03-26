import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

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

export const dynamicRevenuePerInteraction = aiSalesAgentActivityScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_REVENUE_PER_INTERACTION,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['revenuePerInteraction'],
        dimensions: ctx.dimensions,
    }))

export const dynamicRevenuePerInteractionQueryFactoryV2 = (ctx: Context) =>
    dynamicRevenuePerInteraction.build(ctx)

export const aiAgentSalesRevenuePerInteractionPerChannel =
    aiSalesAgentActivityScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_REVENUE_PER_INTERACTION_PER_CHANNEL,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['revenuePerInteraction'] as const,
            dimensions: ['channel'] as const,
            filters: [
                ...createScopeFilters(ctx.filters, config),
                {
                    member: 'aiAgentSkill',
                    operator: LogicalOperatorEnum.ONE_OF,
                    values: [AutomationSkillType.AiAgentSales],
                },
            ] as any,
        }))

export const aiAgentSalesRevenuePerInteractionPerChannelQueryV2Factory = (
    ctx: AiSalesAgentActivityContext,
) => aiAgentSalesRevenuePerInteractionPerChannel.build(ctx)
