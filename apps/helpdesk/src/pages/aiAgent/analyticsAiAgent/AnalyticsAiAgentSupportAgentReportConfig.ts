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
    TimeSavedCard = 'time_saved_card',
    CostSavedCard = 'cost_saved_card',
    SupportInteractionsCard = 'support_interactions_card',
    DecreaseInFRTCard = 'decrease_in_first_resolution_time_card',
    DecreaseInResolutionTimeCard = 'decrease_in_resolution_time_card',
    AverageCsatCard = 'average_csat_card',
    HandoverInteractionsCard = 'handover_interactions_card',
    SuccessRateCard = 'support_agent_success_rate_card',
    ConfigurableBarGraph = 'support_configurable_bar_graph',
    ConfigurableLineGraph = 'support_configurable_line_graph',
    ChannelPerformanceTable = 'channel_performance_table',
    IntentPerformanceTable = 'intent_performance_table',
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
                description:
                    'The time agent would have spent resolving customer inquiries without AI Agent.',
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
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
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
                description:
                    'The number of fully automated interactions by AI Agent Support skills without human agent intervention.',
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
                description:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
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
                description:
                    'The reduction in the average time to resolve a ticket when AI Agent is used, compared with tickets resolved manually by support agents.',
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
                description:
                    'Average CSAT score and rating distribution for surveys sent within the timeframe; surveys are sent following ticket resolution.',
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
                description:
                    'The number of interactions handed over from AI Agent to a human support agent.',
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
                description:
                    'The percentage of AI Agent interactions that were fully resolved without escalation to a human agent.',
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
            optional: [FilterKey.Stores],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
