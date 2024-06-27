import {WorkflowStatsFilters} from 'models/stat/types'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {
    workflowDatasetCountQueryFactory,
    workflowDatasetStepCountQueryFactory,
    workflowDatasetStepQueryFactory,
} from 'models/reporting/queryFactories/workflows/metrics'
import {getPreviousPeriod} from 'utils/reporting'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {WorkflowTrendMetrics} from 'hooks/reporting/automate/types'
import {
    WorkflowStepMetricsMap,
    computeWorkflowMetrics,
    computeWorkflowStepsMetrics,
} from 'hooks/reporting/automate/utils'

export const useWorkflowDatasetTrend = (
    filters: WorkflowStatsFilters,
    timezone: string
): Record<WorkflowTrendMetrics, MetricTrend> => {
    const workflowCountByEventType = useMetricPerDimension(
        workflowDatasetCountQueryFactory(filters, timezone)
    )
    const previousWorkflowCountByEventType = useMetricPerDimension(
        workflowDatasetCountQueryFactory(
            {...filters, period: getPreviousPeriod(filters.period)},
            timezone
        )
    )

    const workflowMetrics = computeWorkflowMetrics(
        workflowCountByEventType.data?.allData
    )
    const previousWorkflowMetrics = computeWorkflowMetrics(
        previousWorkflowCountByEventType.data?.allData
    )

    const isFetching =
        workflowCountByEventType.isFetching ||
        previousWorkflowCountByEventType.isFetching
    const isError =
        workflowCountByEventType.isError ||
        previousWorkflowCountByEventType.isError

    return {
        workflowTotalViews: {
            isError,
            isFetching,
            data: {value: workflowMetrics.workflowStarted, prevValue: null},
        },
        workflowAutomatedInteractions: {
            isError,
            isFetching,
            data: {
                value: workflowMetrics.automatedInteractions,
                prevValue: null,
            },
        },
        workflowAutomationRate: {
            isError,
            isFetching,
            data: {
                value: workflowMetrics.automationRate,
                prevValue: previousWorkflowMetrics.automationRate,
            },
        },
        workflowDropoff: {
            isError,
            isFetching,
            data: {
                value: workflowMetrics.dropoff,
                prevValue: null,
            },
        },
        workflowTicketCreated: {
            isError,
            isFetching,
            data: {
                value: workflowMetrics.ticketsCreated,
                prevValue: null,
            },
        },
    }
}

export const useWorkflowStepDatasetTrend = (
    filters: WorkflowStatsFilters,
    timezone: string
): WorkflowStepMetricsMap => {
    const workflowStepCountEvents = useMetricPerDimension(
        workflowDatasetStepCountQueryFactory(filters, timezone)
    )
    const workflowStepDropoff = useMetricPerDimension(
        workflowDatasetStepQueryFactory(filters, timezone)
    )

    const workflowStepMetrics = computeWorkflowStepsMetrics(
        workflowStepCountEvents.data?.allData,
        workflowStepDropoff.data?.allData
    )

    return workflowStepMetrics
}
