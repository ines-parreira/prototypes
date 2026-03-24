import { fetchAiAgentSupportInteractionsTimeSeriesData } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import { fetchAiAgentSupportInteractionsTrend } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { fetchAiAgentTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { fetchDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { fetchDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchAiAgentSupportHandoverInteractionsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useAiAgentSupportHandoverInteractionsTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentDecreaseinFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseinFRTCard'
import { AnalyticsSupportAgentLineChart } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentLineChart/AnalyticsSupportAgentLineChart'
import { AnalyticsAiAgentSupportAgentCsatCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportAgentCsatCard'
import { AnalyticsAiAgentSupportDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportDecreaseInResolutionTimeCard'
import { AnalyticsAiAgentSupportHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportHandoverInteractionsCard'
import { AnalyticsAiAgentSupportInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportInteractionsCard'
import { AnalyticsAiAgentTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTimeSavedCard'
import { IntentPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable'
import { SupportAgentChannelPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/SupportAgentChannelPerformanceBreakdownTable'
import { SupportInteractionsComboChart } from 'pages/aiAgent/analyticsAiAgent/components/SupportInteractionsComboChart/SupportInteractionsComboChart'
import { fetchAiAgentSupportAgentCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentCsatTrend'
import { AnalyticsOverviewCostSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { STATS_ROUTES } from 'routes/constants'

// Mock fetch functions - these will be replaced with real data fetchers later
const fetchCostSavedTrend = async () => ({ value: 2800, trend: 0.02 }) as any

export enum AnalyticsAiAgentSupportAgentChart {
    TimeSavedCard = 'time_saved_card',
    CostSavedCard = 'cost_saved_card',
    SupportInteractionsCard = 'support_interactions_card',
    DecreaseInFRTCard = 'decrease_in_first_resolution_time_card',
    DecreaseInResolutionTimeCard = 'decrease_in_resolution_time_card',
    AverageCsatCard = 'average_csat_card',
    HandoverInteractionsCard = 'handover_interactions_card',
    SupportInteractionsComboChart = 'support_interactions_combo_chart',
    SupportAgentTrendLineChart = 'support_agent_trend_line_chart',
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
                chartComponent: AnalyticsAiAgentTimeSavedCard,
                label: 'Time saved by agents',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentTimeSavedByAgentsTrend,
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
                chartComponent: AnalyticsOverviewCostSavedCard,
                label: 'Cost saved',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchCostSavedTrend,
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
                chartComponent: AnalyticsAiAgentSupportInteractionsCard,
                label: 'Support tickets',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportInteractionsTrend,
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
            [AnalyticsAiAgentSupportAgentChart.DecreaseInResolutionTimeCard]: {
                chartComponent:
                    AnalyticsAiAgentSupportDecreaseInResolutionTimeCard,
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
            [AnalyticsAiAgentSupportAgentChart.AverageCsatCard]: {
                chartComponent: AnalyticsAiAgentSupportAgentCsatCard,
                label: 'Average CSAT',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentSupportAgentCsatTrend,
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
            [AnalyticsAiAgentSupportAgentChart.SupportInteractionsComboChart]: {
                chartComponent: SupportInteractionsComboChart,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: async () => ({
                            isLoading: false,
                            fileName: 'support-interactions.csv',
                            files: {},
                        }),
                    },
                ],
                description: 'Support interactions by intent',
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart]: {
                chartComponent: AnalyticsSupportAgentLineChart,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.TimeSeries,
                        fetch: fetchAiAgentSupportInteractionsTimeSeriesData,
                    },
                ],
                description: 'Automated interactions trend over time',
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentSupportAgentChart.ChannelPerformanceTable]: {
                chartComponent: SupportAgentChannelPerformanceBreakdownTable,
                label: 'Channel',
                csvProducer: null,
                description: 'Performance breakdown by channel',
                chartType: ChartType.Table,
            },
            [AnalyticsAiAgentSupportAgentChart.IntentPerformanceTable]: {
                chartComponent: IntentPerformanceBreakdownTable,
                label: 'Intent',
                csvProducer: null,
                description: 'Performance breakdown by intent',
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
