import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentAllAgentsChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentAllAgentsReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const ANALYTICS_AI_AGENT_ALL_AGENTS_LAYOUT: DashboardLayoutConfig<AnalyticsAiAgentAllAgentsChart> =
    {
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
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
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.ZeroTouchTicketsCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId: AnalyticsAiAgentAllAgentsChart.AverageCsatCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.CoverageRateCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.ClosedTicketsCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.HandoverInteractionsCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId: AnalyticsAiAgentAllAgentsChart.CostSavedCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.DecreaseInResolutionTimeCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.DecreaseInFRTCard,
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
                type: ChartType.Table,
                tableTitle: 'Performance breakdown',
                items: [
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                ],
            },
        ],
    }
