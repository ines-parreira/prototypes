import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { fetchAiAgentSupportAgentDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useAiAgentSupportAgentDecreaseInResolutionTimeTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchAiAgentSupportHandoverInteractionsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useAiAgentSupportHandoverInteractionsTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentDecreaseinFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseinFRTCard'
import { AnalyticsAiAgentSupportAgentAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentAutomatedInteractionsCard'
import { AnalyticsAiAgentSupportAgentCsatCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentCsatCard'
import { AnalyticsAiAgentSupportAgentSuccessRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentSuccessRateCard'
import { AnalyticsAiAgentSupportAgentTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentTimeSavedCard'
import {
    AnalyticsAiAgentSupportConfigurableBar,
    SUPPORT_BAR_CHART_METRICS,
} from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportConfigurableBar/AnalyticsAiAgentSupportConfigurableBar'
import {
    AnalyticsAiAgentSupportConfigurableLine,
    SUPPORT_LINE_CHART_METRICS,
} from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportConfigurableLine/AnalyticsAiAgentSupportConfigurableLine'
import { AnalyticsAiAgentSupportCostSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportCostSavedCard'
import { AnalyticsAiAgentSupportHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportHandoverInteractionsCard'
import { AnalyticsSupportAgentDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsSupportAgentDecreaseInResolutionTimeCard'
import { SupportAgentChannelPerformanceBreakdownTableWrapper } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/SupportAgentChannelPerformanceBreakdownTableWrapper'
import { SupportAgentIntentPerformanceBreakdownTableWrapper } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/SupportAgentIntentPerformanceBreakdownTableWrapper'
import { fetchAiAgentSupportAgentAutomatedInteractionsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentAutomatedInteractionsTrend'
import { fetchAiAgentSupportAgentAverageCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentAverageCsatTrend'
import { fetchAiAgentSupportAgentFRTTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentFRTTrend'
import { fetchAiAgentSupportAgentSuccessRateTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentSuccessRateTrend'
import { fetchAiAgentSupportAgentTimeSavedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentTimeSavedMetric'
import { fetchAiAgentSupportCostSaved } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportCostSaved'
import { fetchSupportAgentsPerformanceByChannelAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByChannelMetrics'
import { fetchSupportAgentsPerformanceByIntentAsConfigurableTable } from 'pages/aiAgent/analyticsAiAgent/hooks/useSupportAgentsPerformanceByIntentMetrics'
import {
    fetchConfigurableBarChartDownloadData,
    fetchConfigurableLineChartDownloadData,
} from 'pages/aiAgent/utils/aiAgentMetrics.utils'
import { STATS_ROUTES } from 'routes/constants'

export enum AnalyticsAiAgentSupportAgentChart {
    TimeSavedCard = 'revamp-ai_agent_support_agent-time_saved_card',
    CostSavedCard = 'revamp-ai_agent_support_agent-cost_saved_card',
    SupportInteractionsCard = 'revamp-ai_agent_support_agent-support_interactions_card',
    DecreaseInFRTCard = 'revamp-ai_agent_support_agent-decrease_in_frt_card',
    DecreaseInResolutionTimeCard = 'revamp-ai_agent_support_agent-decrease_in_resolution_time_card',
    AverageCsatCard = 'revamp-ai_agent_support_agent-csat_card',
    HandoverInteractionsCard = 'revamp-ai_agent_support_agent-handover_interactions_card',
    SuccessRateCard = 'revamp-ai_agent_support_agent-success_rate_card',
    ConfigurableBarGraph = 'revamp-ai_agent_support_agent-configurable_bar_graph',
    ConfigurableLineGraph = 'revamp-ai_agent_support_agent-configurable_line_graph',
    ChannelPerformanceTable = 'revamp-ai_agent_support_agent-channel_performance_table',
    IntentPerformanceTable = 'revamp-ai_agent_support_agent-intent_performance_table',
}

export const AnalyticsAiAgentSupportAgentReportConfig: ReportConfig<AnalyticsAiAgentSupportAgentChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsSupportAgent,
        reportName: 'AI Agent Analytics Support Agent',
        reportPath: STATS_ROUTES.AI_AGENT,
        charts: {
            [AnalyticsAiAgentSupportAgentChart.TimeSavedCard]: {
                chartComponent: AnalyticsAiAgentSupportAgentTimeSavedCard,
                label: 'Time saved by agents',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportAgentTimeSavedTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.timeSavedByAgentsInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.CostSavedCard]: {
                chartComponent: AnalyticsAiAgentSupportCostSavedCard,
                label: 'Cost saved',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportCostSaved,
                        metricFormat: 'currency-precision-1',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.costSaved,
                chartType: ChartType.Card,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard]: {
                chartComponent:
                    AnalyticsAiAgentSupportAgentAutomatedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportAgentAutomatedInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.automatedInteractionsInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.DecreaseInFRTCard]: {
                chartComponent: AnalyticsAiAgentDecreaseinFRTCard,
                label: 'Decrease in first response time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportAgentFRTTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.decreaseInFRTInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.DecreaseInResolutionTimeCard]: {
                chartComponent:
                    AnalyticsSupportAgentDecreaseInResolutionTimeCard,
                label: 'Decrease in resolution time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportAgentDecreaseInResolutionTimeTrend,
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig:
                    METRIC_TOOLTIPS.decreaseInResolutionTimeInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.AverageCsatCard]: {
                chartComponent: AnalyticsAiAgentSupportAgentCsatCard,
                label: 'Average CSAT',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportAgentAverageCsatTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.averageCsat,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.HandoverInteractionsCard]: {
                chartComponent: AnalyticsAiAgentSupportHandoverInteractionsCard,
                label: 'Handover interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportHandoverInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.handoverInteractionsInAiAgent,
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.SuccessRateCard]: {
                chartComponent: AnalyticsAiAgentSupportAgentSuccessRateCard,
                label: 'Success rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportAgentSuccessRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.successRate,
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.ConfigurableBarGraph]: {
                chartComponent: AnalyticsAiAgentSupportConfigurableBar,
                label: 'Support Agent Configurable Bar',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableBarGraph,
                        fetch: fetchConfigurableBarChartDownloadData(
                            SUPPORT_BAR_CHART_METRICS,
                        ),
                    },
                ],
                description: 'Configurable bar for support agent metrics',
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.ConfigurableLineGraph]: {
                chartComponent: AnalyticsAiAgentSupportConfigurableLine,
                label: 'Support Agent Configurable Line',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableLineGraph,
                        fetch: fetchConfigurableLineChartDownloadData(
                            SUPPORT_LINE_CHART_METRICS,
                        ),
                    },
                ],
                description: 'Configurable line for support agent metrics',
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.ChannelPerformanceTable]: {
                chartComponent:
                    SupportAgentChannelPerformanceBreakdownTableWrapper,
                label: 'Channel',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchSupportAgentsPerformanceByChannelAsConfigurableTable,
                    },
                ],
                description: 'Performance breakdown by channel',
                chartType: ChartType.Table,
            },
            [AnalyticsAiAgentSupportAgentChart.IntentPerformanceTable]: {
                chartComponent:
                    SupportAgentIntentPerformanceBreakdownTableWrapper,
                label: 'Intent',
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchSupportAgentsPerformanceByIntentAsConfigurableTable,
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
