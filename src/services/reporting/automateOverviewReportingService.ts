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
    OVERALL_TIME_SAVED_BY_YOUR_TEAM,
    TIME_SAVED_ON_FIRST_RESPONSE,
} from 'pages/stats/self-service/constants'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {FEATURE_LABELS} from 'pages/stats/constants'
import {AutomatedInteractionByFeatures} from 'pages/stats/types'

export interface Period {
    end_datetime: string
    start_datetime: string
}

interface Fetching<T> {
    isFetching: boolean
    data?: T
}

export interface AutomateReportData {
    automationRateTimeSeries: Fetching<TimeSeriesDataItem[][]>
    automatedInteractionTimeSeries: Fetching<TimeSeriesDataItem[][]>
    automatedInteractionByEventTypesTimeSeries: Fetching<TimeSeriesDataItem[][]>
    firstResponseTimeTrend: MetricTrend
    resolutionTimeTrend: MetricTrend
    automationRateTrend: MetricTrend
    automatedInteractionTrend: MetricTrend
}

export const saveReport = async (data: AutomateReportData, period: Period) => {
    const {
        automationRateTimeSeries,
        automatedInteractionTimeSeries,
        automatedInteractionByEventTypesTimeSeries,
        firstResponseTimeTrend,
        resolutionTimeTrend,
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
            TIME_SAVED_ON_FIRST_RESPONSE,
            round(firstResponseTimeTrend.data?.value),
            round(firstResponseTimeTrend.data?.prevValue),
        ],
        [
            OVERALL_TIME_SAVED_BY_YOUR_TEAM,
            round(resolutionTimeTrend.data?.value),
            round(resolutionTimeTrend.data?.prevValue),
        ],
    ]

    const performanceData = [
        [EMPTY_LABEL, AUTOMATED_INTERACTIONS_LABEL, AUTOMATION_RATE_LABEL],
        ...(automatedInteractionTimeSeries.data?.[0].map((date) => [
            date.dateTime,
            ifNullNa(
                automatedInteractionTimeSeries.data?.[0].find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
            ifNullNa(
                automationRateTimeSeries.data?.[0].find(
                    ({dateTime}) => date.dateTime === dateTime
                )?.value
            ),
        ]) || []),
    ]

    const labels =
        automatedInteractionByEventTypesTimeSeries.data?.map(
            (item) =>
                FEATURE_LABELS[item[0].label as AutomatedInteractionByFeatures]
        ) || []
    const performanceFeatureData = [
        [EMPTY_LABEL, ...labels],
        ...(automatedInteractionByEventTypesTimeSeries.data?.[0].map((date) => [
            date.dateTime,
            ...(automatedInteractionByEventTypesTimeSeries.data?.map(
                (timeseries) =>
                    ifNullNa(
                        timeseries.find(
                            ({dateTime}) => date.dateTime === dateTime
                        )?.value
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
            [`${periodPrefix}-automate-impact-${export_datetime}.csv`]:
                createCsv(impactData()),

            [`${periodPrefix}-automate-performance-${export_datetime}.csv`]:
                createCsv(performanceData),
            [`${periodPrefix}-automate-performance-feature-${export_datetime}.csv`]:
                createCsv(performanceFeatureData),
        },
        `${periodPrefix}-overview-metrics-${export_datetime}`
    )
}
