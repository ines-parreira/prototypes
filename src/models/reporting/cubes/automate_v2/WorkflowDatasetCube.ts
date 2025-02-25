import { Cube } from 'models/reporting/types'

export enum WorkflowDatasetMeasure {
    CountEvents = 'WorkflowDataset.countEvents',
    FlowStepDropoff = 'WorkflowDataset.flowStepDropoff',
}

export enum WorkflowDatasetDimension {
    EventType = 'WorkflowDataset.eventType',
    FlowStepId = 'WorkflowDataset.flowStepId',
}

export enum WorkflowDatasetFilterMember {
    AccountId = 'WorkflowDataset.accountId',
    AutomatedInteractions = 'WorkflowDataset.automatedInteractions',
    EventType = 'WorkflowDataset.eventType',
    PeriodStart = 'WorkflowDataset.periodStart',
    PeriodEnd = 'WorkflowDataset.periodEnd',
    FlowId = 'WorkflowDataset.flowId',
}
export enum WorkflowDatasetSegment {}

export type WorkflowDatasetCube = Cube<
    WorkflowDatasetMeasure,
    WorkflowDatasetDimension,
    WorkflowDatasetFilterMember,
    WorkflowDatasetSegment
>
