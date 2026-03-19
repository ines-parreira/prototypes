import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

const AiSalesAgentOrdersPerformanceScope = defineScope({
    scope: MetricScope.AiSalesAgentOrdersPerformance,
    measures: [
        'averageOrderValue',
        'averagePurchaseTime',
        'medianOrderValue',
        'medianPurchaseTime',
        'ordersInfluencedCount',
        'totalSalesAmount',
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
    typeof AiSalesAgentOrdersPerformanceScope.config
>

export const AiSalesAgentTotalSalesAmount =
    AiSalesAgentOrdersPerformanceScope.defineMetricName(
        METRIC_NAMES.AI_SALES_AGENT_TOTAL_SALES_AMOUNT,
    ).defineQuery(({ ctx, config }) => ({
        measures: ['totalSalesAmount'],
        filters: createScopeFilters(ctx.filters, config) as any,
    }))

export const AiSalesAgentTotalSalesAmountQueryFactoryV2 = (ctx: Context) =>
    AiSalesAgentTotalSalesAmount.build(ctx)
