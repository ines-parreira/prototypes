import { fetchAiAgentSupportInteractionsTimeSeriesData } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTimeSeriesData'
import { fetchAiAgentSupportInteractionsTrend } from 'domains/reporting/hooks/automate/useAiAgentSupportInteractionsTrend'
import { fetchAiAgentTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { fetchDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsSupportAgentComboChart } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentComboChart/AnalyticsSupportAgentComboChart'
import { AnalyticsAiAgentDecreaseinFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseinFRTCard'
import { AnalyticsSupportAgentLineChart } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentLineChart/AnalyticsSupportAgentLineChart'
import { AnalyticsSupportAgentPerformanceTable } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentPerformanceTable/AnalyticsSupportAgentPerformanceTable'
import { AnalyticsAiAgentSupportInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentSupportInteractionsCard'
import { AnalyticsAiAgentTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTimeSavedCard'
import { SupportInteractionsComboChart } from 'pages/aiAgent/analyticsAiAgent/components/SupportInteractionsComboChart/SupportInteractionsComboChart'
import { AnalyticsOverviewCostSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { STATS_ROUTES } from 'routes/constants'

// Mock fetch functions - these will be replaced with real data fetchers later
const fetchCostSavedTrend = async () => ({ value: 2800, trend: 0.02 }) as any
const fetchSupportAgentTrendBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'support-agent-breakdown.csv',
        files: {},
    }) as any
const fetchPerformanceBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'performance-breakdown.csv',
        files: {},
    }) as any

export enum AnalyticsAiAgentSupportAgentChart {
    TimeSavedCard = 'time_saved_card',
    CostSavedCard = 'cost_saved_card',
    SupportInteractionsCard = 'support_interactions_card',
    DecreaseInFRTCard = 'decrease_in_first_resolution_time_card',
    SupportAgentTrendComboChart = 'support_agent_trend_combo_chart',
    SupportInteractionsComboChart = 'support_interactions_combo_chart',
    SupportAgentTrendLineChart = 'support_agent_trend_line_chart',
    PerformanceTable = 'performance_table',
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
                        metricFormat: 'decimal',
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
                        metricFormat: 'integer',
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
            [AnalyticsAiAgentSupportAgentChart.SupportAgentTrendComboChart]: {
                chartComponent: AnalyticsSupportAgentComboChart,
                label: 'Overall automation rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchSupportAgentTrendBreakdown,
                    },
                ],
                description: '',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
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
            [AnalyticsAiAgentSupportAgentChart.PerformanceTable]: {
                chartComponent: AnalyticsSupportAgentPerformanceTable,
                label: 'Performance breakdown',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchPerformanceBreakdown,
                    },
                ],
                description: 'Performance breakdown by Support Agent',
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
