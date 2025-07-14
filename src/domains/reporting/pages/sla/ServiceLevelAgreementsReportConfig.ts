import { SLA_TREND_FILENAME } from 'domains/reporting/hooks/sla/useDownloadSLAsData'
import { fetchSatisfiedOrBreachedTicketsTimeSeries } from 'domains/reporting/hooks/sla/useSatisfiedOrBreachedTicketsTimeSeries'
import {
    fetchBreachedSlaTicketsTrend,
    fetchSatisfiedSlaTicketsTrend,
} from 'domains/reporting/hooks/sla/useSLAsTicketsTrends'
import { fetchTicketSlaAchievementRateTrend } from 'domains/reporting/hooks/sla/useTicketSlaAchievementRate'
import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { FilterKey, StaticFilter } from 'domains/reporting/models/stat/types'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import {
    AchievedAndBreachedTicketsChart,
    CHART_TITLE,
    HINT,
} from 'domains/reporting/pages/sla/components/AchievedAndBreachedTicketsChart'
import { AchievementRateTrendCard } from 'domains/reporting/pages/sla/components/AchievementRateTrendCard'
import { BreachedTicketsRateTrendCard } from 'domains/reporting/pages/sla/components/BreachedTicketsRateTrendCard'
import { SlaMetricConfig } from 'domains/reporting/pages/sla/SlaConfig'
import {
    ACHIEVED_SLA_LABEL,
    ACHIEVEMENT_RATE_LABEL,
    BREACHED_SLA_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
    TICKETS_WITH_BREACHED_SLAS_LABEL,
} from 'domains/reporting/services/constants'
import { SlaMetric } from 'domains/reporting/state/ui/stats/types'
import { STATS_ROUTES } from 'routes/constants'

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
