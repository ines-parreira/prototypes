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
import { STATS_ROUTES } from 'routes/constants'

import { AnalyticsOverviewAutomatedInteractionsCard } from './charts/AnalyticsOverviewAutomatedInteractionsCard'
import { AnalyticsOverviewAutomatedInteractionsComboChart } from './charts/AnalyticsOverviewAutomatedInteractionsComboChart'
import { AnalyticsOverviewAutomationRateCard } from './charts/AnalyticsOverviewAutomationRateCard'
import { AnalyticsOverviewCostSavedCard } from './charts/AnalyticsOverviewCostSavedCard'
import { AnalyticsOverviewLineChart } from './charts/AnalyticsOverviewLineChart'
import { AnalyticsOverviewPerformanceTable } from './charts/AnalyticsOverviewPerformanceTable'
import { AnalyticsOverviewTimeSavedCard } from './charts/AnalyticsOverviewTimeSavedCard'
import { AutomationRateComboChart } from './components/AutomationRateComboChart/AutomationRateComboChart'

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
                        fetch: fetchTimeSavedByAgentsTrend,
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
                        fetch: fetchAutomationCostSavedTrend,
                        metricFormat: 'currency',
                    },
                ],
                description: 'Cost savings from automation',
                chartType: ChartType.Card,
            },
            [AnalyticsOverviewChart.AutomationRateComboChart]: {
                chartComponent: AutomationRateComboChart,
                label: 'Overall automation rate',
                csvProducer: null,
                description: 'Breakdown of automation rate by feature',
                chartType: ChartType.Graph,
            },
            [AnalyticsOverviewChart.AutomatedInteractionsComboChart]: {
                chartComponent:
                    AnalyticsOverviewAutomatedInteractionsComboChart,
                label: 'Automated interactions',
                csvProducer: null,
                description: 'Breakdown of automated interactions by skill',
                chartType: ChartType.Graph,
            },
            [AnalyticsOverviewChart.AutomationLineChart]: {
                chartComponent: AnalyticsOverviewLineChart,
                label: 'Automation trend over time',
                csvProducer: null,
                description: 'Automation metrics trend over time',
                chartType: ChartType.Graph,
            },
            [AnalyticsOverviewChart.PerformanceTable]: {
                chartComponent: AnalyticsOverviewPerformanceTable,
                label: 'Performance breakdown',
                csvProducer: null,
                description: 'Performance breakdown by feature',
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
