import moment from 'moment/moment'

import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {
    CURRENT_PERIOD_LABEL,
    DATE_TIME_FORMAT,
    EMPTY_LABEL,
    PREVIOUS_PERIOD_LABEL,
} from 'services/reporting/constants'
import {createCsv, saveZippedFiles} from 'utils/file'
import {
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
} from 'pages/stats/self-service/constants'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'

import {AutomatedInteractionByFeatures} from 'pages/stats/types'
import {
    DECREASE_IN_FIRST_RESPONSE,
    DECREASE_IN_RESOLUTION_TIME,
} from 'pages/automate/automate-metrics/constants'
import {AUTOMATE_STATS_MEASUR_LABEL_MAP} from 'hooks/reporting/automate/utils'

export const AUTOMATE_IMPACT_FILENAME = 'automate-impact'
export const AUTOMATE_PERFORMANCE_FILENAME = 'automate-performance'
export const AUTOMATE_PERFORMANCE_FEATURE_FILENAME =
    'automate-performance-feature'
export const OVERVIEW_METRICS_FILENAME = 'overview-metrics'

export interface Period {
    end_datetime: string
    start_datetime: string
}

export interface AutomateReportData {
    automationRateTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionTimeSeries: TimeSeriesDataItem[][]
    automatedInteractionByEventTypesTimeSeries: TimeSeriesDataItem[][]
    firstResponseTimeTrend: MetricTrend
    decreaseInResolutionTimeWithAutomationTrend: MetricTrend
    automationRateTrend: MetricTrend
    automatedInteractionTrend: MetricTrend
}

export const saveReport = async (data: AutomateReportData, period: Period) => {
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
    const ifNullNa = (value?: number | null) => value || 0

    const impactData = () => [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            AUTOMATION_RATE_LABEL,
            ifNullNa(automationRateTrend.data?.value),
            ifNullNa(automationRateTrend.data?.prevValue),
        ],
        [
            AUTOMATED_INTERACTIONS_LABEL,
            ifNullNa(automatedInteractionTrend.data?.value),
            ifNullNa(automatedInteractionTrend.data?.prevValue),
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
            ifNullNa(
                automatedInteractionTimeSeries?.[0]?.find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
            ifNullNa(
                automationRateTimeSeries?.[0]?.find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
        ]) || []),
    ]

    const labels =
        automatedInteractionByEventTypesTimeSeries?.map(
            (item) =>
                AUTOMATE_STATS_MEASUR_LABEL_MAP[
                    item[0].label as AutomatedInteractionByFeatures
                ]
        ) || []
    const performanceFeatureData = [
        [EMPTY_LABEL, ...labels],
        ...(automatedInteractionByEventTypesTimeSeries?.[0]?.map((date) => [
            date.dateTime,
            ...(automatedInteractionByEventTypesTimeSeries?.map((timeseries) =>
                ifNullNa(
                    timeseries.find(({dateTime}) => date.dateTime === dateTime)
                        ?.value
                )
            ) || []),
        ]) || []),
    ]
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
