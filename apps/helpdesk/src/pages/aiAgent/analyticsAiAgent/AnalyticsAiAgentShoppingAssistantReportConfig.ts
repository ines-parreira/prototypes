import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchDiscountCodesAppliedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAppliedTrend'
import { fetchDiscountCodesAverageValueTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesAverageValueTrend'
import { fetchDiscountCodesOfferedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesOfferedTrend'
import { fetchDiscountCodesRateAppliedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useDiscountCodesRateAppliedTrend'
import { fetchGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { fetchMedianPurchaseTimeTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useMedianPerchaseTimeTrend'
import { fetchTotalNumberOfOrdersTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import { fetchTotalNumberOfSalesConversationsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { fetchTotalSalePerInteractionTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalSalePerInteractionTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentAverageDiscountAmountCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAverageDiscountAmountCard'
import { AnalyticsShoppingAssistantComboChart } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentComboChart/AnalyticsShoppingAssistantComboChart'
import { AnalyticsAiAgentDiscountCodesAppliedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountCodesAppliedCard'
import { AnalyticsAiAgentDiscountsOfferedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountsOfferedCard'
import { AnalyticsAiAgentDiscountUsageCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDiscountUsageCard'
import { AnalyticsShoppingAssistantLineChart } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentLineChart/AnalyticsShoppingAssistantLineChart'
import { AnalyticsAiAgentMedianPurchaseTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentMedianPurchaseTimeCard'
import { AnalyticsAiAgentOrdersInfluencedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentOrdersInfluencedCard'
import { AnalyticsShoppingAssistantPerformanceTable } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentPerformanceTable/AnalyticsShoppingAssistantPerformanceTable'
import { AnalyticsAiAgentResolvedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentResolvedInteractionsCard'
import { AnalyticsAiAgentRevenuePerInteractionCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentRevenuePerInteractionCard'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import { STATS_ROUTES } from 'routes/constants'

// Mock fetch functions - these will be replaced with real data fetchers later
const fetchShoppingAssistantTrendBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'shopping-assistant-breakdown.csv',
        files: {},
    }) as any
const fetchShoppingAssistantTrendData = async () =>
    ({
        isLoading: false,
        fileName: 'shopping-assistant-trend.csv',
        files: {},
    }) as any
const fetchPerformanceBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'performance-breakdown.csv',
        files: {},
    }) as any

export enum AnalyticsAiAgentShoppingAssistantChart {
    TotalSalesCard = 'total_sales_card',
    OrdersInfluencedCard = 'orders_influenced_card',
    ResolvedInteractionsCard = 'resolved_interactions_card',
    RevenuePerInteractionCard = 'revenue_per_interaction_card',
    AverageDiscountAmountCard = 'average_discount_amount_card',
    DiscountUsageCard = 'discount_usage_card',
    DiscountCodesAppliedCard = 'discount_codes_applied_card',
    DiscountsOfferedCard = 'discounts_offered_card',
    MedianPurchaseTimeCard = 'median_purchase_time_card',
    ShoppingAssistantTrendComboChart = 'shopping_assistant_trend_combo_chart',
    ShoppingAssistantTrendLineChart = 'shopping_assistant_trend_line_chart',
    PerformanceTable = 'performance_table',
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
                        fetch: fetchGmvInfluencedTrend,
                        metricFormat: 'currency-precision-1',
                    },
                ],
                description:
                    'The revenue influenced by a Shopping Assistant interaction, measured from orders placed within 3 days of the interaction',
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
                        fetch: fetchTotalNumberOfOrdersTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'The number of orders placed within 3 days of a Shopping Assistant conversation without a direct handover.',
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ResolvedInteractionsCard]: {
                chartComponent: AnalyticsAiAgentResolvedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTotalNumberOfSalesConversationsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'The number of interactions handled by Shopping Assistant in which the customer left without asking to talk to a human agent.',
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard]:
                {
                    chartComponent: AnalyticsAiAgentRevenuePerInteractionCard,
                    label: 'Total sale per interaction',
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: fetchTotalSalePerInteractionTrend,
                            metricFormat: 'currency-precision-1',
                        },
                    ],
                    description:
                        'The average total sale generated from each Shopping Assistant interaction.',
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
                            fetch: fetchDiscountCodesAverageValueTrend,
                            metricFormat: 'currency',
                        },
                    ],
                    description:
                        'The average discount ($) generated by Shopping Assistant and applied by customers.',
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
                        fetch: fetchDiscountCodesRateAppliedTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                description:
                    'The percentage of discounts generated and sent by Shopping Assistant that customers apply.',
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
                        fetch: fetchDiscountCodesAppliedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'The number of purchases placed using discount codes generated and sent by Shopping Assistant.',
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
                        fetch: fetchDiscountCodesOfferedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'The number of discount codes generated and sent by Shopping Assistant.',
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
                        fetch: fetchMedianPurchaseTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                description:
                    'Median duration between automated interaction with Shopping assistant and order placed.',
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendComboChart]:
                {
                    chartComponent: AnalyticsShoppingAssistantComboChart,
                    label: 'Total sales',
                    csvProducer: [
                        {
                            type: DataExportFormat.Table,
                            fetch: fetchShoppingAssistantTrendBreakdown,
                        },
                    ],
                    description: 'Breakdown of total sales by product',
                    chartType: ChartType.Graph,
                    metricFormat: 'currency-precision-1',
                    interpretAs: 'more-is-better',
                },
            [AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendLineChart]:
                {
                    chartComponent: AnalyticsShoppingAssistantLineChart,
                    label: 'Total sales',
                    csvProducer: [
                        {
                            type: DataExportFormat.Table,
                            fetch: fetchShoppingAssistantTrendData,
                        },
                    ],
                    description: 'Total sales trend over time',
                    chartType: ChartType.Graph,
                    metricFormat: 'currency-precision-1',
                    interpretAs: 'more-is-better',
                },
            [AnalyticsAiAgentShoppingAssistantChart.PerformanceTable]: {
                chartComponent: AnalyticsShoppingAssistantPerformanceTable,
                label: 'Performance breakdown',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchPerformanceBreakdown,
                    },
                ],
                description: 'Performance breakdown by Shopping Assistant',
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
