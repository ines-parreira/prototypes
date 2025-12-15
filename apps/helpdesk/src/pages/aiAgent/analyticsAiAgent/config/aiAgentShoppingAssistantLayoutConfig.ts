import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

import { AnalyticsAiAgentShoppingAssistantChart } from '../AnalyticsAiAgentShoppingAssistantReportConfig'

export const ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT: DashboardLayoutConfig =
    {
        sections: [
            {
                id: 'kpis',
                type: 'kpis',
                items: [
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.TotalSalesCard,
                        gridSize: 3,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard,
                        gridSize: 3,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ResolvedInteractionsCard,
                        gridSize: 3,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard,
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
                            AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendComboChart,
                        gridSize: 6,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendLineChart,
                        gridSize: 6,
                    },
                ],
            },
            {
                id: 'breakdown',
                type: 'table',
                items: [
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.PerformanceTable,
                        gridSize: 12,
                    },
                ],
            },
        ],
    }
