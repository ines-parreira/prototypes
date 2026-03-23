import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const DEFAULT_ANALYTICS_OVERVIEW_LAYOUT: DashboardLayoutConfig<any> = {
    sections: [
        {
            id: 'kpis',
            type: ChartType.Card,
            items: [
                {
                    chartId: AnalyticsOverviewChart.AutomationRateCard,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: AnalyticsOverviewChart.AutomatedInteractionsCard,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: AnalyticsOverviewChart.TimeSavedCard,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: AnalyticsOverviewChart.CostSavedCard,
                    gridSize: 3,
                    visibility: true,
                },
                {
                    chartId: AnalyticsOverviewChart.HandoverInteractionsCard,
                    gridSize: 3,
                    visibility: true,
                    requiresFeatureFlag: true,
                },
                {
                    chartId:
                        AnalyticsOverviewChart.DecreaseInResolutionTimeCard,
                    gridSize: 3,
                    visibility: true,
                    requiresFeatureFlag: true,
                },
                {
                    chartId: AnalyticsOverviewChart.DecreaseInFRTCard,
                    gridSize: 3,
                    visibility: true,
                    requiresFeatureFlag: true,
                },
            ],
        },
        {
            id: 'visualizations',
            type: ChartType.Graph,
            items: [
                {
                    chartId: AnalyticsOverviewChart.AutomationRateComboChart,
                    gridSize: 6,
                    visibility: true,
                },
                {
                    chartId: AnalyticsOverviewChart.AutomationLineChart,
                    gridSize: 6,
                    visibility: true,
                },
            ],
        },
        {
            id: 'breakdown',
            type: ChartType.Table,
            tableTitle: 'Performance breakdown',
            items: [
                {
                    chartId: AnalyticsOverviewChart.PerformanceTable,
                    gridSize: 12,
                    visibility: true,
                },
                {
                    chartId: AnalyticsOverviewChart.ArticleRecommendationTable,
                    gridSize: 12,
                    visibility: true,
                    requiresFeatureFlag: true,
                },
                {
                    chartId: AnalyticsOverviewChart.FlowsTable,
                    gridSize: 12,
                    visibility: true,
                    requiresFeatureFlag: true,
                },
                {
                    chartId: AnalyticsOverviewChart.OrderManagementTable,
                    gridSize: 12,
                    visibility: true,
                    requiresFeatureFlag: true,
                },
            ],
        },
    ],
}
