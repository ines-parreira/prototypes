import { FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/dashboards/types'
import CommentHighlightsChart, {
    COMMENT_HIGHLIGHTS,
} from 'pages/stats/quality-management/satisfaction//CommentHighlightsChart/CommentHighlightsChart'
import { AverageScorePerDimensionTrendChart } from 'pages/stats/quality-management/satisfaction/AverageScorePerDimensionTrendChart/AverageScorePerDimensionTrendChart'
import AverageSurveyScoreDonutChart from 'pages/stats/quality-management/satisfaction/AverageSurveyScoreDonutChart/AverageSurveyScoreDonutChart'
import { ResponseRateTrendCard } from 'pages/stats/quality-management/satisfaction/ResponseRateTrendCard'
import { SatisfactionMetricConfig } from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'
import { SatisfactionScoreTrendCard } from 'pages/stats/quality-management/satisfaction/SatisfactionScoreTrendCard'
import ScoredSurveysChart from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/ScoredSurveysChart'
import { SCORED_SURVEYS } from 'pages/stats/quality-management/satisfaction/ScoredSurveysChart/utils'
import { SurveysSentTrendCard } from 'pages/stats/quality-management/satisfaction/SurveysSentTrendCard'
import { STATS_ROUTES } from 'routes/constants'
import {
    fetchScoredSurveysReportData,
    fetchSurveyScoresReportData,
} from 'services/reporting/satisfactionReportingService'
import { SatisfactionMetric } from 'state/ui/stats/types'

export enum SatisfactionChart {
    SatisfactionScoreTrendCard = 'satisfaction-score-trend-card',
    ResponseRateTrendCard = 'response-rate-trend-card',
    SurveysSentTrendCard = 'surveys-sent-trend-card',
    AverageSurveyScoreDonutChart = 'average-survey-score-donut-chart',
    CommentHighlightsChart = 'comment-highlights-chart',
    AverageCSATPerDimensionTrendChart = 'average-csat-per-dimension-trend-chart',
    ScoredSurveysChart = 'scored-survey-chart',
}

export const SATISFACTION_TITLE = 'Satisfaction'
export const SATISFACTION_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
    FilterKey.AggregationWindow,
]
export const SATISFACTION_OPTIONAL_FILTERS = [
    FilterKey.Agents,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.CustomFields,
    FilterKey.Tags,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const SatisfactionReportConfig: ReportConfig<SatisfactionChart> = {
    id: ReportsIDs.SatisfactionReportConfig,
    reportName: SATISFACTION_TITLE,
    reportPath: STATS_ROUTES.QUALITY_MANAGEMENT_SATISFACTION,
    reportFilters: {
        persistent: SATISFACTION_PERSISTENT_FILTERS,
        optional: SATISFACTION_OPTIONAL_FILTERS,
    },
    charts: {
        [SatisfactionChart.SatisfactionScoreTrendCard]: {
            chartComponent: SatisfactionScoreTrendCard,
            label: SatisfactionMetricConfig[
                SatisfactionMetric.SatisfactionScore
            ].title,
            description:
                SatisfactionMetricConfig[SatisfactionMetric.SatisfactionScore]
                    .hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: SatisfactionMetricConfig[
                        SatisfactionMetric.SatisfactionScore
                    ].fetchTrend,
                    metricFormat:
                        SatisfactionMetricConfig[
                            SatisfactionMetric.SatisfactionScore
                        ].metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [SatisfactionChart.ResponseRateTrendCard]: {
            chartComponent: ResponseRateTrendCard,
            label: SatisfactionMetricConfig[SatisfactionMetric.ResponseRate]
                .title,
            description:
                SatisfactionMetricConfig[SatisfactionMetric.ResponseRate].hint
                    .title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: SatisfactionMetricConfig[
                        SatisfactionMetric.ResponseRate
                    ].fetchTrend,
                    metricFormat:
                        SatisfactionMetricConfig[
                            SatisfactionMetric.ResponseRate
                        ].metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [SatisfactionChart.SurveysSentTrendCard]: {
            chartComponent: SurveysSentTrendCard,
            label: SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
                .title,
            description:
                SatisfactionMetricConfig[SatisfactionMetric.SurveysSent].hint
                    .title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: SatisfactionMetricConfig[
                        SatisfactionMetric.SurveysSent
                    ].fetchTrend,
                    metricFormat:
                        SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
                            .metricFormat,
                },
            ],
            chartType: ChartType.Card,
        },
        [SatisfactionChart.AverageSurveyScoreDonutChart]: {
            chartComponent: AverageSurveyScoreDonutChart,
            label: SatisfactionMetricConfig[
                SatisfactionMetric.AverageSurveyScore
            ].title,
            description:
                SatisfactionMetricConfig[SatisfactionMetric.AverageSurveyScore]
                    .hint.title,
            csvProducer: [
                {
                    type: DataExportFormat.Trend,
                    fetch: SatisfactionMetricConfig[
                        SatisfactionMetric.AverageSurveyScore
                    ].fetchTrend,
                    metricFormat:
                        SatisfactionMetricConfig[
                            SatisfactionMetric.AverageSurveyScore
                        ].metricFormat,
                },
                {
                    type: DataExportFormat.Table,
                    fetch: fetchSurveyScoresReportData,
                },
            ],
            chartType: ChartType.Graph,
        },
        [SatisfactionChart.CommentHighlightsChart]: {
            chartComponent: CommentHighlightsChart,
            label: COMMENT_HIGHLIGHTS.TITLE,
            description: COMMENT_HIGHLIGHTS.DESCRIPTION,
            csvProducer: null,
            chartType: ChartType.Graph,
        },
        [SatisfactionChart.AverageCSATPerDimensionTrendChart]: {
            chartComponent: AverageScorePerDimensionTrendChart,
            label: 'Average CSAT over time',
            description:
                'Overall average CSAT, as well as average CSAT score per dimensions over the period.',
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: SatisfactionMetricConfig[
                        SatisfactionMetric.AverageCSATPerChannel
                    ].fetchTable,
                },
                {
                    type: DataExportFormat.Table,
                    fetch: SatisfactionMetricConfig[
                        SatisfactionMetric.AverageCSATPerAssignee
                    ].fetchTable,
                },
                {
                    type: DataExportFormat.Table,
                    fetch: SatisfactionMetricConfig[
                        SatisfactionMetric.AverageCSATPerIntegration
                    ].fetchTable,
                },
            ],
            chartType: ChartType.Graph,
        },
        [SatisfactionChart.ScoredSurveysChart]: {
            chartComponent: ScoredSurveysChart,
            label: SCORED_SURVEYS.TITLE,
            csvProducer: [
                {
                    type: DataExportFormat.Table,
                    fetch: fetchScoredSurveysReportData,
                },
            ],
            description: SCORED_SURVEYS.DESCRIPTION,
            chartType: ChartType.Table,
        },
    },
} as const
