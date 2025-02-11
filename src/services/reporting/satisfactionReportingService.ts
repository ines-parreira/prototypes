import moment from 'moment/moment'

import {useTables} from 'hooks/reporting/common/useTableReportData'
import {useSatisfactionMetrics} from 'hooks/reporting/quality-management/satisfaction/useSatisfactionMetrics'
import {fetchSurveyScores} from 'hooks/reporting/quality-management/satisfaction/useSurveyScores'
import {getCsvFileNameWithDates} from 'hooks/reporting/support-performance/overview/useDownloadOverviewData'
import {useNewStatsFilters} from 'hooks/reporting/support-performance/useNewStatsFilters'
import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'

import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {TicketMessagesDimension} from 'models/reporting/cubes/TicketMessagesCube'
import {Period, StatsFilters} from 'models/stat/types'

import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {formatSurveyScores} from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {SatisfactionMetric} from 'state/ui/stats/types'
import {createCsv} from 'utils/file'
import {getPreviousPeriod} from 'utils/reporting'

export interface SatisfactionReportData {
    satisfactionScoreTrend: MetricTrend
    responseRateTrend: MetricTrend
    surveysSentTrend: MetricTrend
    averageScoreTrend: MetricTrend
    surveyScores: MetricWithDecile
}

const tables = [
    SatisfactionMetric.AverageCSATPerAssignee,
    SatisfactionMetric.AverageCSATPerChannel,
    SatisfactionMetric.AverageCSATPerIntegration,
] as const
export const tablesReportSource = tables.map((metric) => ({
    ...SatisfactionMetricConfig[metric],
    dimension:
        metric === SatisfactionMetric.AverageCSATPerAssignee
            ? TicketDimension.AssigneeUserId
            : metric === SatisfactionMetric.AverageCSATPerChannel
              ? TicketDimension.Channel
              : TicketMessagesDimension.Integration,
    metric,
}))

export const SATISFACTION_TRENDS_METRICS_FILE_NAME =
    'satisfaction-trends-metrics'
export const SATISFACTION_METRICS_FILE_NAME = 'satisfaction-metrics'
export const SATISFACTION_AVERAGE_CSAT_OVER_TIME = '{metric}-over-time'

const formatTrendMetric = (column: SatisfactionMetric, value?: number | null) =>
    formatMetricValue(
        value,
        SatisfactionMetricConfig[column].metricFormat,
        NOT_AVAILABLE_PLACEHOLDER
    )

const getHeaders = (period: Period) => {
    const previousPeriod = getPreviousPeriod(period)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT
    )

    return [
        'Metric',
        `${startDate} - ${endDate}`,
        `${previousStartDate} - ${previousEndDate}`,
    ]
}

export const saveReport = (data: SatisfactionReportData, period: Period) => {
    const formattedSurveyScores = formatSurveyScores(
        data.surveyScores,
        '- star count'
    ).map(({value, label}) => [label, value])

    const headers = getHeaders(period)

    const trendData = [
        headers,
        [
            SatisfactionMetricConfig[SatisfactionMetric.AverageSurveyScore]
                .title,
            formatTrendMetric(
                SatisfactionMetric.AverageSurveyScore,
                data.averageScoreTrend.data?.value
            ),
            formatTrendMetric(
                SatisfactionMetric.AverageSurveyScore,
                data.averageScoreTrend.data?.prevValue
            ),
        ],
        ...formattedSurveyScores,
        [
            SatisfactionMetricConfig[SatisfactionMetric.SatisfactionScore]
                .title,
            formatTrendMetric(
                SatisfactionMetric.SatisfactionScore,
                data.satisfactionScoreTrend.data?.value
            ),
            formatTrendMetric(
                SatisfactionMetric.SatisfactionScore,
                data.satisfactionScoreTrend.data?.prevValue
            ),
        ],
        [
            SatisfactionMetricConfig[SatisfactionMetric.ResponseRate].title,
            formatTrendMetric(
                SatisfactionMetric.ResponseRate,
                data.responseRateTrend.data?.value
            ),
            formatTrendMetric(
                SatisfactionMetric.ResponseRate,
                data.responseRateTrend.data?.prevValue
            ),
        ],
        [
            SatisfactionMetricConfig[SatisfactionMetric.SurveysSent].title,
            formatTrendMetric(
                SatisfactionMetric.SurveysSent,
                data.surveysSentTrend.data?.value
            ),
            formatTrendMetric(
                SatisfactionMetric.SurveysSent,
                data.surveysSentTrend.data?.prevValue
            ),
        ],
    ]

    return createCsv(trendData)
}

export const useSatisfactionReportData = () => {
    const {cleanStatsFilters, userTimezone, granularity} = useNewStatsFilters()
    const {reportData, isLoading, period} = useSatisfactionMetrics()

    const fileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_METRICS_FILE_NAME
    )
    const trendsFileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_TRENDS_METRICS_FILE_NAME
    )

    const {files, isFetching} = useTables(
        cleanStatsFilters,
        userTimezone,
        granularity,
        tablesReportSource
    )

    return {
        files: {
            [trendsFileName]: saveReport(reportData, period),
            ...files,
        },
        fileName,
        isLoading: isLoading || isFetching,
    }
}

const formatSurveyScoresReport = (scores: MetricWithDecile, period: Period) => {
    const formattedSurveyScores = formatSurveyScores(
        scores,
        '- star count'
    ).map(({value, label}) => [label, value])
    const headers = getHeaders(period)

    return [headers, ...formattedSurveyScores]
}

export const fetchSurveyScoresReportData = (
    filters: StatsFilters,
    timezone: string
) => {
    const fileName = getCsvFileNameWithDates(
        filters.period,
        SATISFACTION_TRENDS_METRICS_FILE_NAME
    )

    return fetchSurveyScores(filters, timezone)
        .then((result) => {
            return {
                files: {
                    [fileName]: createCsv(
                        formatSurveyScoresReport(result, filters.period)
                    ),
                },
                fileName,
                isLoading: false,
                isError: false,
            }
        })
        .catch(() => ({
            files: {},
            fileName,
            isLoading: false,
            isError: true,
        }))
}
