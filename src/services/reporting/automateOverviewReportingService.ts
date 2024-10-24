import moment from 'moment/moment'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {Period} from 'models/stat/types'

import {
    DECREASE_IN_FIRST_RESPONSE,
    DECREASE_IN_RESOLUTION_TIME,
} from 'pages/automate/automate-metrics/constants'
import {
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
} from 'pages/stats/self-service/constants'
import {AutomatedInteractionByFeatures} from 'pages/stats/types'
import {
    CURRENT_PERIOD_LABEL,
    DATE_TIME_FORMAT,
    EMPTY_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'services/reporting/constants'
import {createCsv, saveZippedFiles} from 'utils/file'

export const AUTOMATE_IMPACT_FILENAME = 'automate-impact'
export const AUTOMATE_PERFORMANCE_FILENAME = 'automate-performance'
export const AUTOMATE_PERFORMANCE_FEATURE_FILENAME =
    'automate-performance-feature'
export const OVERVIEW_METRICS_FILENAME = 'overview-metrics'

export interface AutomateReportData {
    automationRateTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionByEventTypesTimeSeries: TimeSeriesDataItem[][]
    firstResponseTimeTrend: MetricTrend
    decreaseInResolutionTimeWithAutomationTrend: MetricTrend
    automationRateTrend: MetricTrend
    automatedInteractionTrend: MetricTrend
}

const valueOrZero = (value?: number | null) => value || 0

export const getPerformanceFeatureData = (
    automateStatsMeasureLabelMap: Record<
        AutomatedInteractionByFeatures,
        string
    >,
    automatedInteractionByEventTypesTimeSeries: TimeSeriesDataItem[][]
) => {
    const labels =
        automatedInteractionByEventTypesTimeSeries?.map(
            (item) =>
                automateStatsMeasureLabelMap[
                    item[0].label as AutomatedInteractionByFeatures
                ]
        ) || []

    return [
        [EMPTY_LABEL, ...labels],
        ...(automatedInteractionByEventTypesTimeSeries?.[0]?.map((date) => [
            date.dateTime,
            ...(automatedInteractionByEventTypesTimeSeries?.map((timeseries) =>
                valueOrZero(
                    timeseries.find(({dateTime}) => date.dateTime === dateTime)
                        ?.value
                )
            ) || []),
        ]) || []),
    ]
}

export const saveReport = async (
    data: AutomateReportData,
    period: Period,
    automateStatsMeasureLabelMap: Record<AutomatedInteractionByFeatures, string>
) => {
    const {
        automationRateTimeSeries,
        automatedInteractionTimeSeries,
        automatedInteractionByEventTypesTimeSeries,
        firstResponseTimeTrend,
        decreaseInResolutionTimeWithAutomationTrend,
        automationRateTrend,
        automatedInteractionTrend,
    } = data

    const round = (value?: number | null) => (value ? Math.round(value) : 0)

    const impactData = () => [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            AUTOMATION_RATE_LABEL,
            valueOrZero(automationRateTrend.data?.value),
            valueOrZero(automationRateTrend.data?.prevValue),
        ],
        [
            AUTOMATED_INTERACTIONS_LABEL,
            valueOrZero(automatedInteractionTrend.data?.value),
            valueOrZero(automatedInteractionTrend.data?.prevValue),
        ],
        [
            DECREASE_IN_FIRST_RESPONSE,
            round(firstResponseTimeTrend.data?.value),
            round(firstResponseTimeTrend.data?.prevValue),
        ],
        [
            DECREASE_IN_RESOLUTION_TIME,
            round(decreaseInResolutionTimeWithAutomationTrend.data?.value),
            round(decreaseInResolutionTimeWithAutomationTrend.data?.prevValue),
        ],
    ]

    const performanceData = [
        [EMPTY_LABEL, AUTOMATED_INTERACTIONS_LABEL, AUTOMATION_RATE_LABEL],
        ...(automatedInteractionTimeSeries?.[0]?.map((date) => [
            date.dateTime,
            valueOrZero(
                automatedInteractionTimeSeries?.[0]?.find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
            valueOrZero(
                automationRateTimeSeries?.[0]?.find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
        ]) || []),
    ]

    const performanceFeatureData = getPerformanceFeatureData(
        automateStatsMeasureLabelMap,
        automatedInteractionByEventTypesTimeSeries
    )

    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const periodPrefix = `${startDate}_${endDate}`

    return saveZippedFiles(
        {
            [`${periodPrefix}-${AUTOMATE_IMPACT_FILENAME}-${export_datetime}.csv`]:
                createCsv(impactData()),

            [`${periodPrefix}-${AUTOMATE_PERFORMANCE_FILENAME}-${export_datetime}.csv`]:
                createCsv(performanceData),
            [`${periodPrefix}-${AUTOMATE_PERFORMANCE_FEATURE_FILENAME}-${export_datetime}.csv`]:
                createCsv(performanceFeatureData),
        },
        `${periodPrefix}-${OVERVIEW_METRICS_FILENAME}-${export_datetime}`
    )
}
