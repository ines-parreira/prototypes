import {WorkflowStatsFilters} from 'models/stat/types'

import {
    workflowDatasetCountQueryFactory,
    workflowDatasetStepCountQueryFactory,
    workflowDatasetStepQueryFactory,
} from 'models/reporting/queryFactories/workflows/metrics'
import {getPreviousPeriod} from 'utils/reporting'
import {useMetricPerDimension} from 'hooks/reporting/useMetricPerDimension'
import {
    WorkflowStats,
    WorkflowStepMetricsMap,
    computeWorkflowMetrics,
    computeWorkflowStepsMetrics,
} from 'hooks/reporting/automate/utils'
import {WorkflowStep} from 'pages/automate/workflows/models/workflowConfiguration.types'
import {
    calculateSumOfAutomatedInteractions,
    calculateSumOfDropoff,
} from './automateStatsFormulae'

export const useWorkflowDataset = (
    filters: WorkflowStatsFilters,
    timezone: string,
    steps: WorkflowStep[]
): WorkflowStats => {
    const previousPeriod = getPreviousPeriod(filters.period)
    const workflowCountByEventType = useMetricPerDimension(
        workflowDatasetCountQueryFactory(filters, timezone)
    )
    const previousWorkflowCountByEventType = useMetricPerDimension(
        workflowDatasetCountQueryFactory(
            {...filters, period: previousPeriod},
            timezone
        )
    )

    const workflowStepMetrics = useWorkflowStepDatasetTrend(
        filters,
        timezone,
        steps
    )

    const previousWorkflowStepMetrics = useWorkflowStepDatasetTrend(
        {...filters, period: previousPeriod},
        timezone,
        steps
    )

    const workflowMetrics = computeWorkflowMetrics(
        workflowCountByEventType.data?.allData,
        calculateSumOfDropoff(workflowStepMetrics.data),
        calculateSumOfAutomatedInteractions(workflowStepMetrics.data)
    )

    const previousWorkflowMetrics = computeWorkflowMetrics(
        previousWorkflowCountByEventType.data?.allData,
        calculateSumOfDropoff(previousWorkflowStepMetrics.data),
        calculateSumOfAutomatedInteractions(previousWorkflowStepMetrics.data)
    )

    const isFetching =
        workflowCountByEventType.isFetching ||
        previousWorkflowCountByEventType.isFetching ||
        workflowStepMetrics.isFetching ||
        previousWorkflowStepMetrics.isFetching

    const isError =
        workflowCountByEventType.isError ||
        previousWorkflowCountByEventType.isError ||
        workflowStepMetrics.isError ||
        previousWorkflowStepMetrics.isError

    return {
        workflowMetrics: {
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
        },
        workflowStepMetrics: workflowStepMetrics.data,
        previousPeriod,
        isFetching,
        isError,
    }
}

export const useWorkflowStepDatasetTrend = (
    filters: WorkflowStatsFilters,
    timezone: string,
    steps: WorkflowStep[]
): {
    data: WorkflowStepMetricsMap
    isFetching: boolean
    isError: boolean
} => {
    const workflowStepCountEvents = useMetricPerDimension(
        workflowDatasetStepCountQueryFactory(filters, timezone)
    )
    const workflowStepDropoff = useMetricPerDimension(
        workflowDatasetStepQueryFactory(filters, timezone)
    )

    const workflowStepMetrics = computeWorkflowStepsMetrics(
        workflowStepCountEvents.data?.allData,
        workflowStepDropoff.data?.allData,
        steps
    )

    const isFetching =
        workflowStepCountEvents.isFetching || workflowStepDropoff.isFetching
    const isError =
        workflowStepCountEvents.isError || workflowStepDropoff.isError

    return {
        data: workflowStepMetrics,
        isFetching,
        isError,
    }
}
