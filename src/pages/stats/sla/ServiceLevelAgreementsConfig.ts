import {FilterKey, StaticFilter} from 'models/stat/types'
import {CHARTS_MODAL_ICONS} from 'pages/stats/custom-reports/CustomReportsModal/ChartIcon'
import {ReportConfig} from 'pages/stats/custom-reports/types'
import {
    AchievedAndBreachedTicketsChart,
    CHART_TITLE,
    HINT,
} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'
import {AchievementRateTrendCard} from 'pages/stats/sla/components/AchievementRateTrendCard'
import {BreachedTicketsRateTrendCard} from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'
import {SlaMetricConfig} from 'pages/stats/sla/SlaConfig'
import {SlaMetric} from 'state/ui/stats/types'

export const SERVICE_LEVEL_AGREEMENT_PAGE_TITLE = 'SLAs'

export enum ServiceLevelAgreementsChart {
    AchievementRateTrend = 'achievement-rate-trend',
    BreachedTicketsRateTrend = 'breached-tickets-rate-trend',
    AchievedAndBreachedTicketsChart = 'achieved-and-breached-tickets-chart',
}

export const SERVICE_LEVEL_OPTIONAL_FILTERS = [
    FilterKey.Integrations,
    FilterKey.Channels,
    FilterKey.Agents,
    FilterKey.Tags,
    FilterKey.CustomFields,
]

export const SERVICE_LEVEL_PERSISTENT_FILTERS = [
    FilterKey.Period,
    FilterKey.SlaPolicies,
    FilterKey.AggregationWindow,
] satisfies StaticFilter[]

export const ServiceLevelAgreementsConfig: ReportConfig<ServiceLevelAgreementsChart> =
    {
        reportName: SERVICE_LEVEL_AGREEMENT_PAGE_TITLE,
        reportPath: 'slas',
        reportFilters: {
            optional: SERVICE_LEVEL_OPTIONAL_FILTERS,
            persistent: SERVICE_LEVEL_PERSISTENT_FILTERS,
        },
        charts: {
            [ServiceLevelAgreementsChart.AchievementRateTrend]: {
                chartComponent: AchievementRateTrendCard,
                label: SlaMetricConfig[SlaMetric.AchievementRate].title,
                description:
                    SlaMetricConfig[SlaMetric.AchievementRate].hint.title,
                csvProducer: null,
                icon: CHARTS_MODAL_ICONS.card,
            },
            [ServiceLevelAgreementsChart.BreachedTicketsRateTrend]: {
                chartComponent: BreachedTicketsRateTrendCard,
                label: SlaMetricConfig[SlaMetric.BreachedTicketsRate].title,
                description:
                    SlaMetricConfig[SlaMetric.BreachedTicketsRate].hint.title,
                csvProducer: null,
                icon: CHARTS_MODAL_ICONS.card,
            },
            [ServiceLevelAgreementsChart.AchievedAndBreachedTicketsChart]: {
                chartComponent: AchievedAndBreachedTicketsChart,
                label: CHART_TITLE,
                description: HINT,
                csvProducer: null,
                icon: CHARTS_MODAL_ICONS.graph,
            },
        },
    }
