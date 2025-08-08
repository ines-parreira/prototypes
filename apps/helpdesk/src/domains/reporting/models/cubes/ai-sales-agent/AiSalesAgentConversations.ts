import { Cube } from 'domains/reporting/models/types'

export enum AiSalesAgentConversationsMeasure {
    Count = 'AiSalesAgentConversations.count',
    AiJourneyTotalMessages = 'AiSalesAgentConversations.journeyTotalMessages',
}

export enum AiSalesAgentConversationsDimension {
    AccountId = 'AiSalesAgentConversations.accountId',
    TicketId = 'AiSalesAgentConversations.ticketId',
    StoreIntegrationId = 'AiSalesAgentConversations.storeIntegrationId',
    IsSalesOpportunity = 'AiSalesAgentConversations.isSalesOpportunity',
    ProductId = 'AiSalesAgentConversations.productId',
    ProductIds = 'AiSalesAgentConversations.productIds',
    ProductVariantIds = 'AiSalesAgentConversations.productVariantIds',
    DiscountCode = 'AiSalesAgentConversations.discountCode',
    PeriodStart = 'AiSalesAgentConversations.periodStart',
    PeriodEnd = 'AiSalesAgentConversations.periodEnd',
    Outcome = 'AiSalesAgentConversations.outcome',
    Source = 'AiSalesAgentConversations.source',
    JourneyId = 'AiSalesAgentConversations.journeyId',
}

export enum AiSalesAgentConversationsFilterMember {
    AccountId = 'AiSalesAgentConversations.accountId',
    StoreIntegrationId = 'AiSalesAgentConversations.storeIntegrationId',
    PeriodEnd = 'AiSalesAgentConversations.periodEnd',
    PeriodStart = 'AiSalesAgentConversations.periodStart',
    UserId = 'AiSalesAgentConversations.userId',
    Outcome = 'AiSalesAgentConversations.outcome',
    Channel = 'AiSalesAgentConversations.channel',
}

export type AiSalesAgentConversationsCube = Cube<
    AiSalesAgentConversationsMeasure,
    AiSalesAgentConversationsDimension,
    never,
    AiSalesAgentConversationsFilterMember
>
