import { fetchFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsOverviewAutomatedInteractionsCard } from './charts/AnalyticsOverviewAutomatedInteractionsCard'
import { AnalyticsOverviewAutomationRateCard } from './charts/AnalyticsOverviewAutomationRateCard'
import { AnalyticsOverviewCostSavedCard } from './charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsOverviewDonutChart } from './charts/AnalyticsOverviewDonutChart'
import { AnalyticsOverviewLineChart } from './charts/AnalyticsOverviewLineChart'
import { AnalyticsOverviewPerformanceTable } from './charts/AnalyticsOverviewPerformanceTable'
import { AnalyticsOverviewTimeSavedCard } from './charts/AnalyticsOverviewTimeSavedCard'

// Mock fetch functions - these will be replaced with real data fetchers later
const fetchAutomationRateTrend = async () =>
    ({ value: 0.32, trend: -0.02 }) as any
const fetchTimeSavedTrend = async () => ({ value: 19800, trend: 0.02 }) as any
const fetchCostSavedTrend = async () => ({ value: 2400, trend: -0.02 }) as any
const fetchAutomationBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'automation-breakdown.csv',
        files: {},
    }) as any
const fetchAutomationTrendData = async () =>
    ({
        isLoading: false,
        fileName: 'automation-trend.csv',
        files: {},
    }) as any
const fetchPerformanceBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'performance-breakdown.csv',
        files: {},
    }) as any

export enum AnalyticsOverviewChart {
    AutomationRateCard = 'automation_rate_card',
    AutomatedInteractionsCard = 'automated_interactions_card',
    TimeSavedCard = 'time_saved_card',
    CostSavedCard = 'cost_saved_card',
    AutomationDonutChart = 'automation_donut_chart',
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
                        metricFormat: 'decimal',
                    },
                ],
                description:
                    'Percentage of interactions that were automated by AI Agent',
                chartType: ChartType.Card,
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
                    'Total number of interactions automated by AI Agent',
                chartType: ChartType.Card,
            },
            [AnalyticsOverviewChart.TimeSavedCard]: {
                chartComponent: AnalyticsOverviewTimeSavedCard,
                label: 'Time saved by agents',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTimeSavedTrend,
                        metricFormat: 'duration',
                    },
                ],
                description: 'Time saved by agents through automation',
                chartType: ChartType.Card,
            },
            [AnalyticsOverviewChart.CostSavedCard]: {
                chartComponent: AnalyticsOverviewCostSavedCard,
                label: 'Cost saved',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchCostSavedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description: 'Cost savings from automation',
                chartType: ChartType.Card,
            },
            [AnalyticsOverviewChart.AutomationDonutChart]: {
                chartComponent: AnalyticsOverviewDonutChart,
                label: 'Automation breakdown by feature',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAutomationBreakdown,
                    },
                ],
                description: 'Breakdown of automation by feature',
                chartType: ChartType.Graph,
            },
            [AnalyticsOverviewChart.AutomationLineChart]: {
                chartComponent: AnalyticsOverviewLineChart,
                label: 'Automation trend over time',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAutomationTrendData,
                    },
                ],
                description: 'Automation metrics trend over time',
                chartType: ChartType.Graph,
            },
            [AnalyticsOverviewChart.PerformanceTable]: {
                chartComponent: AnalyticsOverviewPerformanceTable,
                label: 'Performance breakdown',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchPerformanceBreakdown,
                    },
                ],
                description: 'Performance breakdown by feature',
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
