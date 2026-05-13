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
import { AnalyticsAiAgentAllAgentsHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsHandoverInteractionsCard'
import { AnalyticsAiAgentAllAgentsSuccessRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsSuccessRateCard'
import { AnalyticsAiAgentAllAgentsTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsTimeSavedCard'
import { AnalyticsAiAgentAutomationRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomationRateCard'
import { AnalyticsAiAgentClosedTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClosedTicketsCard'
import { AnalyticsAiAgentCostSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentCostSavedCard'
import { AnalyticsAiAgentDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseInResolutionTimeCard'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import { AnalyticsAiAgentZeroTouchTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentZeroTouchTicketsCard'
import { ChannelPerformanceBreakdownTableWrapper } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ChannelPerformanceBreakdownTableWrapper'
import { IntentPerformanceBreakdownTableWrapper } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTableWrapper'
import { fetchAiAgentAllAgentsAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomatedInteractionsTrend'
import { fetchAiAgentAllAgentsAutomationRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAutomationRateTrend'
import { fetchAiAgentAllAgentsAverageCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsAverageCsatTrend'
import { fetchAiAgentAllAgentsCostSavedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsCostSavedTrend'
import { fetchAiAgentAllAgentsDecreaseInFRTTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsDecreaseInFRTTrend'
import { fetchAiAgentAllAgentsSuccessRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsSuccessRateTrend'
import { fetchAiAgentClosedTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentClosedTicketsTrend'
import { fetchAiAgentAllAgentsTimeSavedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTimeSavedMetric'
import { fetchAiAgentTotalSalesTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentTotalSalesTrend'
import { fetchAiAgentZeroTouchTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentZeroTouchTicketsTrend'
import { fetchAllAgentsPerformanceByChannelAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByChannelMetrics'
import { fetchAllAgentsPerformanceByIntentAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useAllAgentsPerformanceByIntentMetrics'
import {
    fetchConfigurableBarChartDownloadData,
    fetchConfigurableLineChartDownloadData,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsAiAgentConversionRateCard } from './charts/AnalyticsAiAgentConversionRateCard'
import { fetchAiSalesAgentConversionRateTrend } from './charts/useAiSalesAgentConversionRateTrend'

export enum AnalyticsAiAgentAllAgentsChart {
    AutomationRateCard = 'revamp-ai_agent_all_agents-automation_rate_card',
    AutomatedInteractionsCard = 'revamp-ai_agent_all_agents-automated_interactions_card',
    ConversionRateCard = 'revamp-ai_agent_all_agents-conversion_rate_card',
    TotalSalesCard = 'revamp-ai_agent_all_agents-total_sales_card',
    TimeSavedCard = 'revamp-ai_agent_all_agents-time_saved_card',
    ZeroTouchTicketsCard = 'revamp-ai_agent_all_agents-zero_touch_tickets_card',
    AverageCsatCard = 'revamp-ai_agent_all_agents-csat_card',
    CoverageRateCard = 'revamp-ai_agent_all_agents-coverage_rate_card',
    ClosedTicketsCard = 'revamp-ai_agent_all_agents-closed_tickets_card',
    HandoverInteractionsCard = 'revamp-ai_agent_all_agents-handover_interactions_card',
    CostSavedCard = 'revamp-ai_agent_all_agents-cost_saved_card',
    DecreaseInResolutionTimeCard = 'revamp-ai_agent_all_agents-decrease_in_resolution_time_card',
    DecreaseInFRTCard = 'revamp-ai_agent_all_agents-decrease_in_frt_card',
    SuccessRateCard = 'revamp-ai_agent_all_agents-success_rate_card',
    ConfigurableBarGraph = 'revamp-ai_agent_all_agents-configurable_bar_graph',
    ConfigurableLineGraph = 'revamp-ai_agent_all_agents-configurable_line_graph',
    ChannelPerformanceTable = 'revamp-ai_agent_all_agents-channel_performance_table',
    IntentPerformanceTable = 'revamp-ai_agent_all_agents-intent_performance_table',
}

export const AnalyticsAiAgentAllAgentsReportConfig: ReportConfig<AnalyticsAiAgentAllAgentsChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsAllAgents,
        reportName: 'AI Agent Analytics All Agents',
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.TotalSalesCard]: {
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                tooltipConfig: METRIC_TOOLTIPS.averageCsatInAiAgent,
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
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
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
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
                chartComponent: ChannelPerformanceBreakdownTableWrapper,
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
                chartComponent: IntentPerformanceBreakdownTableWrapper,
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
        },
        reportFilters: {
            optional: [FilterKey.Stores, FilterKey.Channels],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
