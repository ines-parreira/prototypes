import type { Cube } from 'domains/reporting/models/types'

export enum SuccessRateDimension {
    TicketId = 'SuccessRate.ticketId',
}

export enum SuccessRateFilterMember {
    AiAgentRole = 'SuccessRate.aiAgentRole',
    StoreIntegrationId = 'SuccessRate.storeIntegrationId',
    PeriodStart = 'SuccessRate.periodStart',
    PeriodEnd = 'SuccessRate.periodEnd',
    Channel = 'SuccessRate.channel',
}

export type SuccessRateCube = Cube<
    never,
    SuccessRateDimension,
    never,
    SuccessRateFilterMember
>
