import { Cube } from 'models/reporting/types'

export enum AIAgentInteractionsBySkillDatasetDimension {
    BillableType = 'AIAgentAutomatedInteractions.billableType',
    AutomationEventCreatedDatetime = 'AIAgentAutomatedInteractions.automationEventCreatedDatetime',
}

export enum AIAgentInteractionsBySkillMeasure {
    Count = 'AIAgentAutomatedInteractions.count',
}

export enum AIAgentInteractionsBySkillFilterMember {
    AccountId = 'AIAgentAutomatedInteractions.accountId',
    PeriodStart = 'AIAgentAutomatedInteractions.periodStart',
    PeriodEnd = 'AIAgentAutomatedInteractions.periodEnd',
}

export enum AIAgentSkills {
    AIAgentSupport = 'ai-agent-support',
    AIAgentSales = 'ai-agent-sales',
}

export enum AIAgentInteractionsBySkillDatasetSegment {}

export type AIAgentAutomatedInteractionsCube = Cube<
    AIAgentInteractionsBySkillMeasure,
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentInteractionsBySkillDatasetSegment,
    AIAgentInteractionsBySkillFilterMember
>
