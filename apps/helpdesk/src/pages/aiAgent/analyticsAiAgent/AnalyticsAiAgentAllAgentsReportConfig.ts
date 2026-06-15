import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useAiAgentAllAgentsDecreaseInResolutionTimeTrend'
import { fetchCoverageRateTrend } from 'domains/reporting/hooks/automate/useCoverageRateTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchAiAgentAllAgentsHandoverInteractionsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useAiAgentAllAgentsHandoverInteractionsTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentCoverageRateCard } from 'pages/aiAgent/analyticsAiAgent/charts//AnalyticsAiAgentCoverageRateCard'
import { AnalyticsAiAgentAllAgentsAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsAutomatedInteractionsCard'
import { AnalyticsAiAgentAllAgentsAverageCsatCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsAverageCsatCard'
import {
    ALL_AGENTS_BAR_CHART_METRICS,
    AnalyticsAiAgentAllAgentsConfigurableBar,
} from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsConfigurableBar/AnalyticsAiAgentAllAgentsConfigurableBar'
import {
    ALL_AGENTS_LINE_CHART_METRICS,
    AnalyticsAiAgentAllAgentsConfigurableLine,
} from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsConfigurableLine/AnalyticsAiAgentAllAgentsConfigurableLine'
import { AnalyticsAiAgentAllAgentsDecreaseInFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsDecreaseInFRTCard'
import { AnalyticsAiAgentAllAgentsFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsFRTCard'
import { AnalyticsAiAgentAllAgentsHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsHandoverInteractionsCard'
import { AnalyticsAiAgentAllAgentsResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsResolutionTimeCard'
import { AnalyticsAiAgentAllAgentsSuccessRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsSuccessRateCard'
import { AnalyticsAiAgentAllAgentsTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsTimeSavedCard'
import { AnalyticsAiAgentAutomationRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomationRateCard'
import { AnalyticsAiAgentClosedTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClosedTicketsCard'
import { AnalyticsAiAgentCostSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentCostSavedCard'
import { AnalyticsAiAgentDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseInResolutionTimeCard'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import { AnalyticsAiAgentZeroTouchTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentZeroTouchTicketsCard'
import { AiAgentOutcomeTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/AiAgentOutcomeTable'
import { AI_AGENT_OUTCOME_TABLE } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentOutcomeTable/constants'
import { AllAgentsPerformanceByChannelTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByChannelTable/AllAgentsPerformanceByChannelTable'
import { AllAgentsPerformanceByIntentTable } from 'pages/aiAgent/analyticsAiAgent/components/AllAgentsPerformanceByIntentTable/AllAgentsPerformanceByIntentTable'
import { fetchAiAgentAllAgentsAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomatedInteractionsTrend'
import { fetchAiAgentAllAgentsAutomationRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomationRateTrend'
import { fetchAiAgentAllAgentsAverageCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAverageCsatTrend'
import { fetchAiAgentAllAgentsCostSavedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsCostSavedTrend'
import { fetchAiAgentAllAgentsDecreaseInFRTTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsDecreaseInFRTTrend'
import { fetchAiAgentAllAgentsFRTTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsFRTTrend'
import { fetchAiAgentAllAgentsResolutionTimeTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsResolutionTimeTrend'
import { fetchAiAgentAllAgentsSuccessRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsSuccessRateTrend'
import { fetchAiAgentClosedTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentClosedTicketsTrend'
import { fetchAiAgentOutcomeAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentOutcomeMetrics'
import { fetchAiAgentAllAgentsTimeSavedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTimeSavedMetric'
import { fetchAiAgentTotalSalesTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTotalSalesTrend'
import { fetchAiAgentZeroTouchTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentZeroTouchTicketsTrend'
import { fetchAllAgentsPerformanceByChannelAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'
import { fetchAllAgentsPerformanceByIntentAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics'
import { AI_AGENT_CHART_ID_PREFIX } from 'pages/aiAgent/constants'
import {
    fetchConfigurableBarChartDownloadData,
    fetchConfigurableLineChartDownloadData,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsAiAgentConversionRateCard } from './charts/AnalyticsAiAgentConversionRateCard'
import { fetchAiSalesAgentConversionRateTrend } from './charts/useAiSalesAgentConversionRateTrend'

export const AnalyticsAiAgentAllAgentsChart = {
    AutomationRateCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-automation_rate_card`,
    AutomatedInteractionsCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-automated_interactions_card`,
    ConversionRateCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-conversion_rate_card`,
    TotalSalesCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-total_sales_card`,
    TimeSavedCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-time_saved_card`,
    ZeroTouchTicketsCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-zero_touch_tickets_card`,
    AverageCsatCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-csat_card`,
    CoverageRateCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-coverage_rate_card`,
    ClosedTicketsCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-closed_tickets_card`,
    HandoverInteractionsCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-handover_interactions_card`,
    CostSavedCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-cost_saved_card`,
    DecreaseInResolutionTimeCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-decrease_in_resolution_time_card`,
    DecreaseInFRTCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-decrease_in_frt_card`,
    SuccessRateCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-success_rate_card`,
    FRTCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-frt_card`,
    ResolutionTimeCard: `${AI_AGENT_CHART_ID_PREFIX}all_agents-resolution_time_card`,
    ConfigurableBarGraph: `${AI_AGENT_CHART_ID_PREFIX}all_agents-configurable_bar_graph`,
    ConfigurableLineGraph: `${AI_AGENT_CHART_ID_PREFIX}all_agents-configurable_line_graph`,
    ChannelPerformanceTable: `${AI_AGENT_CHART_ID_PREFIX}all_agents-channel_performance_table`,
    IntentPerformanceTable: `${AI_AGENT_CHART_ID_PREFIX}all_agents-intent_performance_table`,
    AiAgentOutcomeTable: `${AI_AGENT_CHART_ID_PREFIX}all_agents-ai_agent_outcome_table`,
} as const

export type AnalyticsAiAgentAllAgentsChart =
    (typeof AnalyticsAiAgentAllAgentsChart)[keyof typeof AnalyticsAiAgentAllAgentsChart]

export const AnalyticsAiAgentAllAgentsReportConfig: ReportConfig<AnalyticsAiAgentAllAgentsChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsAllAgents,
        reportName: 'All Agents',
        reportPath: STATS_ROUTES.AI_AGENT,
        charts: {
            [AnalyticsAiAgentAllAgentsChart.AutomationRateCard]: {
                chartComponent: AnalyticsAiAgentAutomationRateCard,
                label: 'AI Agent automation rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsAutomationRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.aiAgentAutomationRate,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard]: {
                chartComponent:
                    AnalyticsAiAgentAllAgentsAutomatedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsAutomatedInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.automatedInteractionsInAiAgent,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ConversionRateCard]: {
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
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.TotalSalesCard]: {
                chartComponent: AnalyticsAiAgentTotalSalesCard,
                label: 'Revenue influenced',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentTotalSalesTrend,
                        metricFormat: 'currency-precision-1',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.totalSales,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.TimeSavedCard]: {
                chartComponent: AnalyticsAiAgentAllAgentsTimeSavedCard,
                label: 'Time saved by agents',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsTimeSavedTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.timeSavedByAgentsInAiAgent,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ZeroTouchTicketsCard]: {
                chartComponent: AnalyticsAiAgentZeroTouchTicketsCard,
                label: 'Zero touch tickets',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentZeroTouchTicketsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.zeroTouchTickets,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.AverageCsatCard]: {
                chartComponent: AnalyticsAiAgentAllAgentsAverageCsatCard,
                label: 'Average CSAT',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsAverageCsatTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.averageCsat,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.CoverageRateCard]: {
                chartComponent: AnalyticsAiAgentCoverageRateCard,
                label: 'Coverage rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchCoverageRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.coverageRate,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ClosedTicketsCard]: {
                chartComponent: AnalyticsAiAgentClosedTicketsCard,
                label: 'Closed tickets',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentClosedTicketsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.closedTickets,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.HandoverInteractionsCard]: {
                chartComponent:
                    AnalyticsAiAgentAllAgentsHandoverInteractionsCard,
                label: 'Handover interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsHandoverInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.handoverInteractionsInAiAgent,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.CostSavedCard]: {
                chartComponent: AnalyticsAiAgentCostSavedCard,
                label: 'Cost saved',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsCostSavedTrend,
                        metricFormat: 'currency-precision-1',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.costSaved,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.DecreaseInResolutionTimeCard]: {
                chartComponent: AnalyticsAiAgentDecreaseInResolutionTimeCard,
                label: 'Decrease in resolution time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig:
                    METRIC_TOOLTIPS.decreaseInResolutionTimeInAiAgent,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.DecreaseInFRTCard]: {
                chartComponent: AnalyticsAiAgentAllAgentsDecreaseInFRTCard,
                label: 'Decrease in first response time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsDecreaseInFRTTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.decreaseInFRTInAiAgent,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.SuccessRateCard]: {
                chartComponent: AnalyticsAiAgentAllAgentsSuccessRateCard,
                label: 'Success rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsSuccessRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.successRate,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.FRTCard]: {
                chartComponent: AnalyticsAiAgentAllAgentsFRTCard,
                label: 'First response time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsFRTTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.firstResponseTimeInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ResolutionTimeCard]: {
                chartComponent: AnalyticsAiAgentAllAgentsResolutionTimeCard,
                label: 'Resolution time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsResolutionTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.resolutionTimeInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ConfigurableBarGraph]: {
                chartComponent: AnalyticsAiAgentAllAgentsConfigurableBar,
                label: 'All Agents Configurable Bar',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableBarGraph,
                        fetch: fetchConfigurableBarChartDownloadData(
                            ALL_AGENTS_BAR_CHART_METRICS,
                        ),
                    },
                ],
                description: 'Configurable bar for all AI agent metrics',
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ConfigurableLineGraph]: {
                chartComponent: AnalyticsAiAgentAllAgentsConfigurableLine,
                label: 'All Agents Configurable Line',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableLineGraph,
                        fetch: fetchConfigurableLineChartDownloadData(
                            ALL_AGENTS_LINE_CHART_METRICS,
                        ),
                    },
                ],
                description:
                    'Configurable line for all AI agent metrics over time',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable]: {
                chartComponent: AllAgentsPerformanceByChannelTable,
                label: 'Channel',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchAllAgentsPerformanceByChannelAsConfigurableTable,
                    },
                ],
                description: 'Performance breakdown by channel',
                chartType: ChartType.Table,
            },
            [AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable]: {
                chartComponent: AllAgentsPerformanceByIntentTable,
                label: 'Intent',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchAllAgentsPerformanceByIntentAsConfigurableTable,
                    },
                ],
                description: 'Performance breakdown by intent',
                chartType: ChartType.Table,
            },
            [AnalyticsAiAgentAllAgentsChart.AiAgentOutcomeTable]: {
                chartComponent: AiAgentOutcomeTable,
                label: AI_AGENT_OUTCOME_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchAiAgentOutcomeAsConfigurableTable,
                    },
                ],
                description: AI_AGENT_OUTCOME_TABLE.description,
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [FilterKey.Stores, FilterKey.Channels],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
