import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiSalesAgentDiscountsScope = defineScope({
    scope: MetricScope.AiSalesAgentDiscounts,
    measures: [
        'appliedDiscountCodesCount',
        'averageDiscountAmount',
        'discountUsage',
        'medianDiscountAmount',
        'offeredDiscountCodesCount',
    ],
    dimensions: [
        'channel',
        'currency',
        'discountAmount',
        'discountCodeOffered',
        'discountCodeUsed',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'channel',
        'currency',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'appliedDiscountCodesCount',
        'eventDatetime',
        'offeredDiscountCodesCount',
        'ticketId',
    ],
})

export type AiSalesAgentDiscountsContext = Context<
    typeof aiSalesAgentDiscountsScope.config
>

export const discountCodesOffered = aiSalesAgentDiscountsScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_DISCOUNT_CODES_OFFERED,
    )
    .defineQuery(() => ({
        measures: ['offeredDiscountCodesCount'] as const,
    }))

export const discountCodesOfferedQueryV2Factory = (
    ctx: AiSalesAgentDiscountsContext,
) => discountCodesOffered.build(ctx)

export const averageDiscountAmount = aiSalesAgentDiscountsScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_AVERAGE_DISCOUNT_AMOUNT,
    )
    .defineQuery(() => ({
        measures: ['averageDiscountAmount'] as const,
    }))

export const averageDiscountAmountQueryV2Factory = (
    ctx: AiSalesAgentDiscountsContext,
) => averageDiscountAmount.build(ctx)

export const discountUsage = aiSalesAgentDiscountsScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_DISCOUNT_USAGE)
    .defineQuery(() => ({
        measures: ['discountUsage'] as const,
    }))

export const discountUsageQueryV2Factory = (
    ctx: AiSalesAgentDiscountsContext,
) => discountUsage.build(ctx)

export const appliedDiscountCodes = aiSalesAgentDiscountsScope
    .defineMetricName(
        METRIC_NAMES.AI_AGENT_SHOPPING_ASSISTANT_DISCOUNT_CODES_APPLIED,
    )
    .defineQuery(() => ({
        measures: ['appliedDiscountCodesCount'] as const,
    }))

export const appliedDiscountCodesQueryV2Factory = (
    ctx: AiSalesAgentDiscountsContext,
) => appliedDiscountCodes.build(ctx)
