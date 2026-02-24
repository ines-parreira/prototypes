import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { ProductRecommendation } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    InfluencedByFilter,
    SourceFilter,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { APIOnlyFilterKey } from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

import { createScopeFilters } from './utils'

const AISalesAgentOrdersScope = defineScope({
    scope: MetricScope.AISalesAgentOrders,
    measures: [
        'gmv',
        'gmvUsd',
        'count',
        'uniqCount',
        'averageDiscountUsd',
        'medianPurchaseTime',
    ],
    filters: [
        'periodStart',
        'periodEnd',
        'isInfluenced',
        'source',
        'storeIntegrationId',
        'influencedBy',
        'channel',
    ],
    dimensions: ['currency', 'channel', 'influencedProductId'],
    timeDimensions: ['periodStart'],
})

export type AISalesAgentOrdersContext = Context<
    typeof AISalesAgentOrdersScope.config
>

export const AISalesAgentGMV = AISalesAgentOrdersScope.defineMetricName(
    METRIC_NAMES.AI_SALES_AGENT_GMV,
).defineQuery(() => ({
    measures: ['gmv'],
    dimensions: ['currency'],
}))

export const AISalesAgentGMVQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentGMV.build(ctx)

export const AISalesAgentGMVInfluenced =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['gmv'],
        dimensions: ['currency'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentGMVInfluencedQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentGMVInfluenced.build(ctx)

export const AISalesAgentGMVInfluencedPerChannel =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_GMV_INFLUENCED_PER_CHANNEL,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['gmvUsd'],
        dimensions: ['channel'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentGMVInfluencedPerChannelQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentGMVInfluencedPerChannel.build(ctx)

export const AISalesAgentAverageOrderValue =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_AVERAGE_ORDER_VALUE,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['gmv', 'count'],
        dimensions: ['currency'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentAverageOrderValueQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentAverageOrderValue.build(ctx)

export const AISalesAgentProductBought =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_PRODUCT_BOUGHT,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['uniqCount'],
        dimensions: ['influencedProductId'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [ProductRecommendation],
            },
        ] as any,
    }))

export const AISalesAgentProductBoughtQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentProductBought.build(ctx)

export const AISalesAgentGMVUsdInfluenced =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_GMV_USD_INFLUENCED,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['gmvUsd'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentGMVUsdInfluencedQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentGMVUsdInfluenced.build(ctx)

export const AISalesAgentGMVUsd = AISalesAgentOrdersScope.defineMetricName(
    METRIC_NAMES.AI_SALES_AGENT_GMV_USD,
).defineQuery(() => ({
    measures: ['gmvUsd'],
}))

export const AISalesAgentGMVUsdQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentGMVUsd.build(ctx)

export const AISalesAgentTotalNumberOfOrder =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_ORDER,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentTotalNumberOfOrderQueryFactoryV2 = (
    ctx: AISalesAgentOrdersContext,
    onlyInfluenced = true,
) =>
    AISalesAgentTotalNumberOfOrder.build({
        ...ctx,
        filters: {
            ...ctx.filters,
            ...(onlyInfluenced
                ? {
                      [APIOnlyFilterKey.IsInfluenced]: withLogicalOperator([
                          true,
                      ]),
                  }
                : {}),
        },
    })

export const AISalesAgentTotalProductBought =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_BOUGHT,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [ProductRecommendation],
            },
        ] as any,
    }))

export const AISalesAgentTotalProductBoughtQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentTotalProductBought.build(ctx)

export const AISalesAgentDiscountCodesApplied =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_APPLIED,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [InfluencedByFilter.DiscountCount],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentDiscountCodesAppliedQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentDiscountCodesApplied.build(ctx)

export const AISalesAgentDiscountCodesAverage =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_AVERAGE,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['averageDiscountUsd'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'influencedBy',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [InfluencedByFilter.DiscountCount],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentDiscountCodesAverageQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentDiscountCodesAverage.build(ctx)

export const AISalesAgentGMVUsdTimeSeries =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_GMV_USD_TIME_SERIES,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['gmvUsd'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [false],
            },
        ] as any,
        time_dimensions: [
            {
                dimension: 'periodStart',
                granularity: ctx.granularity,
            },
        ],
    }))

export const AISalesAgentGMVUsdTimeSeriesQueryFactoryV2 = (
    ctx: AISalesAgentOrdersContext,
) => AISalesAgentGMVUsdTimeSeries.build(ctx)

export const AISalesAgentInfluencedUsdTimeSeries =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_INFLUENCED_GMV_TIME_SERIES,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['gmv'],
        dimensions: ['currency'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
        time_dimensions: [
            {
                dimension: 'periodStart',
                granularity: ctx.granularity,
            },
        ],
    }))

export const AISalesAgentInfluencedUsdTimeSeriesQueryFactoryV2 = (
    ctx: AISalesAgentOrdersContext,
) => AISalesAgentInfluencedUsdTimeSeries.build(ctx)

export const AISalesMedianPurchaseTime =
    AISalesAgentOrdersScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_MEDIAN_PURCHASE_TIME,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['medianPurchaseTime'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isInfluenced',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesMedianPurchaseTimeQueryFactoryV2 = (
    ctx: AISalesAgentOrdersContext,
) => AISalesMedianPurchaseTime.build(ctx)
