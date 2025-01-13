import {FilterKey, StaticFilter} from 'models/stat/types'
import {CHARTS_MODAL_ICONS} from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon'
import {ReportConfig} from 'pages/stats/custom-reports/types'
import {ResponseRateTrendCard} from 'pages/stats/quality-management/satisfaction/ResponseRateTrendCard'
import {SatisfactionMetricConfig} from 'pages/stats/quality-management/satisfaction/SatisfactionMetricsConfig'

import {SatisfactionScoreTrendCard} from 'pages/stats/quality-management/satisfaction/SatisfactionScoreTrendCard'
import {SurveysSentTrendCard} from 'pages/stats/quality-management/satisfaction/SurveysSentTrendCard'
import {SatisfactionMetric} from 'state/ui/stats/types'

export enum SatisfactionChart {
    SatisfactionScoreTrendCard = 'satisfaction-score-trend-card',
    ResponseRateTrendCard = 'response-rate-trend-card',
    SurveysSentTrendCard = 'surveys-sent-trend-card',
}

export const SATISFACTION_TITLE = 'Satisfaction'
export const SATISFACTION_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]
export const SATISFACTION_OPTIONAL_FILTERS = [
    FilterKey.Agents,
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.CustomFields,
]

export const SatisfactionReportConfig: ReportConfig<SatisfactionChart> = {
    reportName: SATISFACTION_TITLE,
    reportPath: 'quality-management-satisfaction',
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
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.card,
        },
        [SatisfactionChart.ResponseRateTrendCard]: {
            chartComponent: ResponseRateTrendCard,
            label: SatisfactionMetricConfig[SatisfactionMetric.ResponseRate]
                .title,
            description:
                SatisfactionMetricConfig[SatisfactionMetric.ResponseRate].hint
                    .title,
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.card,
        },
        [SatisfactionChart.SurveysSentTrendCard]: {
            chartComponent: SurveysSentTrendCard,
            label: SatisfactionMetricConfig[SatisfactionMetric.SurveysSent]
                .title,
            description:
                SatisfactionMetricConfig[SatisfactionMetric.SurveysSent].hint
                    .title,
            csvProducer: null,
            icon: CHARTS_MODAL_ICONS.card,
        },
    },
}
