import { fetchFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { fetchAutomationCostSavedTrend } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { fetchAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { fetchTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { AnalyticsOverviewAutomatedInteractionsCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsCard'
import { AnalyticsOverviewAutomatedInteractionsComboChart } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomatedInteractionsComboChart'
import { AnalyticsOverviewAutomationRateCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewAutomationRateCard'
import { AnalyticsOverviewCostSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsOverviewLineChart } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewLineChart'
import { AnalyticsOverviewPerformanceTable } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewPerformanceTable'
import { AnalyticsOverviewTimeSavedCard } from 'pages/aiAgent/analyticsOverview/charts/AnalyticsOverviewTimeSavedCard'
import { AutomationRateComboChart } from 'pages/aiAgent/analyticsOverview/components/AutomationRateComboChart/AutomationRateComboChart'
import { STATS_ROUTES } from 'routes/constants'

export enum AnalyticsOverviewChart {
    AutomationRateCard = 'automation_rate_card',
    AutomatedInteractionsCard = 'automated_interactions_card',
    TimeSavedCard = 'time_saved_card',
    CostSavedCard = 'cost_saved_card',
    AutomationRateComboChart = 'automation_rate_combo_chart',
    AutomatedInteractionsComboChart = 'automated_interactions_combo_chart',
    AutomationLineChart = 'automation_line_chart',
    PerformanceTable = 'performance_table',
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
                        metricFormat: 'integer',
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
                        metricFormat: 'currency',
                    },
                ],
                description:
                    'The estimated amount saved by automating interactions that would have otherwise been handled by agents, based on Helpdesk ticket cost plus the benchmark agent cost of $3.10 per ticket.',
                chartType: ChartType.Card,
                metricFormat: 'currency-precision-1',
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
                chartComponent: AnalyticsOverviewLineChart,
                label: 'Overall automation rate',
                csvProducer: null,
                description: 'Automation metrics trend over time',
                chartType: ChartType.Graph,
                metricFormat: 'decimal-to-percent',
                interpretAs: 'more-is-better',
            },
            [AnalyticsOverviewChart.PerformanceTable]: {
                chartComponent: AnalyticsOverviewPerformanceTable,
                label: 'Performance breakdown',
                csvProducer: null,
                description: '',
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
