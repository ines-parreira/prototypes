import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { AutomationSkillType } from 'domains/reporting/models/scopes/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

export const aiSalesAgentOrdersPerformanceScope = defineScope({
    scope: MetricScope.AiSalesAgentOrdersPerformance,
    measures: [
        'averageOrderValue',
        'averagePurchaseTime',
        'medianOrderValue',
        'medianPurchaseTime',
        'ordersInfluencedCount',
        'totalSalesAmount',
        'totalSalesAmountUsd',
    ],
    dimensions: [
        'channel',
        'currency',
        'engagementType',
        'orderId',
        'purchaseTime',
        'storeIntegrationId',
        'ticketId',
        'totalAmount',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'channel',
        'currency',
        'engagementType',
        'orderId',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['eventDatetime', 'purchaseTime', 'ticketId', 'totalAmount'],
})

export type AiSalesAgentOrdersPerformanceContext = Context<
    typeof aiSalesAgentOrdersPerformanceScope.config
>

export const totalSalesAmountUsd = aiSalesAgentOrdersPerformanceScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_TOTAL_SALES)
    .defineQuery(() => ({
        measures: ['totalSalesAmountUsd'] as const,
    }))

export const totalSalesAmountUsdQueryV2Factory = (
    ctx: AiSalesAgentOrdersPerformanceContext,
) => totalSalesAmountUsd.build(ctx)

export const ordersInfluencedCount = aiSalesAgentOrdersPerformanceScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_ORDERS_INFLUENCED,
    )
    .defineQuery(() => ({
        measures: ['ordersInfluencedCount'] as const,
    }))

export const ordersInfluencedCountQueryV2Factory = (
    ctx: AiSalesAgentOrdersPerformanceContext,
) => ordersInfluencedCount.build(ctx)

export const medianPurchaseTime = aiSalesAgentOrdersPerformanceScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_MEDIAN_PURCHASE_TIME,
    )
    .defineQuery(() => ({
        measures: ['medianPurchaseTime'] as const,
    }))

export const medianPurchaseTimeQueryV2Factory = (
    ctx: AiSalesAgentOrdersPerformanceContext,
) => medianPurchaseTime.build(ctx)

export const averageOrderValue = aiSalesAgentOrdersPerformanceScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AVERAGE_ORDER_VALUE,
    )
    .defineQuery(() => ({
        measures: ['averageOrderValue'] as const,
    }))

export const averageOrderValueQueryV2Factory = (
    ctx: AiSalesAgentOrdersPerformanceContext,
) => averageOrderValue.build(ctx)

export const dynamicTotalSalesAmount = aiSalesAgentOrdersPerformanceScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_TOTAL_SALES_AMOUNT,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['totalSalesAmount'],
        dimensions: ctx.dimensions,
    }))

export const dynamicTotalSalesAmountQueryFactoryV2 = (ctx: Context) =>
    dynamicTotalSalesAmount.build(ctx)

export const dynamicOrdersInfluencedCount = aiSalesAgentOrdersPerformanceScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_DYNAMIC_SHOPPING_ASSISTANT_ORDERS_INFLUENCED_COUNT,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ordersInfluencedCount'],
        dimensions: ctx.dimensions,
    }))

export const dynamicOrdersInfluencedCountQueryFactoryV2 = (ctx: Context) =>
    dynamicOrdersInfluencedCount.build(ctx)

export const aiAgentSalesTotalSalesPerChannel =
    aiSalesAgentOrdersPerformanceScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_TOTAL_SALES_PER_CHANNEL,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['totalSalesAmountUsd'] as const,
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

export const aiAgentSalesTotalSalesPerChannelQueryV2Factory = (
    ctx: AiSalesAgentOrdersPerformanceContext,
) => aiAgentSalesTotalSalesPerChannel.build(ctx)

export const aiAgentSalesOrdersInfluencedPerChannel =
    aiSalesAgentOrdersPerformanceScope
        .defineMetricName(
            METRIC_NAMES.AI_AGENT_SALES_PERFORMANCE_ORDERS_INFLUENCED_PER_CHANNEL,
        )
        .defineQuery(({ ctx, config }) => ({
            measures: ['ordersInfluencedCount'] as const,
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

export const aiAgentSalesOrdersInfluencedPerChannelQueryV2Factory = (
    ctx: AiSalesAgentOrdersPerformanceContext,
) => aiAgentSalesOrdersInfluencedPerChannel.build(ctx)
