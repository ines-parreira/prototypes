import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { fetchTotalNumberOfOrdersTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfOrdersTrend'
import { fetchTotalNumberOfSalesConversationsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalNumberOfSalesConversationsTrend'
import { fetchTotalSalePerInteractionTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useTotalSalePerInteractionTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsShoppingAssistantComboChart } from './charts/AnalyticsAiAgentComboChart/AnalyticsShoppingAssistantComboChart'
import { AnalyticsShoppingAssistantLineChart } from './charts/AnalyticsAiAgentLineChart/AnalyticsShoppingAssistantLineChart'
import { AnalyticsAiAgentOrdersInfluencedCard } from './charts/AnalyticsAiAgentOrdersInfluencedCard'
import { AnalyticsShoppingAssistantPerformanceTable } from './charts/AnalyticsAiAgentPerformanceTable/AnalyticsShoppingAssistantPerformanceTable'
import { AnalyticsAiAgentResolvedInteractionsCard } from './charts/AnalyticsAiAgentResolvedInteractionsCard'
import { AnalyticsAiAgentRevenuePerInteractionCard } from './charts/AnalyticsAiAgentRevenuePerInteractionCard'
import { AnalyticsAiAgentTotalSalesCard } from './charts/AnalyticsAiAgentTotalSalesCard'

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
                        metricFormat: 'decimal',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentShoppingAssistantChart.OrdersInfluencedCard]: {
                chartComponent: AnalyticsAiAgentOrdersInfluencedCard,
                label: 'Orders influenced',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTotalNumberOfOrdersTrend,
                        metricFormat: 'integer',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentShoppingAssistantChart.ResolvedInteractionsCard]: {
                chartComponent: AnalyticsAiAgentResolvedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTotalNumberOfSalesConversationsTrend,
                        metricFormat: 'integer',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentShoppingAssistantChart.RevenuePerInteractionCard]:
                {
                    chartComponent: AnalyticsAiAgentRevenuePerInteractionCard,
                    label: 'Revenue per interaction',
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: fetchTotalSalePerInteractionTrend,
                            metricFormat: 'decimal',
                        },
                    ],
                    description: '',
                    chartType: ChartType.Card,
                },
            [AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendComboChart]:
                {
                    chartComponent: AnalyticsShoppingAssistantComboChart,
                    label: '',
                    csvProducer: [
                        {
                            type: DataExportFormat.Table,
                            fetch: fetchShoppingAssistantTrendBreakdown,
                        },
                    ],
                    description: '',
                    chartType: ChartType.Graph,
                },
            [AnalyticsAiAgentShoppingAssistantChart.ShoppingAssistantTrendLineChart]:
                {
                    chartComponent: AnalyticsShoppingAssistantLineChart,
                    label: '',
                    csvProducer: [
                        {
                            type: DataExportFormat.Table,
                            fetch: fetchShoppingAssistantTrendData,
                        },
                    ],
                    description: '',
                    chartType: ChartType.Graph,
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
                description: '',
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
