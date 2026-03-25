import { ChartType } from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentShoppingAssistantChart } from 'pages/aiAgent/analyticsAiAgent/AnalyticsAiAgentShoppingAssistantReportConfig'
import type { DashboardLayoutConfig } from 'pages/aiAgent/analyticsOverview/types/layoutConfig'

export const ANALYTICS_AI_AGENT_SHOPPING_ASSISTANT_LAYOUT: DashboardLayoutConfig<AnalyticsAiAgentShoppingAssistantChart> =
    {
        sections: [
            {
                id: 'kpis',
                type: ChartType.Card,
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
                            AnalyticsAiAgentShoppingAssistantChart.AverageOrderValueCard,
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
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.DiscountCodesAppliedCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.DiscountsOfferedCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.MedianPurchaseTimeCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ConversionRateCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.BuyThroughRateCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ClickThroughRateCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.SuccessRateCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ProductRecommendationsCard,
                        gridSize: 3,
                        visibility: true,
                        requiresFeatureFlag: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.HandoverInteractionsCard,
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
                            AnalyticsAiAgentShoppingAssistantChart.ConfigurableBarGraph,
                        gridSize: 6,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.ConfigurableLineGraph,
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
                            AnalyticsAiAgentShoppingAssistantChart.ChannelPerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                    {
                        chartId:
                            AnalyticsAiAgentShoppingAssistantChart.TopProductsPerformanceTable,
                        gridSize: 12,
                        visibility: true,
                    },
                ],
            },
        ],
    }
