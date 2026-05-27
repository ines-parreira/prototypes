import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { getStatsTrendFetch } from 'domains/reporting/hooks/useStatsMetricTrend'
import { averageScoreQueryV2Factory } from 'domains/reporting/models/scopes/satisfactionSurveys'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { ChannelsEmailAverageCSATCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailAverageCSATCard'
import { PERFORMANCE_CHANNELS_OPTIONAL_FILTERS } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { STATS_ROUTES } from 'routes/constants'

export enum PerformanceChannelsEmailChart {
    AverageCSATCard = 'performance-channels-email-average-csat-card',
}

export const ChannelsEmailReportConfig: ReportConfig<PerformanceChannelsEmailChart> =
    {
        id: ReportsIDs.PerformanceChannelsEmailReportConfig,
        reportName: 'Channels',
        reportPath: STATS_ROUTES.PERFORMANCE_CHANNELS,
        charts: {
            [PerformanceChannelsEmailChart.AverageCSATCard]: {
                chartComponent: ChannelsEmailAverageCSATCard,
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
        },
        reportFilters: {
            optional: PERFORMANCE_CHANNELS_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
