import { AnalyticsOverviewChart } from '../AnalyticsOverviewReportConfig'
import type { DashboardLayoutConfig } from '../types/layoutConfig'

export const DEFAULT_ANALYTICS_OVERVIEW_LAYOUT: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: 'kpis',
            items: [
                {
                    chartId: AnalyticsOverviewChart.AutomationRateCard,
                    gridSize: 3,
                },
                {
                    chartId: AnalyticsOverviewChart.AutomatedInteractionsCard,
                    gridSize: 3,
                },
                {
                    chartId: AnalyticsOverviewChart.TimeSavedCard,
                    gridSize: 3,
                },
                {
                    chartId: AnalyticsOverviewChart.CostSavedCard,
                    gridSize: 3,
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
                },
                {
                    chartId: AnalyticsOverviewChart.AutomationLineChart,
                    gridSize: 6,
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
                },
            ],
        },
    ],
}
