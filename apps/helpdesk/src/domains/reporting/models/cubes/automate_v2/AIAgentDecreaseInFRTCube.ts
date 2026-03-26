import type { Cube } from 'domains/reporting/models/types'

export enum AIAgentDecreaseInFRTDimension {
    TicketId = 'AIAgentDecreaseInFRT.ticketId',
    FirstResponseTime = 'AIAgentDecreaseInFRT.firstResponseTime',
}

export enum AIAgentDecreaseInFRTFilterMember {
    PeriodStart = 'AIAgentDecreaseInFRT.periodStart',
    PeriodEnd = 'AIAgentDecreaseInFRT.periodEnd',
}

export type AIAgentDecreaseInFRTCube = Cube<
    never,
    AIAgentDecreaseInFRTDimension,
    never,
    AIAgentDecreaseInFRTFilterMember
>
