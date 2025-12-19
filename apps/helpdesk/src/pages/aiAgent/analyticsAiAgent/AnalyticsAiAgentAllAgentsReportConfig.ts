import { fetchAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { fetchAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { fetchGmvInfluencedTrend } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/useGmvInfluencedTrend'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsAiAgentAutomatedInteractionsCard } from './charts/AnalyticsAiAgentAutomatedInteractionCard'
import { AnalyticsAiAgentAutomationRateCard } from './charts/AnalyticsAiAgentAutomationRateCard'
import { AnalyticsAllAgentsComboChart } from './charts/AnalyticsAiAgentComboChart/AnalyticsAllAgentsComboChart'
import { AnalyticsAllAgentsLineChart } from './charts/AnalyticsAiAgentLineChart/AnalyticsAllAgentsLineChart'
import { AnalyticsAllAgentsPerformanceTable } from './charts/AnalyticsAiAgentPerformanceTable/AnalyticsAllAgentsPerformanceTable'
import { AnalyticsAiAgentTimeSavedCard } from './charts/AnalyticsAiAgentTimeSavedCard'
import { AnalyticsAiAgentTotalSalesCard } from './charts/AnalyticsAiAgentTotalSalesCard'

// Mock fetch functions - these will be replaced with real data fetchers later
const fetchTimeSavedTrend = async () => ({ value: 20750, trend: 0.02 }) as any
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
                        metricFormat: 'decimal',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentAllAgentsChart.AutomatedInteractionsCard]: {
                chartComponent: AnalyticsAiAgentAutomatedInteractionsCard,
                label: 'Automated interactions',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAIAgentAutomatedInteractionsTrend,
                        metricFormat: 'integer',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentAllAgentsChart.TotalSalesCard]: {
                chartComponent: AnalyticsAiAgentTotalSalesCard,
                label: 'Total sales',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchGmvInfluencedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description: '',
                chartType: ChartType.Card,
            },
            [AnalyticsAiAgentAllAgentsChart.TimeSavedCard]: {
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
            [AnalyticsAiAgentAllAgentsChart.AllAgentsTrendComboChart]: {
                chartComponent: AnalyticsAllAgentsComboChart,
                label: '',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAllAgentsTrendBreakdown,
                    },
                ],
                description: '',
                chartType: ChartType.Graph,
            },
            [AnalyticsAiAgentAllAgentsChart.AllAgentsTrendLineChart]: {
                chartComponent: AnalyticsAllAgentsLineChart,
                label: '',
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAllAgentsTrendData,
                    },
                ],
                description: '',
                chartType: ChartType.Graph,
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
                description: '',
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
