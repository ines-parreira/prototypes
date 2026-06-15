import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { fetchAutomationCostSavedTrend } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
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
import { AnalyticsOverviewCostSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsOverviewDecreaseInFRTCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInFRTCard'
import { AnalyticsOverviewDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInResolutionTimeCard'
import { AnalyticsOverviewOverallAutomationRateCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewOverallAutomationRateCard'
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
import { STORE_INTEGRATION_TABLE } from 'pages/aiAgent/analyticsOverview/components/StoreIntegrationTable/columns'
import { StoreIntegrationTable } from 'pages/aiAgent/analyticsOverview/components/StoreIntegrationTable/StoreIntegrationTable'
import { fetchAiAgentOverviewDecreaseInFRTTrend } from 'pages/aiAgent/analyticsOverview/hooks/useAiAgentOverviewDecreaseInFRTTrend'
import { fetchAiAgentOverviewDecreaseInResolutionTimeTrend } from 'pages/aiAgent/analyticsOverview/hooks/useAiAgentOverviewDecreaseInResolutionTimeTrend'
import { fetchArticleRecommendationAsConfigurableTable } from 'pages/aiAgent/analyticsOverview/hooks/useArticleRecommendationMetrics'
import { fetchFlowsAsConfigurableTable } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'
import { fetchOrderManagementAsConfigurableTable } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'
import { fetchOverallAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomatedInteractionsTrend'
import { fetchOverallAutomationRateTrend } from 'pages/aiAgent/analyticsOverview/hooks/useOverallAutomationRateTrend'
import { fetchOverallTimeSavedByAgentsTrend } from 'pages/aiAgent/analyticsOverview/hooks/useOverallTimeSavedByAgentsTrend'
import { fetchPerformanceMetricsPerFeatureAsConfigurableTable } from 'pages/aiAgent/analyticsOverview/hooks/usePerformanceMetricsPerFeature'
import { fetchStoreIntegrationAsConfigurableTable } from 'pages/aiAgent/analyticsOverview/hooks/useStoreIntegrationMetrics'
import { AI_AGENT_CHART_ID_PREFIX } from 'pages/aiAgent/constants'
import {
    fetchConfigurableBarChartDownloadData,
    fetchConfigurableLineChartDownloadData,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { STATS_ROUTES } from 'routes/constants'

export const AnalyticsOverviewChart = {
    AutomationRateCard: `${AI_AGENT_CHART_ID_PREFIX}overview-automation_rate_card`,
    AutomatedInteractionsCard: `${AI_AGENT_CHART_ID_PREFIX}overview-automated_interactions_card`,
    TimeSavedCard: `${AI_AGENT_CHART_ID_PREFIX}overview-time_saved_card`,
    CostSavedCard: `${AI_AGENT_CHART_ID_PREFIX}overview-cost_saved_card`,
    DecreaseInResolutionTimeCard: `${AI_AGENT_CHART_ID_PREFIX}overview-decrease_in_resolution_time_card`,
    ConfigurableBarGraph: `${AI_AGENT_CHART_ID_PREFIX}overview-configurable_bar_graph`,
    ConfigurableLineGraph: `${AI_AGENT_CHART_ID_PREFIX}overview-configurable_line_graph`,
    PerformanceTable: `${AI_AGENT_CHART_ID_PREFIX}overview-performance_table`,
    OrderManagementTable: `${AI_AGENT_CHART_ID_PREFIX}overview-order_management_table`,
    FlowsTable: `${AI_AGENT_CHART_ID_PREFIX}overview-flows_table`,
    ArticleRecommendationTable: `${AI_AGENT_CHART_ID_PREFIX}overview-article_recommendation_table`,
    HandoverInteractionsCard: `${AI_AGENT_CHART_ID_PREFIX}overview-handover_interactions_card`,
    DecreaseInFRTCard: `${AI_AGENT_CHART_ID_PREFIX}overview-decrease_in_frt_card`,
    StoreIntegrationTable: `${AI_AGENT_CHART_ID_PREFIX}overview-store_integration_table`,
} as const

export type AnalyticsOverviewChart =
    (typeof AnalyticsOverviewChart)[keyof typeof AnalyticsOverviewChart]

export const AnalyticsOverviewReportConfig: ReportConfig<AnalyticsOverviewChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsOverview,
        reportName: 'Overview',
        reportPath: STATS_ROUTES.AI_AGENT_OVERVIEW,
        charts: {
            [AnalyticsOverviewChart.AutomationRateCard]: {
                chartComponent: AnalyticsOverviewOverallAutomationRateCard,
                label: 'Overall automation rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchOverallAutomationRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.overallAutomationRate,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.AutomatedInteractionsCard]: {
                chartComponent: AnalyticsOverviewAutomatedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchOverallAutomatedInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.automatedInteractionsInOverview,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.TimeSavedCard]: {
                chartComponent: AnalyticsOverviewTimeSavedCard,
                label: 'Time saved by agents',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchOverallTimeSavedByAgentsTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.timeSavedByAgentsInOverview,
                chartType: ChartType.CardWithTimeseries,
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
                tooltipConfig: METRIC_TOOLTIPS.costSaved,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.DecreaseInResolutionTimeCard]: {
                chartComponent: AnalyticsOverviewDecreaseInResolutionTimeCard,
                label: 'Decrease in resolution time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentOverviewDecreaseInResolutionTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig:
                    METRIC_TOOLTIPS.decreaseInResolutionTimeInOverview,
                chartType: ChartType.CardWithTimeseries,
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
                tooltipConfig: METRIC_TOOLTIPS.handoverInteractionsInOverview,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [AnalyticsOverviewChart.DecreaseInFRTCard]: {
                chartComponent: AnalyticsOverviewDecreaseInFRTCard,
                label: 'Decrease in first response time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentOverviewDecreaseInFRTTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.decreaseInFRTInOverview,
                chartType: ChartType.CardWithTimeseries,
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
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchPerformanceMetricsPerFeatureAsConfigurableTable,
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
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchOrderManagementAsConfigurableTable,
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
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchFlowsAsConfigurableTable,
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
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchArticleRecommendationAsConfigurableTable,
                    },
                ],
                description: ARTICLE_RECOMMENDATION_TABLE.description,
                chartType: ChartType.Table,
            },
            [AnalyticsOverviewChart.StoreIntegrationTable]: {
                chartComponent: StoreIntegrationTable,
                label: STORE_INTEGRATION_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchStoreIntegrationAsConfigurableTable,
                    },
                ],
                description: STORE_INTEGRATION_TABLE.description,
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [FilterKey.Stores, FilterKey.Channels],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
