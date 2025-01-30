import moment from 'moment/moment'

import {MetricWithDecile} from 'hooks/reporting/useMetricPerDimension'
import {MetricTrend} from 'hooks/reporting/useMetricTrend'
import {Period} from 'models/stat/types'
import {
    formatMetricValue,
    NOT_AVAILABLE_PLACEHOLDER,
} from 'pages/stats/common/utils'
import {formatSurveyScores} from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import {DATE_TIME_FORMAT} from 'services/reporting/constants'
import {SatisfactionMetric} from 'state/ui/stats/types'
import {createCsv, saveZippedFiles} from 'utils/file'
import {getPreviousPeriod} from 'utils/reporting'

export interface SatisfactionReportData {
    satisfactionScoreTrend: MetricTrend
    responseRateTrend: MetricTrend
    surveysSentTrend: MetricTrend
    averageScoreTrend: MetricTrend
    surveyScores: MetricWithDecile
}

const formatTrendMetric = (column: SatisfactionMetric, value?: number | null) =>
    formatMetricValue(
        value,
        SatisfactionMetricConfig[column].metricFormat,
        NOT_AVAILABLE_PLACEHOLDER
    )

export const saveReport = async (
    data: SatisfactionReportData,
    period: Period
) => {
    const previousPeriod = getPreviousPeriod(period)
    const export_datetime = moment().format(DATE_TIME_FORMAT)
    const startDate = moment(period.start_datetime).format(DATE_TIME_FORMAT)
    const previousStartDate = moment(previousPeriod.start_datetime).format(
        DATE_TIME_FORMAT
    )
    const endDate = moment(period.end_datetime).format(DATE_TIME_FORMAT)
    const previousEndDate = moment(previousPeriod.end_datetime).format(
        DATE_TIME_FORMAT
    )
    const periodPrefix = `${startDate}_${endDate}`

    const formattedSurveyScores = formatSurveyScores(
        data.surveyScores,
        '- star count'
    )?.map(({value, label}) => [label, value])

    const trendData = [
        [
            'Metric',
            `${startDate} - ${endDate}`,
            `${previousStartDate} - ${previousEndDate}`,
        ],
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
        ...(formattedSurveyScores || []),
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

    return saveZippedFiles(
        {
            [`${periodPrefix}-satisfaction-trends-metrics-${export_datetime}.csv`]:
                createCsv(trendData),
        },
        `${periodPrefix}-satisfaction-metrics-${export_datetime}`
    )
}
