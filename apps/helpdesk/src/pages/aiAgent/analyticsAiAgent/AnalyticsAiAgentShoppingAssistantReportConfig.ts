import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { fetchAiAgentBuyThroughRateTrend } from 'domains/reporting/hooks/automate/useAiAgentBuyThroughRateTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchAiAgentSalesHandoverInteractionsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useAiAgentSalesHandoverInteractionsTrend'
import { fetchClickThroughRateTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useClickThroughRateTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentAverageDiscountAmountCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAverageDiscountAmountCard'
import { AnalyticsAiAgentAverageOrderValueCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAverageOrderValueCard'
import { AnalyticsAiAgentBuyThroughRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentBuyThroughRateCard'
import { AnalyticsAiAgentClickThroughRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClickThroughRateCard'
import { AnalyticsAiAgentConversionRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentConversionRateCard'
import { AnalyticsAiAgentDiscountCodesAppliedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountCodesAppliedCard'
import { AnalyticsAiAgentDiscountsOfferedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountsOfferedCard'
import { AnalyticsAiAgentDiscountUsageCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountUsageCard'
import { AnalyticsAiAgentMedianPurchaseTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentMedianPurchaseTimeCard'
import { AnalyticsAiAgentOrdersInfluencedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentOrdersInfluencedCard'
import { AnalyticsAiAgentProductRecommendationsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentProductRecommendationsCard'
import { AnalyticsAiAgentRevenuePerInteractionCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentRevenuePerInteractionCard'
import { AnalyticsAiAgentSalesHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSalesHandoverInteractionsCard'
import { AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard'
import { AnalyticsAiAgentShoppingAssistantSuccessRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentShoppingAssistantSuccessRateCard'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import {
    AnalyticsShoppingAssistantConfigurableBar,
    SHOPPING_ASSISTANT_BAR_CHART_METRICS,
} from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsShoppingAssistantConfigurableBar/AnalyticsShoppingAssistantConfigurableBar'
import {
    AnalyticsShoppingAssistantConfigurableLine,
    SHOPPING_ASSISTANT_LINE_CHART_METRICS,
} from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsShoppingAssistantConfigurableLine/AnalyticsShoppingAssistantConfigurableLine'
import { fetchAiSalesAgentConversionRateTrend } from 'pages/aiAgent/analyticsAiAgent/charts/useAiSalesAgentConversionRateTrend'
import { ShoppingAssistantChannelTableWrapper } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ShoppingAssistantChannelTableWrapper'
import { ShoppingAssistantTopProductsTableWrapper } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ShoppingAssistantTopProductsTableWrapper'
import { ShoppingAssistantPerformanceByEngagementFeatureTable } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable'
import { SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/ShoppingAssistantPerformanceByEngagementFeatureTable/columns'
import { fetchAiAgentAverageDiscountAmountTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAverageDiscountAmountTrend'
import { fetchAiAgentAverageOrderValueTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAverageOrderValueTrend'
import { fetchAiAgentDiscountCodesAppliedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentDiscountCodesAppliedTrend'
import { fetchAiAgentDiscountsOfferedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentDiscountsOfferedTrend'
import { fetchAiAgentDiscountUsageTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentDiscountUsageTrend'
import { fetchAiAgentMedianPurchaseTimeTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentMedianPurchaseTimeTrend'
import { fetchAiAgentOrdersInfluencedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOrdersInfluencedTrend'
import { fetchAiAgentProductRecommendationsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentProductRecommendationsTrend'
import { fetchAiAgentSalesPerformanceByChannelAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSalesPerformanceByChannelMetrics'
import { fetchAiAgentShoppingAssistantAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentShoppingAssistantAutomatedInteractionsTrend'
import { fetchAiAgentShoppingAssistantSuccessRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentShoppingAssistantSuccessRateTrend'
import { fetchAiAgentTotalSalesTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTotalSalesTrend'
import { fetchRevenuePerInteractionMetric } from 'pages/aiAgent/analyticsAiAgent/hooks/useRevenuePerInteractionMetric'
import { fetchShoppingAssistantPerformanceByEngagementFeatureAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantPerformanceByEngagementFeatureMetrics'
import { fetchShoppingAssistantTopProductsAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useShoppingAssistantTopProductsMetrics'
import {
    fetchConfigurableBarChartDownloadData,
    fetchConfigurableLineChartDownloadData,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { STATS_ROUTES } from 'routes/constants'

export enum AnalyticsAiAgentShoppingAssistantChart {
    TotalSalesCard = 'revamp-ai_agent_shopping_assistant-total_sales_card',
    OrdersInfluencedCard = 'revamp-ai_agent_shopping_assistant-orders_influenced_card',
    AutomatedInteractionsCard = 'revamp-ai_agent_shopping_assistant-automated_interactions_card',
    RevenuePerInteractionCard = 'revamp-ai_agent_shopping_assistant-revenue_per_interaction_card',
    AverageDiscountAmountCard = 'revamp-ai_agent_shopping_assistant-average_discount_amount_card',
    AverageOrderValueCard = 'revamp-ai_agent_shopping_assistant-average_order_value_card',
    DiscountUsageCard = 'revamp-ai_agent_shopping_assistant-discount_usage_card',
    DiscountCodesAppliedCard = 'revamp-ai_agent_shopping_assistant-discount_codes_applied_card',
    DiscountsOfferedCard = 'revamp-ai_agent_shopping_assistant-discounts_offered_card',
    MedianPurchaseTimeCard = 'revamp-ai_agent_shopping_assistant-median_purchase_time_card',
    BuyThroughRateCard = 'revamp-ai_agent_shopping_assistant-buy_through_rate_card',
    ConversionRateCard = 'revamp-ai_agent_shopping_assistant-conversion_rate_card',
    ClickThroughRateCard = 'revamp-ai_agent_shopping_assistant-click_through_rate_card',
    SuccessRateCard = 'revamp-ai_agent_shopping_assistant-success_rate_card',
    ProductRecommendationsCard = 'revamp-ai_agent_shopping_assistant-product_recommendations_card',
    HandoverInteractionsCard = 'revamp-ai_agent_shopping_assistant-handover_interactions_card',
    ConfigurableBarGraph = 'revamp-ai_agent_shopping_assistant-configurable_bar_graph',
    ConfigurableLineGraph = 'revamp-ai_agent_shopping_assistant-configurable_line_graph',
    ChannelPerformanceTable = 'revamp-ai_agent_shopping_assistant-channel_performance_table',
    EngagementFeaturePerformanceTable = 'revamp-ai_agent_shopping_assistant-engagement_feature_performance_table',
    TopProductsPerformanceTable = 'revamp-ai_agent_shopping_assistant-top_products_performance_table',
}

export const AnalyticsAiAgentShoppingAssistantReportConfig: ReportConfig<AnalyticsAiAgentShoppingAssistantChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsShoppingAssistant,
        reportName: 'AI Agent Analytics Shopping Assistant',
        reportPath: STATS_ROUTES.AI_AGENT,
        charts: {
            [AnalyticsAiAgentShoppingAssistantChart.TotalSalesCard]: {
                chartComponent: AnalyticsAiAgentTotalSalesCard,
                label: 'Total sales',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentTotalSalesTrend,
                        metricFormat: 'currency-precision-1',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.totalSales,
                chartType: ChartType.Card,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard]: {
                chartComponent: AnalyticsAiAgentOrdersInfluencedCard,
                label: 'Orders influenced',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentOrdersInfluencedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.ordersInfluenced,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.AutomatedInteractionsCard]:
                {
                    chartComponent:
                        AnalyticsAiAgentShoppingAssistantAutomatedInteractionsCard,
                    label: 'Automated interactions',
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: fetchAiAgentShoppingAssistantAutomatedInteractionsTrend,
                            metricFormat: 'decimal',
                        },
                    ],
                    tooltipConfig:
                        METRIC_TOOLTIPS.automatedInteractionsInAiAgent,
                    chartType: ChartType.Card,
                    metricFormat: 'decimal',
                    interpretAs: 'more-is-better',
                },
            [AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard]:
                {
                    chartComponent: AnalyticsAiAgentRevenuePerInteractionCard,
                    label: 'Revenue per interaction',
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: fetchRevenuePerInteractionMetric,
                            metricFormat: 'currency-precision-1',
                        },
                    ],
                    tooltipConfig: METRIC_TOOLTIPS.revenuePerInteraction,
                    chartType: ChartType.Card,
                    metricFormat: 'currency-precision-1',
                    interpretAs: 'more-is-better',
                },
            [AnalyticsAiAgentShoppingAssistantChart.AverageDiscountAmountCard]:
                {
                    chartComponent: AnalyticsAiAgentAverageDiscountAmountCard,
                    label: 'Average discount amount',
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: fetchAiAgentAverageDiscountAmountTrend,
                            metricFormat: 'currency',
                        },
                    ],
                    tooltipConfig: METRIC_TOOLTIPS.averageDiscountAmount,
                    chartType: ChartType.Card,
                    metricFormat: 'currency',
                    interpretAs: 'more-is-better',
                },
            [AnalyticsAiAgentShoppingAssistantChart.AverageOrderValueCard]: {
                chartComponent: AnalyticsAiAgentAverageOrderValueCard,
                label: 'Average order value',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAverageOrderValueTrend,
                        metricFormat: 'currency',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.averageOrderValue,
                chartType: ChartType.Card,
                metricFormat: 'currency',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.DiscountUsageCard]: {
                chartComponent: AnalyticsAiAgentDiscountUsageCard,
                label: 'Discount usage',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentDiscountUsageTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.discountUsage,
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.DiscountCodesAppliedCard]: {
                chartComponent: AnalyticsAiAgentDiscountCodesAppliedCard,
                label: 'Discount codes applied',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentDiscountCodesAppliedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.discountCodesApplied,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.DiscountsOfferedCard]: {
                chartComponent: AnalyticsAiAgentDiscountsOfferedCard,
                label: 'Discount offered',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentDiscountsOfferedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.discountsOffered,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.MedianPurchaseTimeCard]: {
                chartComponent: AnalyticsAiAgentMedianPurchaseTimeCard,
                label: 'Median purchase time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentMedianPurchaseTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.medianPurchaseTime,
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.BuyThroughRateCard]: {
                chartComponent: AnalyticsAiAgentBuyThroughRateCard,
                label: 'Buy through rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentBuyThroughRateTrend,
                        metricFormat: 'percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.buyThroughRate,
                chartType: ChartType.Card,
                metricFormat: 'percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ConversionRateCard]: {
                chartComponent: AnalyticsAiAgentConversionRateCard,
                label: 'Conversion rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiSalesAgentConversionRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.conversionRate,
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ClickThroughRateCard]: {
                chartComponent: AnalyticsAiAgentClickThroughRateCard,
                label: 'Click through rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchClickThroughRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.clickThroughRate,
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.SuccessRateCard]: {
                chartComponent:
                    AnalyticsAiAgentShoppingAssistantSuccessRateCard,
                label: 'Success rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentShoppingAssistantSuccessRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.successRate,
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ProductRecommendationsCard]:
                {
                    chartComponent: AnalyticsAiAgentProductRecommendationsCard,
                    label: 'Product recommendations',
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: fetchAiAgentProductRecommendationsTrend,
                            metricFormat: 'decimal',
                        },
                    ],
                    tooltipConfig: METRIC_TOOLTIPS.productRecommendations,
                    chartType: ChartType.Card,
                    metricFormat: 'decimal',
                    interpretAs: 'more-is-better',
                },
            [AnalyticsAiAgentShoppingAssistantChart.HandoverInteractionsCard]: {
                chartComponent: AnalyticsAiAgentSalesHandoverInteractionsCard,
                label: 'Handover interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSalesHandoverInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.handoverInteractionsInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ConfigurableBarGraph]: {
                chartComponent: AnalyticsShoppingAssistantConfigurableBar,
                label: 'Shopping Assistant Configurable Bar',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableBarGraph,
                        fetch: fetchConfigurableBarChartDownloadData(
                            SHOPPING_ASSISTANT_BAR_CHART_METRICS,
                        ),
                    },
                ],
                description: 'Configurable bar for shopping assistant metrics',
                chartType: ChartType.Graph,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ConfigurableLineGraph]: {
                chartComponent: AnalyticsShoppingAssistantConfigurableLine,
                label: 'Shopping Assistant Configurable Line',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableLineGraph,
                        fetch: fetchConfigurableLineChartDownloadData(
                            SHOPPING_ASSISTANT_LINE_CHART_METRICS,
                        ),
                    },
                ],
                description:
                    'Configurable line for shopping assistant metrics over time',
                chartType: ChartType.Graph,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ChannelPerformanceTable]: {
                chartComponent: ShoppingAssistantChannelTableWrapper,
                label: 'Channel',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchAiAgentSalesPerformanceByChannelAsConfigurableTable,
                    },
                ],
                description: 'Performance breakdown by channel',
                chartType: ChartType.Table,
            },
            [AnalyticsAiAgentShoppingAssistantChart.EngagementFeaturePerformanceTable]:
                {
                    chartComponent:
                        ShoppingAssistantPerformanceByEngagementFeatureTable,
                    label: 'Engagement feature',
                    csvProducer: [
                        {
                            type: DataExportFormat.ConfigurableTable,
                            fetch: fetchShoppingAssistantPerformanceByEngagementFeatureAsConfigurableTable,
                        },
                    ],
                    description:
                        SHOPPING_ASSISTANT_PERFORMANCE_BY_ENGAGEMENT_FEATURE_TABLE.description,
                    chartType: ChartType.Table,
                },
            [AnalyticsAiAgentShoppingAssistantChart.TopProductsPerformanceTable]:
                {
                    chartComponent: ShoppingAssistantTopProductsTableWrapper,
                    label: 'Top products recommended',
                    csvProducer: [
                        {
                            type: DataExportFormat.ConfigurableTable,
                            fetch: fetchShoppingAssistantTopProductsAsConfigurableTable,
                        },
                    ],
                    description: 'Performance breakdown by top products',
                    chartType: ChartType.Table,
                },
        },
        reportFilters: {
            optional: [FilterKey.Stores, FilterKey.Channels],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
