import { Cube } from 'models/reporting/types'

export enum AiSalesAgentOrdersMeasure {
    Gmv = 'AiSalesAgentOrders.gmv',
    GmvUsd = 'AiSalesAgentOrders.gmvUsd',
    AverageDiscount = 'AiSalesAgentOrders.averageDiscount',
    Count = 'AiSalesAgentOrders.count',
}

export enum AiSalesAgentOrdersDimension {
    AccountId = 'AiSalesAgentOrders.accountId',
    OrderId = 'AiSalesAgentOrders.orderId',
    TotalAmount = 'AiSalesAgentOrders.totalAmount',
    RefundedAmount = 'AiSalesAgentOrders.refundedAmount',
    TotalDiscount = 'AiSalesAgentOrders.totalDiscount',
    Currency = 'AiSalesAgentOrders.currency',
    IsInfluenced = 'AiSalesAgentOrders.isInfluenced',
    InfluencedBy = 'AiSalesAgentOrders.influencedBy',
    ProductId = 'AiSalesAgentOrders.productId',
    InfluencedProductId = 'AiSalesAgentOrders.influencedProductId',
    DiscountCode = 'AiSalesAgentOrders.discountCode',
    PeriodEnd = 'AiSalesAgentOrders.periodEnd',
    PeriodStart = 'AiSalesAgentOrders.periodStart',
}

export enum AiSalesAgentOrdersFilterMember {
    AccountId = 'AiSalesAgentOrders.accountId',
    IntegrationId = 'AiSalesAgentOrders.integrationId',
    PeriodEnd = 'AiSalesAgentOrders.periodEnd',
    PeriodStart = 'AiSalesAgentOrders.periodStart',
}

export type AiSalesAgentOrdersTimeDimension =
    | ValueOf<AiSalesAgentOrdersFilterMember.PeriodStart>
    | ValueOf<AiSalesAgentOrdersFilterMember.PeriodEnd>

export type AiSalesAgentOrdersCube = Cube<
    AiSalesAgentOrdersMeasure,
    AiSalesAgentOrdersDimension,
    never,
    AiSalesAgentOrdersFilterMember,
    AiSalesAgentOrdersTimeDimension
>
