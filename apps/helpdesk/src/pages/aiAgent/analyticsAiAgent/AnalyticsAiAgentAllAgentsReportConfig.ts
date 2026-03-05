import { fetchAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { fetchAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { fetchAiAgentTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useAiAgentTimeSavedByAgentsTrend'
import { fetchCoverageRateTrend } from 'domains/reporting/hooks/automate/useCoverageRateTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsAiAgentCoverageRateCard } from 'pages/aiAgent/analyticsAiAgent/charts//AnalyticsAiAgentCoverageRateCard'
import { AnalyticsAiAgentAutomatedInteractionsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomatedInteractionCard'
import { AnalyticsAiAgentAutomationRateCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentAutomationRateCard'
import { AnalyticsAiAgentClosedTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentClosedTicketsCard'
import { AnalyticsAllAgentsLineChart } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentLineChart/AnalyticsAllAgentsLineChart'
import { AnalyticsAllAgentsPerformanceTable } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentPerformanceTable/AnalyticsAllAgentsPerformanceTable'
import { AnalyticsAiAgentTimeSavedCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTimeSavedCard'
import { AnalyticsAiAgentTotalSalesCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentTotalSalesCard'
import { AnalyticsAiAgentZeroTouchTicketsCard } from 'pages/aiAgent/analyticsAiAgent/charts/AnalyticsAiAgentZeroTouchTicketsCard'
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
const fetchPerformanceBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'performance-breakdown.csv',
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
    AllAgentsTrendComboChart = 'all_agents_trend_combo_chart',
    AllAgentsTrendLineChart = 'all_agents_trend_line_chart',
    PerformanceTable = 'performance_table',
}

export const AnalyticsAiAgentAllAgentsReportConfig: ReportConfig<AnalyticsAiAgentAllAgentsChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsAllAgents,
        reportName: 'AI Agent Analytics All Agents',
        reportPath: STATS_ROUTES.AI_AGENT,
        charts: {
            [AnalyticsAiAgentAllAgentsChart.AutomationRateCard]: {
                chartComponent: AnalyticsAiAgentAutomationRateCard,
                label: 'Automation rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAIAgentAutomationRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                description:
                    'The percentage of customer interactions fully handled by the AI Agent.',
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
            [AnalyticsAiAgentAllAgentsChart.PerformanceTable]: {
                chartComponent: AnalyticsAllAgentsPerformanceTable,
                label: 'Performance breakdown',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchPerformanceBreakdown,
                    },
                ],
                description: 'Performance breakdown by agent',
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
