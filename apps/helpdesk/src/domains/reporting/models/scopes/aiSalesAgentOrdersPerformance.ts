import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

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
