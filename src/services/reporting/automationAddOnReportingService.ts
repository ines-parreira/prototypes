import moment from 'moment/moment'
import {getLabel} from 'pages/stats/AutomationAddonOverview'
import {TimeSeriesDataItem} from 'hooks/reporting/useTimeSeries'
import {
    CURRENT_PERIOD_LABEL,
    DATE_TIME_FORMAT,
    EMPTY_LABEL,
    NOT_AVAILABLE_LABEL,
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

export interface Period {
    end_datetime: string
    start_datetime: string
}

interface Fetching<T> {
    isFetching: boolean
    data?: T
}

export interface AutomationAddonReportData {
    automationRateTimeSeries: Fetching<TimeSeriesDataItem[][]>
    automatedInteractionTimeSeries: Fetching<TimeSeriesDataItem[][]>
    automatedInteractionByEventTypesTimeSeries: Fetching<TimeSeriesDataItem[][]>
    firstResponseTimeTrend: MetricTrend
    resolutionTimeTrend: MetricTrend
    automationRateTrend: MetricTrend
    automatedInterationTrend: MetricTrend
}

export const saveReport = async (
    data: AutomationAddonReportData,
    period: Period
) => {
    const {
        automationRateTimeSeries,
        automatedInteractionTimeSeries,
        automatedInteractionByEventTypesTimeSeries,
        firstResponseTimeTrend,
        resolutionTimeTrend,
        automationRateTrend,
        automatedInterationTrend,
    } = data

    const round = (value?: number | null) =>
        value ? Math.round(value) : NOT_AVAILABLE_LABEL
    const ifNullNa = (value?: number | null) => value || NOT_AVAILABLE_LABEL

    const impactData = () => [
        [EMPTY_LABEL, CURRENT_PERIOD_LABEL, PREVIOUS_PERIOD_LABEL],
        [
            AUTOMATION_RATE_LABEL,
            ifNullNa(automationRateTrend.data?.value),
            ifNullNa(automationRateTrend.data?.prevValue),
        ],
        [
            AUTOMATED_INTERACTIONS_LABEL,
            ifNullNa(automatedInterationTrend.data?.value),
            ifNullNa(automatedInterationTrend.data?.prevValue),
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
        automatedInteractionByEventTypesTimeSeries.data?.map((item) =>
            getLabel(item[0].label)
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
            [`${periodPrefix}-aao-impact-${export_datetime}.csv`]: createCsv(
                impactData()
            ),

            [`${periodPrefix}-aao-performance-${export_datetime}.csv`]:
                createCsv(performanceData),
            [`${periodPrefix}-aao-performance-feature-${export_datetime}.csv`]:
                createCsv(performanceFeatureData),
        },
        `${periodPrefix}-overview-metrics-${export_datetime}`
    )
}
