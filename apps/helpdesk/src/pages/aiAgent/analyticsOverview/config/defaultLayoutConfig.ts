import { AnalyticsOverviewChart } from 'pages/aiAgent/analyticsOverview/AnalyticsOverviewReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const DEFAULT_ANALYTICS_OVERVIEW_LAYOUT: DashboardLayoutConfig<any> = {
    sections: [
        {
            id: 'kpis',
            type: 'kpis',
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
            ],
        },
        {
            id: 'visualizations',
            type: 'charts',
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
            type: 'table',
            items: [
                {
                    chartId: AnalyticsOverviewChart.PerformanceTable,
                    gridSize: 12,
                    visibility: true,
                },
            ],
        },
    ],
}
