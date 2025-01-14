import {Cube} from 'models/reporting/types'

export enum AutomationDatasetMeasure {
    AutomatedInteractions = 'AutomationDataset.automatedInteractions',
    AutomatedInteractionsByAutoResponders = 'AutomationDataset.automatedInteractionsByAutoResponders',
}

export enum AutomationDatasetDimension {
    AccountId = 'AutomationDataset.accountId',
    EventType = 'AutomationDataset.eventType',
    Channel = 'AutomationDataset.channel',
    AutomationEventCreatedDatetime = 'AutomationDataset.automationEventCreatedDatetime',
    TicketId = 'AutomationDataset.ticketId',
}

export enum AutomationDatasetFilterMember {
    AccountId = 'AutomationDataset.accountId',
    AutomatedInteractions = 'AutomationDataset.automatedInteractions',
    EventType = 'AutomationDataset.eventType',
    Channel = 'AutomationDataset.channel',
    PeriodStart = 'AutomationDataset.periodStart',
    PeriodEnd = 'AutomationDataset.periodEnd',
    TicketId = 'AutomationDataset.ticketId',
}
export enum AutomationDatasetSegment {}

export enum AutomatedDatesetEventTypes {
    AiAgentRecommendedResource = 'ai-agent-recommended-resource',
}

export type AutomationDatasetCube = Cube<
    AutomationDatasetMeasure,
    AutomationDatasetDimension,
    AutomationDatasetSegment,
    AutomationDatasetFilterMember
>
