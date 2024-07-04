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
import {getWorkflowAnalyticsPreviousDateRange} from 'pages/automate/workflows/analytics/visualBuilder/utils'
import {calculateSumOfDropoff} from './automateStatsFormulae'

export const useWorkflowDataset = (
    filters: WorkflowStatsFilters,
    timezone: string,
    steps: WorkflowStep[],
    flowUpdateDatetime: string
): WorkflowStats => {
    const previousPeriod = getPreviousPeriod(filters.period)
    const adjustedPreviousPeriod =
        getWorkflowAnalyticsPreviousDateRange({
            startDatetime: previousPeriod.start_datetime,
            endDatetime: previousPeriod.end_datetime,
            flowUpdateDatetime,
        }) ?? filters.period

    const workflowCountByEventType = useMetricPerDimension(
        workflowDatasetCountQueryFactory(filters, timezone)
    )
    const previousWorkflowCountByEventType = useMetricPerDimension(
        workflowDatasetCountQueryFactory(
            {...filters, period: adjustedPreviousPeriod},
            timezone
        )
    )

    const workflowStepMetrics = useWorkflowStepDatasetTrend(
        filters,
        timezone,
        steps
    )

    const previousWorkflowStepMetrics = useWorkflowStepDatasetTrend(
        {...filters, period: adjustedPreviousPeriod},
        timezone,
        steps
    )

    const workflowMetrics = computeWorkflowMetrics(
        workflowCountByEventType.data?.allData,
        calculateSumOfDropoff(workflowStepMetrics.data)
    )

    const previousWorkflowMetrics = computeWorkflowMetrics(
        previousWorkflowCountByEventType.data?.allData,
        calculateSumOfDropoff(previousWorkflowStepMetrics.data)
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
        previousPeriod: adjustedPreviousPeriod,
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
