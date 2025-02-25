import { flatMap, uniq } from 'lodash'
import moment from 'moment-timezone'

import {
    WorkflowStepMetrics,
    WorkflowStepMetricsMap,
} from 'hooks/reporting/automate/utils'
import { Period } from 'models/stat/types'
import { toPercentage } from 'pages/automate/automate-metrics/utils'
import { last7DaysStatsFilters } from 'pages/automate/common/utils/last7DaysStatsFilters'

interface WorkflowAnalyticsDateRangeProps {
    startDatetime: string | null
    endDatetime: string | null
    flowUpdateDatetime: string
}

export const shouldDisplayTooltip = (
    value: number | null | undefined,
    shouldDisplayZero: boolean,
) => {
    return shouldDisplayZero || isValidNumber(value)
}

export const isValidNumber = (value: number | null | undefined) => {
    return value !== 0 && value != null && !isNaN(value)
}

export const displayMetric = (
    value: number | null | undefined,
    shouldDisplayZero: boolean,
) => (isValidNumber(value) ? value : shouldDisplayZero ? '0' : '-')

export const displayPercentMetric = (
    value: number | null | undefined,
    shouldDisplayZero: boolean,
) =>
    isValidNumber(value) ? toPercentage(value!) : shouldDisplayZero ? '0%' : '-'

export const extractUniqueRates = (data: WorkflowStepMetricsMap): number[] => {
    const rates = flatMap(data, (step: WorkflowStepMetrics) => [
        step.dropoffRate,
    ])

    return uniq(rates)
}

const preprocessDateString = (dateString: string) => {
    return dateString.replace(' ', '+')
}

export const getWorkflowAnalyticsDateRange = (
    params: WorkflowAnalyticsDateRangeProps,
): Period => {
    const { flowUpdateDatetime } = params
    let { startDatetime, endDatetime } = params
    const last7DaysPeriod = last7DaysStatsFilters().period

    if (!startDatetime || !endDatetime) {
        startDatetime = last7DaysPeriod.start_datetime
        endDatetime = last7DaysPeriod.end_datetime
    }

    const flowUpdateDate = moment(preprocessDateString(flowUpdateDatetime))
    const startDate = moment(preprocessDateString(startDatetime))
    const endDate = moment(preprocessDateString(endDatetime))

    const period = {
        start_datetime: startDate.format(),
        end_datetime: endDate.format(),
    }

    if (flowUpdateDate.isAfter(startDate) && flowUpdateDate.isBefore(endDate)) {
        period.start_datetime = flowUpdateDate.format()
    } else if (flowUpdateDate.isAfter(endDate)) {
        period.start_datetime = flowUpdateDate.format()
        period.end_datetime = last7DaysPeriod.end_datetime
    }

    return period
}

export const getWorkflowAnalyticsPreviousDateRange = (
    params: WorkflowAnalyticsDateRangeProps,
): Period | null => {
    const { flowUpdateDatetime, startDatetime, endDatetime } = params

    const flowUpdateDate = moment(preprocessDateString(flowUpdateDatetime))
    const startDate = moment(preprocessDateString(startDatetime!))
    const endDate = moment(preprocessDateString(endDatetime!))

    const period = {
        start_datetime: startDate.format(),
        end_datetime: endDate.format(),
    }

    if (flowUpdateDate.isAfter(startDate) && flowUpdateDate.isBefore(endDate)) {
        period.start_datetime = flowUpdateDate.format()
    } else if (flowUpdateDate.isAfter(endDate)) {
        return null
    }

    return period
}

export const getViewerLabel = (dropoff: number) =>
    `${dropoff} viewer${dropoff === 1 ? '' : 's'}`
