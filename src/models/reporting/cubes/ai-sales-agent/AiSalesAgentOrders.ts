import { Cube } from 'models/reporting/types'

export enum AiSalesAgentOrdersMeasure {
    Gmv = 'AiSalesAgentOrders.gmv',
    GmvUsd = 'AiSalesAgentOrders.gmvUsd',
    AverageDiscount = 'AiSalesAgentOrders.averageDiscount',
    AverageDiscountUsd = 'AiSalesAgentOrders.averageDiscountUsd',
    AverageDiscountPercentage = 'AiSalesAgentOrders.averageDiscountPercentage',
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
}

export enum AiSalesAgentOrdersFilterMember {
    AccountId = 'AiSalesAgentOrders.accountId',
    IntegrationId = 'AiSalesAgentOrders.integrationId',
    PeriodEnd = 'AiSalesAgentOrders.periodEnd',
    PeriodStart = 'AiSalesAgentOrders.periodStart',
    Channel = 'AiSalesAgentOrders.channel',
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
