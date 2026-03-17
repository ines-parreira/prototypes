import type { Cube } from 'domains/reporting/models/types'

export enum SuccessRateDimension {
    TicketId = 'SuccessRate.ticketId',
}

export enum SuccessRateFilterMember {
    AiAgentSkill = 'SuccessRate.aiAgentSkill',
    StoreIntegrationId = 'SuccessRate.storeIntegrationId',
    PeriodStart = 'SuccessRate.periodStart',
    PeriodEnd = 'SuccessRate.periodEnd',
}

export type SuccessRateCube = Cube<
    never,
    SuccessRateDimension,
    never,
    SuccessRateFilterMember
>
