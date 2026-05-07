import type { Cube } from 'domains/reporting/models/types'

export enum AIAgentClosedTicketsDimension {
    TicketId = 'AIAgentClosedTickets.ticketId',
}

export enum AIAgentClosedTicketsFilterMember {
    PeriodStart = 'AIAgentClosedTickets.periodStart',
    PeriodEnd = 'AIAgentClosedTickets.periodEnd',
    AiAgentRole = 'AIAgentClosedTickets.aiAgentRole',
    Channel = 'AIAgentClosedTickets.channel',
    StoreIntegrationId = 'AIAgentClosedTickets.storeIntegrationId',
    AiAgentOutcomeCustomFieldId = 'AIAgentClosedTickets.aiAgentOutcomeCustomFieldId',
}

export type AIAgentClosedTicketsCube = Cube<
    never,
    AIAgentClosedTicketsDimension,
    never,
    AIAgentClosedTicketsFilterMember
>
