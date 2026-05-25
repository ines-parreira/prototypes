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
import { OverviewAverageCSATCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard'
import { PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { STATS_ROUTES } from 'routes/constants'

export enum PerformanceOverviewChart {
    AverageCSATCard = 'performance-overview-average-csat-card',
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
        },
        reportFilters: {
            optional: PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
