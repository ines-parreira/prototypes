import { fetchAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { fetchAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { fetchAiAgentTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { fetchCoverageRateTrend } from 'domains/reporting/hooks/automate/useCoverageRateTrend'
import { fetchDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchAiAgentAllAgentsHandoverInteractionsTrend } from 'domains/reporting/pages/automate/aiSalesAgent/hooks/useAiAgentAllAgentsHandoverInteractionsTrend'
import { fetchGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentCoverageRateCard } from 'pages/aiAgent/analyticsAiAgent/charts//AnalyticsAiAgentCoverageRateCard'
import { AnalyticsAiAgentAllAgentsFRTCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsFRTCard'
import { AnalyticsAiAgentAllAgentsHandoverInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAllAgentsHandoverInteractionsCard'
import { AnalyticsAiAgentAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomatedInteractionCard'
import { AnalyticsAiAgentAutomationRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomationRateCard'
import { AnalyticsAiAgentClosedTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClosedTicketsCard'
import { AnalyticsAiAgentCostSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentCostSavedCard'
import { AnalyticsAiAgentDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentDecreaseInResolutionTimeCard'
import { AnalyticsAllAgentsLineChart } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentLineChart/AnalyticsAllAgentsLineChart'
import { AnalyticsAiAgentTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTimeSavedCard'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import { AnalyticsAiAgentZeroTouchTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentZeroTouchTicketsCard'
import { ChannelPerformanceBreakdownTableWrapper } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/ChannelPerformanceBreakdownTableWrapper'
import { IntentPerformanceBreakdownTable } from 'pages/aiAgent/analyticsAiAgent/components/AiAgentPerformanceBreakdownTable/IntentPerformanceBreakdownTable'
import { fetchAiAgentAllAgentsCostSavedTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsCostSavedTrend'
import { fetchAiAgentAllAgentsFRTTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentAllAgentsFRTTrend'
import { fetchAiAgentClosedTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentClosedTicketsTrend'
import { fetchAiAgentSupportAgentCsatTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentSupportAgentCsatTrend'
import { fetchAiAgentZeroTouchTicketsTrend } from 'pages/aiAgent/analyticsAiAgent/hooks/useAiAgentZeroTouchTicketsTrend'
import { AnalyticsOverviewAutomatedInteractionsComboChart } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsComboChart'
import { AnalyticsOverviewAverageCsatCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAverageCsatCard'
import { STATS_ROUTES } from 'routes/constants'

// Mock fetch functions - these will be replaced with real data fetchers later
const fetchAllAgentsTrendBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'all-agents-breakdown.csv',
        files: {},
    }) as any
const fetchAllAgentsTrendData = async () =>
    ({
        isLoading: false,
        fileName: 'all-agents-trend.csv',
        files: {},
    }) as any

export enum AnalyticsAiAgentAllAgentsChart {
    AutomationRateCard = 'automation_rate_card',
    AutomatedInteractionsCard = 'automated_interactions_card',
    TotalSalesCard = 'total_sales_card',
    TimeSavedCard = 'time_saved_card',
    ZeroTouchTicketsCard = 'zero_touch_tickets_card',
    AverageCsatCard = 'average_csat_card',
    CoverageRateCard = 'coverage_rate_card',
    ClosedTicketsCard = 'closed_tickets_card',
    HandoverInteractionsCard = 'handover_interactions_card',
    CostSavedCard = 'cost_saved_card',
    DecreaseInResolutionTimeCard = 'decrease_in_resolution_time_card',
    DecreaseInFRTCard = 'decrease_in_frt_all_agents_card',
    AllAgentsTrendComboChart = 'all_agents_trend_combo_chart',
    AllAgentsTrendLineChart = 'all_agents_trend_line_chart',
    ChannelPerformanceTable = 'channel_performance_table',
    IntentPerformanceTable = 'intent_performance_table',
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
                        fetch: fetchAIAgentAutomationRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                description:
                    'The percentage of customer interactions fully handled by AI Agent.',
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard]: {
                chartComponent: AnalyticsAiAgentAutomatedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAIAgentAutomatedInteractionsTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'The number of fully automated interactions solved without any human agent intervention.',
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.TotalSalesCard]: {
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
            [AnalyticsAiAgentAllAgentsChart.TimeSavedCard]: {
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
                description:
                    'Number of tickets closed without any agent reply.',
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.AverageCsatCard]: {
                chartComponent: AnalyticsOverviewAverageCsatCard,
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
                description:
                    'Percentage of tickets that AI Agent attempted to respond to.',
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
                description:
                    'Number of unique closed tickets within the selected timeframe (that did not reopen).',
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
                description:
                    "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
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
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
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
            [AnalyticsAiAgentAllAgentsChart.DecreaseInFRTCard]: {
                chartComponent: AnalyticsAiAgentAllAgentsFRTCard,
                label: 'Decrease in first response time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsFRTTrend,
                        metricFormat: 'duration',
                    },
                ],
                description:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
                chartType: ChartType.Card,
                metricFormat: 'duration',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.AllAgentsTrendComboChart]: {
                chartComponent:
                    AnalyticsOverviewAutomatedInteractionsComboChart,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAllAgentsTrendBreakdown,
                    },
                ],
                description: 'Breakdown of automated interactions by skill',
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.AllAgentsTrendLineChart]: {
                chartComponent: AnalyticsAllAgentsLineChart,
                label: 'Automation rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAllAgentsTrendData,
                    },
                ],
                description: 'Automation rate trend over time',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsAiAgentAllAgentsChart.ChannelPerformanceTable]: {
                chartComponent: ChannelPerformanceBreakdownTableWrapper,
                label: 'Channel',
                csvProducer: null,
                description: 'Performance breakdown by channel',
                chartType: ChartType.Table,
            },
            [AnalyticsAiAgentAllAgentsChart.IntentPerformanceTable]: {
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
