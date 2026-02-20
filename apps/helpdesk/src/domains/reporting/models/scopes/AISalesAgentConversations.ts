import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    OutcomeFilter,
    SourceFilter,
} from 'domains/reporting/models/queryFactories/ai-sales-agent/constants'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import {
    ApiOnlyOperatorEnum,
    LogicalOperatorEnum,
} from 'domains/reporting/pages/common/components/Filter/constants'

import { createScopeFilters } from './utils'

export const AISalesAgentConversationsScope = defineScope({
    scope: MetricScope.AISalesAgentConversations,
    measures: ['count'],
    filters: [
        'periodStart',
        'periodEnd',
        'isSalesOpportunity',
        'source',
        'outcome',
        'productId',
        'discountCode',
        'storeIntegrationId',
        'channel',
    ],
    dimensions: ['channel', 'productId', 'storeIntegrationId'],
    timeDimensions: ['createdDatetime'],
    order: ['count'],
})

export const AISalesAgentTotalSalesConversationsPerChannel =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_SALES_CONVERSATIONS_PER_CHANNEL,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        dimensions: ['channel'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
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

export const AISalesAgentTotalSalesConversationsPerChannelQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentTotalSalesConversationsPerChannel.build(ctx)

export const AISalesAgentAutomatedSalesConversationsPerChannel =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_AUTOMATED_SALES_CONVERSATIONS_PER_CHANNEL,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        dimensions: ['channel'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'outcome',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: [OutcomeFilter.Handover],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentAutomatedSalesConversationsPerChannelQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentAutomatedSalesConversationsPerChannel.build(ctx)

export const AISalesAgentProductRecommendationsCount =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_PRODUCT_RECOMMENDATIONS_COUNT,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        dimensions: ['productId'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'productId',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
        order: [['count', 'desc']],
        limit: 25,
    }))

export const AISalesAgentProductRecommendationsCountQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentProductRecommendationsCount.build(ctx)

export const AISalesAgentGroupedSalesOpportunity =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_GROUPED_SALES_OPPORTUNITY,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        dimensions: ['storeIntegrationId'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
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

export const AISalesAgentGroupedSalesOpportunityQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentGroupedSalesOpportunity.build(ctx)

export const AISalesAgentTotalNumberOfSalesConversations =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_SALES_CONVERSATIONS,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
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

export const AISalesAgentTotalNumberOfSalesConversationsQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentTotalNumberOfSalesConversations.build(ctx)

export const AISalesAgentTotalNumberOfAutomatedSales =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_NUMBER_OF_AUTOMATED_SALES,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'outcome',
                operator: LogicalOperatorEnum.NOT_ONE_OF,
                values: [OutcomeFilter.Handover],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentTotalNumberOfAutomatedSalesQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentTotalNumberOfAutomatedSales.build(ctx)

export const AISalesAgentTotalProductRecommendations =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_PRODUCT_RECOMMENDATIONS,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
            {
                member: 'productId',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            },
        ] as any,
    }))

export const AISalesAgentTotalProductRecommendationsQueryFactoryV2 = (
    ctx: Context,
) => AISalesAgentTotalProductRecommendations.build(ctx)

export const AISalesAgentDiscountCodesOffered =
    AISalesAgentConversationsScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_DISCOUNT_CODES_OFFERED,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['count'],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'isSalesOpportunity',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [true],
            },
            {
                member: 'discountCode',
                operator: ApiOnlyOperatorEnum.SET,
                values: [],
            },
            {
                member: 'source',
                operator: LogicalOperatorEnum.ONE_OF,
                values: [SourceFilter.ShoppingAssistant],
            },
        ] as any,
    }))

export const AISalesAgentDiscountCodesOfferedQueryFactoryV2 = (ctx: Context) =>
    AISalesAgentDiscountCodesOffered.build(ctx)
