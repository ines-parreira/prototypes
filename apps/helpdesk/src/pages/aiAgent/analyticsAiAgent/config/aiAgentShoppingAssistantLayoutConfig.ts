import { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT: DashboardLayoutConfig<AnalyticsAiAgentShoppingAssistantChart> =
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
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ResolvedInteractionsCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard,
                        gridSize: 3,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.AverageDiscountAmountCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.DiscountUsageCard,
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
                            AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendComboChart,
                        gridSize: 6,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendLineChart,
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
                            AnalyticsAiAgentShoppingAssistantChart.PerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                ],
            },
        ],
    }
