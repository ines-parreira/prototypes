import moment from 'moment/moment'

import { useTables } from 'domains/reporting/hooks/common/useTableReportData'
import { getCsvFileNameWithDates } from 'domains/reporting/hooks/common/utils'
import { useSatisfactionMetrics } from 'domains/reporting/hooks/quality-management/satisfaction/useSatisfactionMetrics'
import type { ScoredSurveysData } from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import {
    fetchScoredSurveys,
    ScoredSurveySortDefaultValues,
    useScoredSurveys,
} from 'domains/reporting/hooks/quality-management/satisfaction/useScoredSurveys'
import { fetchSurveyScores } from 'domains/reporting/hooks/quality-management/satisfaction/useSurveyScores'
import { useStatsFilters } from 'domains/reporting/hooks/support-performance/useStatsFilters'
import type { MetricWithDecile } from 'domains/reporting/hooks/types'
import type { MetricTrend } from 'domains/reporting/hooks/useMetricTrend'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { TicketMessagesDimension } from 'domains/reporting/models/cubes/TicketMessagesCube'
import type { Period, StatsFilters } from 'domains/reporting/models/stat/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'domains/reporting/pages/common/utils'
import { formatSurveyScores } from 'domains/reporting/pages/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import { SatisfactionMetricConfig } from 'domains/reporting/pages/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SCORED_SURVEYS_TABLE_COLUMNS } from 'domains/reporting/pages/quality-management/satisfaction/ScoredSurveysChart/utils'
import { DATE_TIME_FORMAT } from 'domains/reporting/services/constants'
import { SatisfactionMetric } from 'domains/reporting/state/ui/stats/types'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'
import { createCsv } from 'utils/file'

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
export const SATISFACTION_SCORED_SURVEYS = 'satisfaction-scored-surveys'

const formatTrendMetric = (column: SatisfactionMetric, value?: number | null) =>
    formatMetricValue(
        value,
        SatisfactionMetricConfig[column].metricFormat,
        NOT_AVAILABLE_PLACEHOLDER,
    )

const getHeaders = (period: Period) => {
    const previousPeriod = getPreviousPeriod(period)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT,
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT,
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
        '- star count',
    ).map(({ value, label }) => [label, value])
    const headers = getHeaders(period)

    const trendData = [
        headers,
        [
            SatisfactionMetricConfig[SatisfactionMetric.AverageSurveyScore]
                .title,
            formatTrendMetric(
                SatisfactionMetric.AverageSurveyScore,
                data.averageScoreTrend.data?.value,
            ),
            formatTrendMetric(
                SatisfactionMetric.AverageSurveyScore,
                data.averageScoreTrend.data?.prevValue,
            ),
        ],
        ...formattedSurveyScores,
        [
            SatisfactionMetricConfig[SatisfactionMetric.SatisfactionScore]
                .title,
            formatTrendMetric(
                SatisfactionMetric.SatisfactionScore,
                data.satisfactionScoreTrend.data?.value,
            ),
            formatTrendMetric(
                SatisfactionMetric.SatisfactionScore,
                data.satisfactionScoreTrend.data?.prevValue,
            ),
        ],
        [
            SatisfactionMetricConfig[SatisfactionMetric.ResponseRate].title,
            formatTrendMetric(
                SatisfactionMetric.ResponseRate,
                data.responseRateTrend.data?.value,
            ),
            formatTrendMetric(
                SatisfactionMetric.ResponseRate,
                data.responseRateTrend.data?.prevValue,
            ),
        ],
        [
            SatisfactionMetricConfig[SatisfactionMetric.SurveysSent].title,
            formatTrendMetric(
                SatisfactionMetric.SurveysSent,
                data.surveysSentTrend.data?.value,
            ),
            formatTrendMetric(
                SatisfactionMetric.SurveysSent,
                data.surveysSentTrend.data?.prevValue,
            ),
        ],
    ]

    return createCsv(trendData)
}

export const useSatisfactionReportData = () => {
    const { cleanStatsFilters, userTimezone, granularity } = useStatsFilters()
    const { reportData, isLoading, period } = useSatisfactionMetrics()
    const { data, isFetching: isFetchingScoredSurveys } = useScoredSurveys(
        cleanStatsFilters,
        userTimezone,
        // Should be replaced with the actual sorting value from redux once it's implemented in #CRMREP-4455
        ScoredSurveySortDefaultValues,
        500,
    )

    const scoredSurveysFileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_SCORED_SURVEYS,
    )

    const fileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_METRICS_FILE_NAME,
    )
    const trendsFileName = getCsvFileNameWithDates(
        period,
        SATISFACTION_TRENDS_METRICS_FILE_NAME,
    )

    const { files, isFetching } = useTables(
        cleanStatsFilters,
        userTimezone,
        granularity,
        tablesReportSource,
    )

    return {
        files: {
            [trendsFileName]: saveReport(reportData, period),
            [scoredSurveysFileName]: formatScoredSurveysReport(data),
            ...files,
        },
        fileName,
        isLoading: isLoading || isFetching || isFetchingScoredSurveys,
    }
}

const formatSurveyScoresReport = (scores: MetricWithDecile, period: Period) => {
    const formattedSurveyScores = formatSurveyScores(
        scores,
        '- star count',
    ).map(({ value, label }) => [label, value])
    const headers = getHeaders(period)

    return [headers, ...formattedSurveyScores]
}

export const fetchSurveyScoresReportData = (
    filters: StatsFilters,
    timezone: string,
) => {
    const fileName = getCsvFileNameWithDates(
        filters.period,
        SATISFACTION_TRENDS_METRICS_FILE_NAME,
    )

    return fetchSurveyScores(filters, timezone)
        .then((result) => {
            return {
                files: {
                    [fileName]: createCsv(
                        formatSurveyScoresReport(result, filters.period),
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

export const formatScoredSurveysReport = (
    scoredSurveys?: ScoredSurveysData[] | null,
) => {
    const EXPORTABLE_COLUMNS = SCORED_SURVEYS_TABLE_COLUMNS.filter(
        (column) => column.property,
    )

    const formattedScoredSurveys =
        scoredSurveys?.map((scoredSurvey) =>
            EXPORTABLE_COLUMNS.map((column) => {
                return (
                    (column.property && scoredSurvey[column.property]) ||
                    NOT_AVAILABLE_PLACEHOLDER
                )
            }),
        ) || []

    const headers = EXPORTABLE_COLUMNS.map((column) => column.title)
    return createCsv([headers, ...formattedScoredSurveys])
}

export const fetchScoredSurveysReportData = (
    filters: StatsFilters,
    timezone: string,
) => {
    const fileName = getCsvFileNameWithDates(
        filters.period,
        SATISFACTION_SCORED_SURVEYS,
    )

    const LIMIT = 500

    return fetchScoredSurveys(
        filters,
        timezone,
        // Should be replaced with the actual sorting once it's implemented
        ScoredSurveySortDefaultValues,
        LIMIT,
    )
        .then((result) => {
            return {
                files: {
                    [fileName]: formatScoredSurveysReport(result.data),
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
