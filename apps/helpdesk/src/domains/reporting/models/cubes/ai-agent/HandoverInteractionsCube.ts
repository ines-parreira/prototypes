import type { Cube } from 'domains/reporting/models/types'

export enum HandoverInteractionsDimension {
    TicketId = 'HandoverInteractions.ticketId',
}

export enum HandoverInteractionsFilterMember {
    PeriodStart = 'HandoverInteractions.periodStart',
    PeriodEnd = 'HandoverInteractions.periodEnd',
    AiAgentRole = 'HandoverInteractions.aiAgentRole',
    FeatureType = 'HandoverInteractions.featureType',
    Channel = 'HandoverInteractions.channel',
    StoreIntegrationId = 'HandoverInteractions.storeIntegrationId',
}

export type HandoverInteractionsCube = Cube<
    never,
    HandoverInteractionsDimension,
    never,
    HandoverInteractionsFilterMember
>
