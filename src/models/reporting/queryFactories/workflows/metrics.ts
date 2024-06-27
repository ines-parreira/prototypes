import {WorkflowStatsFilters} from 'models/stat/types'
import {
    WorkflowDatasetDimension,
    WorkflowDatasetMeasure,
} from 'models/reporting/cubes/automate_v2/WorkflowDatasetCube'
import {workflowDatasetDefaultFilters} from 'models/reporting/queryFactories/workflows/filters'

export const workflowDatasetCountQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string
) => ({
    measures: [WorkflowDatasetMeasure.CountEvents],
    dimensions: [WorkflowDatasetDimension.EventType],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})

export const workflowDatasetStepQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string
) => ({
    measures: [WorkflowDatasetMeasure.FlowStepDropoff],
    dimensions: [WorkflowDatasetDimension.FlowStepId],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})

export const workflowDatasetStepCountQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string
) => ({
    measures: [WorkflowDatasetMeasure.CountEvents],
    dimensions: [
        WorkflowDatasetDimension.EventType,
        WorkflowDatasetDimension.FlowStepId,
    ],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})
