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
    AutomationRateCard = 'automation_rate_card',
    AutomatedInteractionsCard = 'automated_interactions_card',
    ConversionRateCard = 'conversion_rate_card',
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
    SuccessRateCard = 'all_agents_success_rate_card',
    ConfigurableBarGraph = 'all_agents_configurable_bar_graph',
    ConfigurableLineGraph = 'all_agents_configurable_line_graph',
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
                        fetch: fetchAiAgentAllAgentsAutomationRateTrend,
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
                description:
                    'The number of fully automated interactions solved without any human agent intervention.',
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
                description:
                    'The percentage of Shopping Assistant interactions after which an order was placed within 3 days.',
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
                description:
                    'The revenue influenced by a Shopping Assistant interaction, measured from orders placed within 3 days of the interaction',
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
                chartComponent: AnalyticsAiAgentAllAgentsAverageCsatCard,
                label: 'Average CSAT',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsAverageCsatTrend,
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
                        fetch: fetchAiAgentAllAgentsDecreaseInResolutionTimeTrend,
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
                chartComponent: AnalyticsAiAgentAllAgentsDecreaseInFRTCard,
                label: 'Decrease in first response time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAiAgentAllAgentsDecreaseInFRTTrend,
                        metricFormat: 'duration',
                    },
                ],
                description:
                    'The reduction in the average time shoppers wait for the first reply to their message when AI Agent is used, compared with tickets resolved manually by support agents.',
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
                description:
                    'The percentage of AI Agent interactions that were fully resolved without escalation to a human agent.',
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
            optional: [FilterKey.Stores],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
