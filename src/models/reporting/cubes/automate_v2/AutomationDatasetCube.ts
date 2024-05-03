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
}

export enum AutomationDatasetFilterMember {
    AccountId = 'AutomationDataset.accountId',
    AutomatedInteractions = 'AutomationDataset.automatedInteractions',
    EventType = 'AutomationDataset.eventType',
    Channel = 'AutomationDataset.channel',
    PeriodStart = 'AutomationDataset.periodStart',
    PeriodEnd = 'AutomationDataset.periodEnd',
}
export enum AutomationDatasetSegment {}

export type AutomationDatasetCube = Cube<
    AutomationDatasetMeasure,
    AutomationDatasetDimension,
    AutomationDatasetSegment,
    AutomationDatasetFilterMember
>
