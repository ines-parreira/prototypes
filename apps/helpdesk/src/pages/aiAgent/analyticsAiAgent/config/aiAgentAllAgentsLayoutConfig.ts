import { AnalyticsAiAgentAllAgentsChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT: DashboardLayoutConfig<AnalyticsAiAgentAllAgentsChart> =
    {
        sections: [
            {
                id: 'kpis',
                type: 'kpis',
                items: [
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.AutomationRateCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: AnalyticsAiAgentAllAgentsChart.TotalSalesCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: AnalyticsAiAgentAllAgentsChart.TimeSavedCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId: AnalyticsAiAgentAllAgentsChart.AverageCsatCard,
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
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.AllAgentsTrendComboChart,
                        gridSize: 6,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.AllAgentsTrendLineChart,
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
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.PerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                ],
            },
        ],
    }
