import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
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
    metricName: METRIC_NAMES.AUTOMATE_WORKFLOW_DATASET_COUNT,
    measures: [WorkflowDatasetMeasure.CountEvents],
    dimensions: [WorkflowDatasetDimension.EventType],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})

export const workflowDatasetStepQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string,
) => ({
    metricName: METRIC_NAMES.AUTOMATE_WORKFLOW_DATASET_STEP,
    measures: [WorkflowDatasetMeasure.FlowStepDropoff],
    dimensions: [WorkflowDatasetDimension.FlowStepId],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})

export const workflowDatasetStepCountQueryFactory = (
    filters: WorkflowStatsFilters,
    timezone: string,
) => ({
    metricName: METRIC_NAMES.AUTOMATE_WORKFLOW_DATASET_STEP_COUNT,
    measures: [WorkflowDatasetMeasure.CountEvents],
    dimensions: [
        WorkflowDatasetDimension.EventType,
        WorkflowDatasetDimension.FlowStepId,
    ],
    timezone,
    filters: [...workflowDatasetDefaultFilters(filters)],
})
