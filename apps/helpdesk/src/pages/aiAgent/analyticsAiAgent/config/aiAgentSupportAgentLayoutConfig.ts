import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentSupportAgentChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentSupportAgentReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const ANALYTICS_AI_AGENT_SUPPORT_AGENT_LAYOUT: DashboardLayoutConfig<AnalyticsAiAgentSupportAgentChart> =
    {
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
                items: [
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.TimeSavedCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.CostSavedCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.DecreaseInFRTCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.AverageCsatCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.HandoverInteractionsCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.DecreaseInResolutionTimeCard,
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
                            AnalyticsAiAgentSupportAgentChart.SupportInteractionsComboChart,
                        gridSize: 6,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart,
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
                            AnalyticsAiAgentSupportAgentChart.ChannelPerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentSupportAgentChart.IntentPerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                ],
            },
        ],
    }
