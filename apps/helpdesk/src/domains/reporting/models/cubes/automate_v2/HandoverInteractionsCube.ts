import type { Cube } from 'domains/reporting/models/types'

export enum HandoverInteractionsDimension {
    TicketId = 'HandoverInteractions.ticketId',
}

export enum HandoverInteractionsFilterMember {
    PeriodStart = 'HandoverInteractions.periodStart',
    PeriodEnd = 'HandoverInteractions.periodEnd',
    AiAgentSkill = 'HandoverInteractions.aiAgentSkill',
    FeatureType = 'HandoverInteractions.featureType',
}

export type HandoverInteractionsCube = Cube<
    never,
    HandoverInteractionsDimension,
    never,
    HandoverInteractionsFilterMember
>
