import type { Cube } from 'domains/reporting/models/types'

export enum AIAgentAutomatedInteractionsV2Dimension {
    TicketId = 'AIAgentAutomatedInteractionsV2.ticketId',
}

export enum AIAgentAutomatedInteractionsV2FilterMember {
    PeriodStart = 'AIAgentAutomatedInteractionsV2.periodStart',
    PeriodEnd = 'AIAgentAutomatedInteractionsV2.periodEnd',
    AiAgentSkill = 'AIAgentAutomatedInteractionsV2.aiAgentSkill',
}

export type AIAgentAutomatedInteractionsV2Cube = Cube<
    never,
    AIAgentAutomatedInteractionsV2Dimension,
    never,
    AIAgentAutomatedInteractionsV2FilterMember
>
