import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsOverviewCostSavedCard } from '../analyticsOverview/charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsSupportAgentComboChart } from './charts/AnalyticsAiAgentComboChart/AnalyticsSupportAgentComboChart'
import { AnalyticsAiAgentDecreaseinFRTCard } from './charts/AnalyticsAiAgentDecreaseinFRTCard'
import { AnalyticsSupportAgentLineChart } from './charts/AnalyticsAiAgentLineChart/AnalyticsSupportAgentLineChart'
import { AnalyticsSupportAgentPerformanceTable } from './charts/AnalyticsAiAgentPerformanceTable/AnalyticsSupportAgentPerformanceTable'
import { AnalyticsAiAgentSupportInteractionsCard } from './charts/AnalyticsAiAgentSupportInteractionsCard'
import { AnalyticsAiAgentTimeSavedCard } from './charts/AnalyticsAiAgentTimeSavedCard'

// Mock fetch functions - these will be replaced with real data fetchers later
const fetchTimeSavedTrend = async () => ({ value: 20750, trend: 0.02 }) as any
const fetchCostSavedTrend = async () => ({ value: 2800, trend: 0.02 }) as any
const fetchSupportInteractionsTrend = async () =>
    ({ value: 3900, trend: 0.02 }) as any
const fetchDecreaseInFRTTrend = async () =>
    ({ value: 88740, trend: 0.02 }) as any
const fetchSupportAgentTrendBreakdown = async () =>
    ({
        isLoading: false,
        fileName: 'support-agent-breakdown.csv',
        files: {},
    }) as any
const fetchSupportAgentTrendData = async () =>
    ({
        isLoading: false,
        fileName: 'support-agent-trend.csv',
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
                        fetch: fetchTimeSavedTrend,
                        metricFormat: 'duration',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
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
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentSupportAgentChart.SupportInteractionsCard]: {
                chartComponent: AnalyticsAiAgentSupportInteractionsCard,
                label: 'Support interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchSupportInteractionsTrend,
                        metricFormat: 'integer',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentSupportAgentChart.DecreaseInFRTCard]: {
                chartComponent: AnalyticsAiAgentDecreaseinFRTCard,
                label: 'Decrease in first resolution time',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchDecreaseInFRTTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentSupportAgentChart.SupportAgentTrendComboChart]: {
                chartComponent: AnalyticsSupportAgentComboChart,
                label: '',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchSupportAgentTrendBreakdown,
                    },
                ],
                description: '',
                chartType: ChartType.Graph,
            },
            [AnalyticsAiAgentSupportAgentChart.SupportAgentTrendLineChart]: {
                chartComponent: AnalyticsSupportAgentLineChart,
                label: '',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchSupportAgentTrendData,
                    },
                ],
                description: '',
                chartType: ChartType.Graph,
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
                description: '',
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
