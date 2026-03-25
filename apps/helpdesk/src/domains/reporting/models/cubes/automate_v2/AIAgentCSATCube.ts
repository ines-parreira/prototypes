import type { Cube } from 'domains/reporting/models/types'

export enum AIAgentCSATDimension {
    TicketId = 'AIAgentCSAT.ticketId',
    SurveyScore = 'AIAgentCSAT.surveyScore',
}

export enum AIAgentCSATFilterMember {
    PeriodStart = 'AIAgentCSAT.periodStart',
    PeriodEnd = 'AIAgentCSAT.periodEnd',
    AiAgentRole = 'AIAgentCSAT.aiAgentRole',
}

export type AIAgentCSATCube = Cube<
    never,
    AIAgentCSATDimension,
    never,
    AIAgentCSATFilterMember
>
