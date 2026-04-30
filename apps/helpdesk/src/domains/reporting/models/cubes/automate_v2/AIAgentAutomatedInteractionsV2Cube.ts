import type { Cube } from 'domains/reporting/models/types'

export enum AIAgentAutomatedInteractionsV2Dimension {
    TicketId = 'AIAgentAutomatedInteractionsV2.ticketId',
}

export enum AIAgentAutomatedInteractionsV2FilterMember {
    PeriodStart = 'AIAgentAutomatedInteractionsV2.periodStart',
    PeriodEnd = 'AIAgentAutomatedInteractionsV2.periodEnd',
    AiAgentRole = 'AIAgentAutomatedInteractionsV2.aiAgentRole',
    Channel = 'AIAgentAutomatedInteractionsV2.channel',
    StoreIntegrationId = 'AIAgentAutomatedInteractionsV2.storeIntegrationId',
}

export type AIAgentAutomatedInteractionsV2Cube = Cube<
    never,
    AIAgentAutomatedInteractionsV2Dimension,
    never,
    AIAgentAutomatedInteractionsV2FilterMember
>
