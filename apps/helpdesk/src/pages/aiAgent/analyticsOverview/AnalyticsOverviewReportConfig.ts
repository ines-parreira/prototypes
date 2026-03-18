import { fetchFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { fetchAutomationCostSavedTrend } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { fetchAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { fetchDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { fetchDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { fetchTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
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
import { AnalyticsOverviewAutomatedInteractionsComboChart } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsComboChart'
import { AnalyticsOverviewAutomationRateCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomationRateCard'
import { AnalyticsOverviewCostSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsOverviewDecreaseInFRTCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInFRTCard'
import { AnalyticsOverviewDecreaseInResolutionTimeCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewDecreaseInResolutionTimeCard'
import { AnalyticsOverviewTimeSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewTimeSavedCard'
import { AutomationLineChart } from 'pages/aiAgent/analyticsOverview/components/AutomationLineChart/AutomationLineChart'
import { AutomationRateComboChart } from 'pages/aiAgent/analyticsOverview/components/AutomationRateComboChart/AutomationRateComboChart'
import { FLOWS_TABLE } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/columns'
import { FlowsTable } from 'pages/aiAgent/analyticsOverview/components/FlowsTable/FlowsTable'
import { ORDER_MANAGEMENT_TABLE } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/columns'
import { OrderManagementTable } from 'pages/aiAgent/analyticsOverview/components/OrderManagementTable/OrderManagementTable'
import { PERFORMANCE_BREAKDOWN_TABLE } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/columns'
import { PerformanceBreakdownTable } from 'pages/aiAgent/analyticsOverview/components/PerformanceBreakdownTable/PerformanceBreakdownTable'
import { fetchPerformanceMetricsPerFeatureReport } from 'pages/aiAgent/analyticsOverview/hooks/fetchPerformanceBreakdownData'
import { fetchFlowsReport } from 'pages/aiAgent/analyticsOverview/hooks/useFlowsMetrics'
import { fetchOrderManagementReport } from 'pages/aiAgent/analyticsOverview/hooks/useOrderManagementMetrics'
import { STATS_ROUTES } from 'routes/constants'

export enum AnalyticsOverviewChart {
    AutomationRateCard = 'automation_rate_card',
    AutomatedInteractionsCard = 'automated_interactions_card',
    TimeSavedCard = 'time_saved_card',
    CostSavedCard = 'cost_saved_card',
    DecreaseInResolutionTimeCard = 'decrease_in_resolution_time_card',
    AutomationRateComboChart = 'automation_rate_combo_chart',
    AutomatedInteractionsComboChart = 'automated_interactions_combo_chart',
    AutomationLineChart = 'automation_line_chart',
    PerformanceTable = 'performance_table',
    OrderManagementTable = 'order_management_table',
    FlowsTable = 'flows_table',
    HandoverInteractionsCard = 'handover_interactions_card',
    DecreaseInFRTCard = 'decrease_in_frt_card',
}

export const AnalyticsOverviewReportConfig: ReportConfig<AnalyticsOverviewChart> =
    {
        id: ReportsIDs.AiAgentAnalyticsOverview,
        reportName: 'AI Agent Analytics Overview',
        reportPath: STATS_ROUTES.AI_AGENT_OVERVIEW,
        charts: {
            [AnalyticsOverviewChart.AutomationRateCard]: {
                chartComponent: AnalyticsOverviewAutomationRateCard,
                label: 'Overall automation rate',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAutomationRateTrend,
                        metricFormat: 'decimal-to-percent',
                    },
                ],
                description:
                    'The number of interactions automated by all automation features as a % of total customer interactions.',
                chartType: ChartType.Card,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.AutomatedInteractionsCard]: {
                chartComponent: AnalyticsOverviewAutomatedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchFilteredAutomatedInteractions,
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'The number of fully automated interactions solved without any human agent intervention.',
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.TimeSavedCard]: {
                chartComponent: AnalyticsOverviewTimeSavedCard,
                label: 'Time saved by agents',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTimeSavedByAgentsTrend,
                        metricFormat: 'duration',
                    },
                ],
                description:
                    'The time agent would have spent resolving customer inquiries without all automation features.',
                chartType: ChartType.Card,
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
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
                chartType: ChartType.Card,
                metricFormat: 'currency-precision-1',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.DecreaseInResolutionTimeCard]: {
                chartComponent: AnalyticsOverviewDecreaseInResolutionTimeCard,
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
                description:
                    "The number of interactions AI Agent transferred to a human because it couldn't confidently resolve the customer's request or because the customer explicitly requested to speak with a human agent.",
                chartType: ChartType.Card,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [AnalyticsOverviewChart.DecreaseInFRTCard]: {
                chartComponent: AnalyticsOverviewDecreaseInFRTCard,
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
            [AnalyticsOverviewChart.AutomationRateComboChart]: {
                chartComponent: AutomationRateComboChart,
                label: 'Overall automation rate',
                csvProducer: null,
                description: 'Breakdown of automation rate by feature',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.AutomatedInteractionsComboChart]: {
                chartComponent:
                    AnalyticsOverviewAutomatedInteractionsComboChart,
                label: 'Automated interactions',
                csvProducer: null,
                description: 'Breakdown of automated interactions by skill',
                chartType: ChartType.Graph,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.AutomationLineChart]: {
                chartComponent: AutomationLineChart,
                label: 'Overall automation rate',
                csvProducer: null,
                description: 'Automation metrics trend over time',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.PerformanceTable]: {
                chartComponent: PerformanceBreakdownTable,
                label: PERFORMANCE_BREAKDOWN_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchPerformanceMetricsPerFeatureReport,
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
                        type: DataExportFormat.Table,
                        fetch: fetchOrderManagementReport,
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
                        type: DataExportFormat.Table,
                        fetch: fetchFlowsReport,
                    },
                ],
                description: FLOWS_TABLE.description,
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
