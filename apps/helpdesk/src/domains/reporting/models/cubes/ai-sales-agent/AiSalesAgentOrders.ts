import type { Cube } from 'domains/reporting/models/types'

export enum AiSalesAgentOrdersMeasure {
    Gmv = 'AiSalesAgentOrders.gmv',
    GmvUsd = 'AiSalesAgentOrders.gmvUsd',
    AverageDiscount = 'AiSalesAgentOrders.averageDiscount',
    AverageDiscountUsd = 'AiSalesAgentOrders.averageDiscountUsd',
    AverageDiscountPercentage = 'AiSalesAgentOrders.averageDiscountPercentage',
    AverageOrderValue = 'AiSalesAgentOrders.averageOrderValue',
    AverageOrderValueUsd = 'AiSalesAgentOrders.averageOrderValueUsd',
    Count = 'AiSalesAgentOrders.count',
    UniqCount = 'AiSalesAgentOrders.uniqCount',
}

export enum AiSalesAgentOrdersDimension {
    AccountId = 'AiSalesAgentOrders.accountId',
    IntegrationId = 'AiSalesAgentOrders.integrationId',
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
    ShippingCity = 'AiSalesAgentOrders.shippingCity',
    TicketId = 'AiSalesAgentOrders.ticketId',
    CustomerId = 'AiSalesAgentOrders.customerId',
    Source = 'AiSalesAgentOrders.source',
    Channel = 'AiSalesAgentOrders.channel',
    JourneyId = 'AiSalesAgentOrders.journeyId',
    Outcome = 'AiSalesAgentOrders.outcome',
}

export const ProductRecommendation = 'product-recommendation'

export enum AiSalesAgentOrdersFilterMember {
    AccountId = 'AiSalesAgentOrders.accountId',
    IntegrationId = 'AiSalesAgentOrders.integrationId',
    PeriodEnd = 'AiSalesAgentOrders.periodEnd',
    PeriodStart = 'AiSalesAgentOrders.periodStart',
    OrderId = 'AiSalesAgentOrders.orderId',
    Channel = 'AiSalesAgentOrders.channel',
    IsInfluenced = 'AiSalesAgentOrders.isInfluenced',
    JourneyId = 'AiSalesAgentOrders.journeyId',
    TicketId = 'AiSalesAgentOrders.ticketId',
    Outcome = 'AiSalesAgentOrders.outcome',
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
