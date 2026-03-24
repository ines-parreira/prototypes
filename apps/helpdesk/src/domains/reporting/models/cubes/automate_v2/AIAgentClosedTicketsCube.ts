import type { Cube } from 'domains/reporting/models/types'

export enum AIAgentClosedTicketsDimension {
    TicketId = 'AIAgentClosedTickets.ticketId',
}

export enum AIAgentClosedTicketsFilterMember {
    PeriodStart = 'AIAgentClosedTickets.periodStart',
    PeriodEnd = 'AIAgentClosedTickets.periodEnd',
    AiAgentSkill = 'AIAgentClosedTickets.aiAgentSkill',
}

export type AIAgentClosedTicketsCube = Cube<
    never,
    AIAgentClosedTicketsDimension,
    never,
    AIAgentClosedTicketsFilterMember
>
