import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

import { AnalyticsAiAgentAllAgentsChart } from '../AnalyticsAiAgentAllAgentsReportConfig'

export const ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: 'kpis',
            items: [
                {
                    chartId: AnalyticsAiAgentAllAgentsChart.AutomationRateCard,
                    gridSize: 3,
                },
                {
                    chartId:
                        AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard,
                    gridSize: 3,
                },
                {
                    chartId: AnalyticsAiAgentAllAgentsChart.TotalSalesCard,
                    gridSize: 3,
                },
                {
                    chartId: AnalyticsAiAgentAllAgentsChart.TimeSavedCard,
                    gridSize: 3,
                },
            ],
        },
        {
            id: 'visualizations',
            type: 'charts',
            items: [
                {
                    chartId:
                        AnalyticsAiAgentAllAgentsChart.AllAgentsTrendComboChart,
                    gridSize: 6,
                },
                {
                    chartId:
                        AnalyticsAiAgentAllAgentsChart.AllAgentsTrendLineChart,
                    gridSize: 6,
                },
            ],
        },
        {
            id: 'breakdown',
            type: 'table',
            items: [
                {
                    chartId: AnalyticsAiAgentAllAgentsChart.PerformanceTable,
                    gridSize: 12,
                },
            ],
        },
    ],
}
