import { SLA_TREND_FILENAME } from 'hooks/reporting/sla/useDownloadSLAsData'
import { fetchSatisfiedOrBreachedTicketsTimeSeries } from 'hooks/reporting/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {
    fetchBreachedSlaTicketsTrend,
    fetchSatisfiedSlaTicketsTrend,
} from 'hooks/reporting/sla/useSLAsTicketsTrends'
import { fetchTicketSlaAchievementRateTrend } from 'hooks/reporting/sla/useTicketSlaAchievementRate'
import { TicketSLAStatus } from 'models/reporting/cubes/sla/TicketSLACube'
import { FilterKey, StaticFilter } from 'models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'pages/stats/common/filters/constants'
import { ReportsIDs } from 'pages/stats/custom-reports/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import {
    AchievedAndBreachedTicketsChart,
    CHART_TITLE,
    HINT,
} from 'pages/stats/sla/components/AchievedAndBreachedTicketsChart'
import { AchievementRateTrendCard } from 'pages/stats/sla/components/AchievementRateTrendCard'
import { BreachedTicketsRateTrendCard } from 'pages/stats/sla/components/BreachedTicketsRateTrendCard'
import { SlaMetricConfig } from 'pages/stats/sla/SlaConfig'
import { STATS_ROUTES } from 'routes/constants'
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
} from 'services/reporting/constants'
import { SlaMetric } from 'state/ui/stats/types'

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
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const SERVICE_LEVEL_PERSISTENT_FILTERS = [
    FilterKey.Period,
    FilterKey.SlaPolicies,
    FilterKey.AggregationWindow,
] satisfies StaticFilter[]

export const ServiceLevelAgreementsReportConfig: ReportConfig<ServiceLevelAgreementsChart> =
    {
        id: ReportsIDs.ServiceLevelAgreementsReportConfig,
        reportName: SERVICE_LEVEL_AGREEMENT_PAGE_TITLE,
        reportPath: STATS_ROUTES.SUPPORT_PERFORMANCE_SERVICE_LEVEL_AGREEMENT,
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
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTicketSlaAchievementRateTrend,
                        title: ACHIEVEMENT_RATE_LABEL,
                        metricFormat:
                            SlaMetricConfig[SlaMetric.AchievementRate]
                                .metricFormat,
                    },
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchBreachedSlaTicketsTrend,
                        title: TICKETS_WITH_BREACHED_SLAS_LABEL,
                        metricFormat:
                            SlaMetricConfig[SlaMetric.BreachedTicketsRate]
                                .metricFormat,
                    },
                ],
                chartType: ChartType.Card,
            },
            [ServiceLevelAgreementsChart.BreachedTicketsRateTrend]: {
                chartComponent: BreachedTicketsRateTrendCard,
                label: SlaMetricConfig[SlaMetric.BreachedTicketsRate].title,
                description:
                    SlaMetricConfig[SlaMetric.BreachedTicketsRate].hint.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchBreachedSlaTicketsTrend,
                        title: BREACHED_SLA_LABEL,
                        metricFormat:
                            SlaMetricConfig[SlaMetric.BreachedTicketsRate]
                                .metricFormat,
                    },
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchSatisfiedSlaTicketsTrend,
                        title: ACHIEVED_SLA_LABEL,
                        metricFormat:
                            SlaMetricConfig[SlaMetric.BreachedTicketsRate]
                                .metricFormat,
                    },
                ],
                chartType: ChartType.Card,
            },
            [ServiceLevelAgreementsChart.AchievedAndBreachedTicketsChart]: {
                chartComponent: AchievedAndBreachedTicketsChart,
                label: CHART_TITLE,
                description: HINT,
                csvProducer: [
                    {
                        type: DataExportFormat.TimeSeriesPerDimension,
                        fetch: fetchSatisfiedOrBreachedTicketsTimeSeries,
                        title: SLA_TREND_FILENAME,
                        headers: [
                            DATES_WITHIN_PERIOD_LABEL,
                            BREACHED_SLA_LABEL,
                            ACHIEVED_SLA_LABEL,
                        ],
                        dimensions: [
                            TicketSLAStatus.Breached,
                            TicketSLAStatus.Satisfied,
                        ],
                    },
                ],
                chartType: ChartType.Graph,
            },
        },
    }
