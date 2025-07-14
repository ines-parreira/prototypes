import {
    WorkflowDatasetDimension,
    WorkflowDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/WorkflowDatasetCube'
import { workflowDatasetDefaultFilters } from 'domains/reporting/models/queryFactories/workflows/filters'
import { WorkflowStatsFilters } from 'domains/reporting/models/stat/types'

export const workflowDatasetCountQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string,
) => ({
    measures: [WorkflowDatasetMeasure.CountEvents],
    dimensions: [WorkflowDatasetDimension.EventType],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})

export const workflowDatasetStepQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string,
) => ({
    measures: [WorkflowDatasetMeasure.FlowStepDropoff],
    dimensions: [WorkflowDatasetDimension.FlowStepId],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})

export const workflowDatasetStepCountQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string,
) => ({
    measures: [WorkflowDatasetMeasure.CountEvents],
    dimensions: [
        WorkflowDatasetDimension.EventType,
        WorkflowDatasetDimension.FlowStepId,
    ],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})
