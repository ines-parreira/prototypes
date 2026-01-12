import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

import { AnalyticsAiAgentSupportAgentChart } from '../AnalyticsAiAgentSupportAgentReportConfig'

export const ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT: DashboardLayoutConfig = {
    sections: [
        {
            id: 'kpis',
            type: 'kpis',
            items: [
                {
                    chartId: AnalyticsAiAgentSupportAgentChart.TimeSavedCard,
                    gridSize: 3,
                },
                {
                    chartId: AnalyticsAiAgentSupportAgentChart.CostSavedCard,
                    gridSize: 3,
                },
                {
                    chartId:
                        AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard,
                    gridSize: 3,
                },
                {
                    chartId:
                        AnalyticsAiAgentSupportAgentChart.DecreaseInFRTCard,
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
                        AnalyticsAiAgentSupportAgentChart.SupportInteractionsComboChart,
                    gridSize: 6,
                },
                {
                    chartId:
                        AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart,
                    gridSize: 6,
                },
            ],
        },
        {
            id: 'breakdown',
            type: 'table',
            items: [
                {
                    chartId: AnalyticsAiAgentSupportAgentChart.PerformanceTable,
                    gridSize: 12,
                },
            ],
        },
    ],
}
