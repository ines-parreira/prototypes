import type { Cube } from 'domains/reporting/models/types'

export enum AIAgentDecreaseInResolutionTimeDimension {
    TicketId = 'AIAgentDecreaseInResolutionTime.ticketId',
    ResolutionTime = 'AIAgentDecreaseInResolutionTime.resolutionTime',
}

export enum AIAgentDecreaseInResolutionTimeFilterMember {
    AiAgentRole = 'AIAgentDecreaseInResolutionTime.aiAgentRole',
    PeriodStart = 'AIAgentDecreaseInResolutionTime.periodStart',
    PeriodEnd = 'AIAgentDecreaseInResolutionTime.periodEnd',
}

export type AIAgentDecreaseInResolutionTimeCube = Cube<
    never,
    AIAgentDecreaseInResolutionTimeDimension,
    never,
    AIAgentDecreaseInResolutionTimeFilterMember
>
