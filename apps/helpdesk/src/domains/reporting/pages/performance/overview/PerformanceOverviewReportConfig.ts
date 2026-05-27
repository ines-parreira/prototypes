import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { getStatsTrendFetch } from 'domains/reporting/hooks/useStatsMetricTrend'
import { firstResponseTimeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { messagesPerTicketValueQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { resolutionTimeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { averageScoreQueryV2Factory } from 'domains/reporting/models/scopes/satisfactionSurveys'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { OverviewAverageCSATCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard'
import { OverviewFirstResponseTimeCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewFirstResponseTimeCard'
import { OverviewMessagesPerTicketCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewMessagesPerTicketCard'
import { OverviewResolutionTimeCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewResolutionTimeCard'
import { PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { STATS_ROUTES } from 'routes/constants'

export enum PerformanceOverviewChart {
    AverageCSATCard = 'performance-overview-average-csat-card',
    ResolutionTimeCard = 'performance-overview-resolution-time-card',
    MessagesPerTicketCard = 'performance-overview-messages-per-ticket-card',
    FirstResponseTimeCard = 'performance-overview-first-response-time-card',
}

export const PerformanceOverviewReportConfig: ReportConfig<PerformanceOverviewChart> =
    {
        id: ReportsIDs.PerformanceOverviewReportConfig,
        reportName: 'Performance',
        reportPath: STATS_ROUTES.PERFORMANCE_OVERVIEW,
        charts: {
            [PerformanceOverviewChart.AverageCSATCard]: {
                chartComponent: OverviewAverageCSATCard,
                label: METRIC_TOOLTIPS.averageCSAT.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(averageScoreQueryV2Factory),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.averageCSAT,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [PerformanceOverviewChart.ResolutionTimeCard]: {
                chartComponent: OverviewResolutionTimeCard,
                label: METRIC_TOOLTIPS.resolutionTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            resolutionTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.resolutionTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [PerformanceOverviewChart.MessagesPerTicketCard]: {
                chartComponent: OverviewMessagesPerTicketCard,
                label: METRIC_TOOLTIPS.messagesPerTicket.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            messagesPerTicketValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.messagesPerTicket,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [PerformanceOverviewChart.FirstResponseTimeCard]: {
                chartComponent: OverviewFirstResponseTimeCard,
                label: METRIC_TOOLTIPS.firstResponseTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            firstResponseTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.firstResponseTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
        },
        reportFilters: {
            optional: PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
