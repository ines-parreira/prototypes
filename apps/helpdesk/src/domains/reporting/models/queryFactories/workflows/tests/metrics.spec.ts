import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    WorkflowDatasetDimension,
    WorkflowDatasetFilterMember,
    WorkflowDatasetMeasure,
} from 'domains/reporting/models/cubes/automate_v2/WorkflowDatasetCube'
import {
    workflowDatasetCountQueryFactory,
    workflowDatasetStepCountQueryFactory,
    workflowDatasetStepQueryFactory,
} from 'domains/reporting/models/queryFactories/workflows/metrics'

describe('Workflow metrics', () => {
    const timezone = 'UTC'
    const filters = {
        period: {
            start_datetime: '2021-01-01T00:00:00Z',
            end_datetime: '2021-01-02T00:00:00Z',
        },
        workflowId: '1',
    }

    describe('workflowDatasetCountQueryFactory', () => {
        it('should count events by workflow id and group by event type', () => {
            expect(workflowDatasetCountQueryFactory(filters, timezone)).toEqual(
                {
                    metricName: METRIC_NAMES.AUTOMATE_WORKFLOW_DATASET_COUNT,
                    dimensions: [WorkflowDatasetDimension.EventType],
                    filters: [
                        {
                            member: WorkflowDatasetFilterMember.PeriodStart,
                            operator: 'afterDate',
                            values: ['2021-01-01T00:00:00.000'],
                        },
                        {
                            member: WorkflowDatasetFilterMember.PeriodEnd,
                            operator: 'beforeDate',
                            values: ['2021-01-02T00:00:00.000'],
                        },
                        {
                            member: WorkflowDatasetFilterMember.FlowId,
                            operator: 'equals',
                            values: ['1'],
                        },
                    ],
                    measures: [WorkflowDatasetMeasure.CountEvents],
                    timezone: 'UTC',
                },
            )
        })
    })

    describe('workflowDatasetStepQueryFactory', () => {
        it('should get dropoff for each step by workflow id', () => {
            expect(workflowDatasetStepQueryFactory(filters, timezone)).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_WORKFLOW_DATASET_STEP,
                dimensions: [WorkflowDatasetDimension.FlowStepId],
                filters: [
                    {
                        member: WorkflowDatasetFilterMember.PeriodStart,
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: WorkflowDatasetFilterMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: WorkflowDatasetFilterMember.FlowId,
                        operator: 'equals',
                        values: ['1'],
                    },
                ],
                measures: [WorkflowDatasetMeasure.FlowStepDropoff],
                timezone: 'UTC',
            })
        })
    })

    describe('workflowDatasetStepCountQueryFactory', () => {
        it('should count events by workflow id and group by event type and step id', () => {
            expect(
                workflowDatasetStepCountQueryFactory(filters, timezone),
            ).toEqual({
                metricName: METRIC_NAMES.AUTOMATE_WORKFLOW_DATASET_STEP_COUNT,
                dimensions: [
                    WorkflowDatasetDimension.EventType,
                    WorkflowDatasetDimension.FlowStepId,
                ],
                filters: [
                    {
                        member: WorkflowDatasetFilterMember.PeriodStart,
                        operator: 'afterDate',
                        values: ['2021-01-01T00:00:00.000'],
                    },
                    {
                        member: WorkflowDatasetFilterMember.PeriodEnd,
                        operator: 'beforeDate',
                        values: ['2021-01-02T00:00:00.000'],
                    },
                    {
                        member: WorkflowDatasetFilterMember.FlowId,
                        operator: 'equals',
                        values: ['1'],
                    },
                ],
                measures: [WorkflowDatasetMeasure.CountEvents],
                timezone: 'UTC',
            })
        })
    })
})
