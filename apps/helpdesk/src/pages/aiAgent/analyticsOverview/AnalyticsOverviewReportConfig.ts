import { fetchFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { fetchAutomationCostSavedTrend } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { fetchAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { fetchDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { fetchDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { fetchTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchHandoverInteractionsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useHandoverInteractionsTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentHandoverInteractionsCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsAiAgentHandoverInteractionsCard'
import { AnalyticsOverviewAutomatedInteractionsCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsCard'
import { AnalyticsOverviewAutomationRateCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomationRateCard'
import { AnalyticsOverviewCostSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsOverviewDecreaseInFRTCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInFRTCard'
import { AnalyticsOverviewDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInResolutionTimeCard'
import { AnalyticsOverviewTimeSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewTimeSavedCard'
import {
    AnalyticsOverviewConfigurableBarGraph,
    OVERVIEW_BAR_CHART_METRICS,
} from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewConfigurableBarGraph/AnalyticsOverviewConfigurableBarGraph'
import {
    AnalyticsOverviewConfigurableLineGraph,
    OVERVIEW_LINE_CHART_METRICS,
} from 'pages/aiAgent/analyticsOverview/components/AnalyticsOverviewConfigurableLineGraph/AnalyticsOverviewConfigurableLineGraph'
import { ArticleRecommendationTable } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/ArticleRecommendationTable'
import { ARTICLE_RECOMMENDATION_TABLE } from 'pages/aiAgent/analyticsOverview/components/ArticleRecommendationTable/columns'
import { FLOWS_TABLE } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'
import { FlowsTable } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/FlowsTable'
import { ORDER_MANAGEMENT_TABLE } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { OrderManagementTable } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/OrderManagementTable'
import { PERFORMANCE_BREAKDOWN_TABLE } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { PerformanceBreakdownTable } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable'
import { fetchPerformanceMetricsPerFeatureReport } from 'pages/aiAgent/analyticsOverview/hooks/fetchPerformanceBreakdownData'
import { fetchArticleRecommendationReport } from 'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics'
import { fetchFlowsReport } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'
import { fetchOrderManagementReport } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'
import {
    fetchConfigurableBarChartDownloadData,
    fetchConfigurableLineChartDownloadData,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { STATS_ROUTES } from 'routes/constants'

export enum AnalyticsOverviewChart {
    AutomationRateCard = 'automation_rate_card',
    AutomatedInteractionsCard = 'automated_interactions_card',
    TimeSavedCard = 'time_saved_card',
    CostSavedCard = 'cost_saved_card',
    DecreaseInResolutionTimeCard = 'decrease_in_resolution_time_card',
    ConfigurableBarGraph = 'configurable_bar_graph',
    ConfigurableLineGraph = 'configurable_line_graph',
    PerformanceTable = 'performance_table',
    OrderManagementTable = 'order_management_table',
    FlowsTable = 'flows_table',
    ArticleRecommendationTable = 'article_recommendation_table',
    HandoverInteractionsCard = 'handover_interactions_card',
    DecreaseInFRTCard = 'decrease_in_frt_card',
}

export const AnalyticsOverviewReportConfig: ReportConfig<AnalyticsOverviewChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsOverview,
        reportName: 'AI Agent Analytics Overview',
        reportPath: STATS_ROUTES.AI_AGENT_OVERVIEW,
        charts: {
            [AnalyticsOverviewChart.AutomationRateCard]: {
                chartComponent: AnalyticsOverviewAutomationRateCard,
                label: 'Overall automation rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAutomationRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                description:
                    'The number of interactions automated and billed by an automation features as a % of total billed customer interactions (automated or not).',
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.AutomatedInteractionsCard]: {
                chartComponent: AnalyticsOverviewAutomatedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchFilteredAutomatedInteractions,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'The number of fully automated interactions solved without any human agent intervention.',
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.TimeSavedCard]: {
                chartComponent: AnalyticsOverviewTimeSavedCard,
                label: 'Time saved by agents',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTimeSavedByAgentsTrend,
                        metricFormat: 'duration',
                    },
                ],
                description:
                    'The time agent would have spent resolving customer inquiries without all automation features.',
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.CostSavedCard]: {
                chartComponent: AnalyticsOverviewCostSavedCard,
                label: 'Cost saved',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAutomationCostSavedTrend,
                        metricFormat: 'currency-precision-1',
                    },
                ],
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
                chartType: ChartType.Card,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.DecreaseInResolutionTimeCard]: {
                chartComponent: AnalyticsOverviewDecreaseInResolutionTimeCard,
                label: 'Decrease in resolution time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchDecreaseInResolutionTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                description:
                    'The reduction in the average time to resolve a ticket when AI Agent is used, compared with tickets resolved manually by support agents.',
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.HandoverInteractionsCard]: {
                chartComponent: AnalyticsAiAgentHandoverInteractionsCard,
                label: 'Handover interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchHandoverInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [AnalyticsOverviewChart.DecreaseInFRTCard]: {
                chartComponent: AnalyticsOverviewDecreaseInFRTCard,
                label: 'Decrease in first response time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchDecreaseInFirstResponseTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                description:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.ConfigurableBarGraph]: {
                chartComponent: AnalyticsOverviewConfigurableBarGraph,
                label: 'Configurable bar graph',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableBarGraph,
                        fetch: fetchConfigurableBarChartDownloadData(
                            OVERVIEW_BAR_CHART_METRICS,
                        ),
                    },
                ],
                description: 'Breakdown of different metrics',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.ConfigurableLineGraph]: {
                chartComponent: AnalyticsOverviewConfigurableLineGraph,
                label: 'Configurable line graph',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableLineGraph,
                        fetch: fetchConfigurableLineChartDownloadData(
                            OVERVIEW_LINE_CHART_METRICS,
                        ),
                    },
                ],
                description: 'Breakdown of different metrics over time',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.PerformanceTable]: {
                chartComponent: PerformanceBreakdownTable,
                label: PERFORMANCE_BREAKDOWN_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchPerformanceMetricsPerFeatureReport,
                    },
                ],
                description: PERFORMANCE_BREAKDOWN_TABLE.description,
                chartType: ChartType.Table,
            },
            [AnalyticsOverviewChart.OrderManagementTable]: {
                chartComponent: OrderManagementTable,
                label: ORDER_MANAGEMENT_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchOrderManagementReport,
                    },
                ],
                description: ORDER_MANAGEMENT_TABLE.description,
                chartType: ChartType.Table,
            },
            [AnalyticsOverviewChart.FlowsTable]: {
                chartComponent: FlowsTable,
                label: FLOWS_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchFlowsReport,
                    },
                ],
                description: FLOWS_TABLE.description,
                chartType: ChartType.Table,
            },
            [AnalyticsOverviewChart.ArticleRecommendationTable]: {
                chartComponent: ArticleRecommendationTable,
                label: ARTICLE_RECOMMENDATION_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchArticleRecommendationReport,
                    },
                ],
                description: ARTICLE_RECOMMENDATION_TABLE.description,
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
