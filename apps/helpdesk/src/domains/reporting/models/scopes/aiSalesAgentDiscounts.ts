import { MetricScope } from 'domains/reporting/hooks/metricNames'
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
