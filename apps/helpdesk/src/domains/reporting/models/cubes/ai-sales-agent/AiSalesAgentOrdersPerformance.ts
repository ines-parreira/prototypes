import type { Cube } from 'domains/reporting/models/types'

export enum AiSalesAgentOrdersPerformanceMeasure {
    OrdersInfluencedCount = 'AiSalesAgentOrdersPerformance.ordersInfluencedCount',
}

export enum AiSalesAgentOrdersPerformanceDimension {
    TicketId = 'AiSalesAgentOrdersPerformance.ticketId',
    OrderId = 'AiSalesAgentOrdersPerformance.orderId',
    TotalAmount = 'AiSalesAgentOrdersPerformance.totalAmount',
    PurchaseTime = 'AiSalesAgentOrdersPerformance.purchaseTime',
    IsInfluenced = 'AiSalesAgentOrdersPerformance.isInfluenced',
    Source = 'AiSalesAgentOrdersPerformance.source',
}

export enum AiSalesAgentOrdersPerformanceFilterMember {
    PeriodStart = 'AiSalesAgentOrdersPerformance.periodStart',
    PeriodEnd = 'AiSalesAgentOrdersPerformance.periodEnd',
    Channel = 'AiSalesAgentOrdersPerformance.channel',
    StoreIntegrationId = 'AiSalesAgentOrdersPerformance.storeIntegrationId',
    EngagementFeature = 'AiSalesAgentOrdersPerformance.engagementFeature',
    Currency = 'AiSalesAgentOrdersPerformance.currency',
}

export type AiSalesAgentOrdersPerformanceCube = Cube<
    AiSalesAgentOrdersPerformanceMeasure,
    AiSalesAgentOrdersPerformanceDimension,
    never,
    AiSalesAgentOrdersPerformanceFilterMember
>
