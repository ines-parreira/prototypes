import type { Cube } from 'domains/reporting/models/types'

export enum AiSalesAgentConversationsMeasure {
    Count = 'AiSalesAgentConversations.count',
    AiJourneyTotalMessages = 'AiSalesAgentConversations.journeyTotalMessages',
    AiJourneyTotalFailedMessages = 'AiSalesAgentConversations.totalFailedMessages',
    ClickThroughRate = 'AiSalesAgentConversations.clickThroughRate',
    ReplyRate = 'AiSalesAgentConversations.replyRate',
    OptOutRate = 'AiSalesAgentConversations.optOutRate',
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
    Channel = 'AiSalesAgentConversations.channel',
    JourneyId = 'AiSalesAgentConversations.journeyId',
    JourneyCompleteReason = 'AiSalesAgentConversations.journeyCompleteReason',
    Replied = 'AiSalesAgentConversations.replied',
    Clicked = 'AiSalesAgentConversations.clicked',
    JourneyState = 'AiSalesAgentConversations.journeyState',
    ReplyCount = 'AiSalesAgentConversations.replyCount',
    EngagementCategory = 'AiSalesAgentConversations.engagementCategory',
}

export enum AiSalesAgentConversationsFilterMember {
    AccountId = 'AiSalesAgentConversations.accountId',
    StoreIntegrationId = 'AiSalesAgentConversations.storeIntegrationId',
    PeriodEnd = 'AiSalesAgentConversations.periodEnd',
    PeriodStart = 'AiSalesAgentConversations.periodStart',
    UserId = 'AiSalesAgentConversations.userId',
    Outcome = 'AiSalesAgentConversations.outcome',
    Channel = 'AiSalesAgentConversations.channel',
    JourneyId = 'AiSalesAgentConversations.journeyId',
}

export type AiSalesAgentConversationsCube = Cube<
    AiSalesAgentConversationsMeasure,
    AiSalesAgentConversationsDimension,
    never,
    AiSalesAgentConversationsFilterMember
>
