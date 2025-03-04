import { fetchFilteredAutomatedInteractions } from 'hooks/reporting/automate/automationTrends'
import { fetchAutomationCostSavedTrend } from 'hooks/reporting/automate/useAutomationCostSavedTrend'
import { fetchAutomationRateTrend } from 'hooks/reporting/automate/useAutomationRateTrend'
import { fetchDecreaseInFirstResponseTimeTrend } from 'hooks/reporting/automate/useDecreaseInFirstResponseTimeTrend'
import { fetchDecreaseInResolutionTimeTrend } from 'hooks/reporting/automate/useDecreaseInResolutionTimeTrend'
import { fetchTimeSavedByAgentsTrend } from 'hooks/reporting/automate/useTimeSavedByAgentsTrend'
import { FilterKey } from 'models/stat/types'
import { AUTOMATION_RATE_TOOLTIP } from 'pages/automate/automate-metrics/AutomationRateMetric'
import {
    AUTOMATED_INTERACTION_TOOLTIP,
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
    COST_SAVED,
    DECREASE_IN_FIRST_RESPONSE,
    DECREASE_IN_RESOLUTION_TIME,
    TIME_SAVED_BY_AGENTS,
} from 'pages/automate/automate-metrics/constants'
import { COST_SAVED_TOOLTIP } from 'pages/automate/automate-metrics/CostSavedMetric'
import { DECREASE_IN_FIRST_RESPONSE_TOOLTIP } from 'pages/automate/automate-metrics/DecreaseInFirstResponseTimeMetric'
import { DECREASE_IN_RESOLUTION_TIME_TOOLTIP } from 'pages/automate/automate-metrics/DecreaseInResolutionTimeMetric'
import { TIME_SAVED_BY_AGENTS_TOOLTIP } from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'
import { AutomatedInteractionsGraphChart } from 'pages/stats/automate/overview/charts/AutomatedInteractionsGraphChart'
import { AutomatedInteractionsKPIChart } from 'pages/stats/automate/overview/charts/AutomatedInteractionsKPIChart'
import { AutomatedInteractionsPerFeatureGraphChart } from 'pages/stats/automate/overview/charts/AutomatedInteractionsPerFeatureGraphChart'
import { AutomationCostSavedKPIChart } from 'pages/stats/automate/overview/charts/AutomationCostSavedKPIChart'
import { AutomationDecreaseInFirstResponseTimeTrendChart } from 'pages/stats/automate/overview/charts/AutomationDecreaseInFirstResponseTimeTrendChart'
import { AutomationRateGraphChart } from 'pages/stats/automate/overview/charts/AutomationRateGraphChart'
import { AutomationRateKPIChart } from 'pages/stats/automate/overview/charts/AutomationRateKPIChart'
import { DecreaseInResolutionTimeKPIChart } from 'pages/stats/automate/overview/charts/DecreaseInResolutionTimeKPIChart'
import { TimeSavedByAgentsKPIChart } from 'pages/stats/automate/overview/charts/TimeSavedByAgentsKPIChart'
import { ReportsIDs } from 'pages/stats/custom-reports/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import {
    AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL,
    PAGE_TITLE_AUTOMATE_PAYWALL,
} from 'pages/stats/self-service/constants'
import { STATS_ROUTES } from 'routes/constants'
import {
    fetchAutomatePerformanceReport,
    fetchPerformanceByFeatureReport,
} from 'services/reporting/automateOverviewReportingService'

export enum AutomateOverviewChart {
    AutomationRateKPIChart = 'automation_rate_kpichart',
    AutomatedInteractionsKPIChart = 'automated_interactions_kpichart',
    AutomationCostSavedKPIChart = 'automation_cost_saved_kpichart',
    TimeSavedByAgentsKPIChart = 'time_saved_by_agents_kpichart',
    DecreaseInResolutionTimeGraphChart = 'decrease_in_resolution_time_graph_chart',
    AutomationDecreaseInFirstResponseTimeGraphChart = 'automation_decrease_in_first_response_time_graph_chart',
    AutomationRateGraphChart = 'automation_rate_graph_chart',
    AutomatedInteractionsGraphChart = 'automated_interactions_graph_chart',
    AutomatedInteractionsPerFeatureGraphChart = 'automated_interactions_per_feature_graph_chart',
}

export const AutomateOverviewReportConfig: ReportConfig<AutomateOverviewChart> =
    {
        id: ReportsIDs.AutomateOverviewReportConfig,
        reportName: PAGE_TITLE_AUTOMATE_PAYWALL,
        reportPath: STATS_ROUTES.AUTOMATE_OVERVIEW,
        charts: {
            [AutomateOverviewChart.AutomationRateKPIChart]: {
                chartComponent: AutomationRateKPIChart,
                label: AUTOMATION_RATE_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAutomationRateTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description: AUTOMATION_RATE_TOOLTIP.title,
                chartType: ChartType.Card,
            },
            [AutomateOverviewChart.AutomatedInteractionsKPIChart]: {
                chartComponent: AutomatedInteractionsKPIChart,
                label: AUTOMATED_INTERACTIONS_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchFilteredAutomatedInteractions,
                        metricFormat: 'integer',
                    },
                ],
                description: AUTOMATED_INTERACTION_TOOLTIP.title,
                chartType: ChartType.Card,
            },
            [AutomateOverviewChart.AutomationCostSavedKPIChart]: {
                chartComponent: AutomationCostSavedKPIChart,
                label: COST_SAVED,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAutomationCostSavedTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description: COST_SAVED_TOOLTIP.title,
                chartType: ChartType.Card,
            },
            [AutomateOverviewChart.TimeSavedByAgentsKPIChart]: {
                chartComponent: TimeSavedByAgentsKPIChart,
                label: TIME_SAVED_BY_AGENTS,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchTimeSavedByAgentsTrend,
                        metricFormat: 'duration',
                    },
                ],
                description: TIME_SAVED_BY_AGENTS_TOOLTIP.title,
                chartType: ChartType.Card,
            },
            [AutomateOverviewChart.DecreaseInResolutionTimeGraphChart]: {
                chartComponent: DecreaseInResolutionTimeKPIChart,
                label: DECREASE_IN_RESOLUTION_TIME,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchDecreaseInResolutionTimeTrend,
                        metricFormat: 'integer',
                    },
                ],
                description: DECREASE_IN_RESOLUTION_TIME_TOOLTIP.title,
                chartType: ChartType.Card,
            },
            [AutomateOverviewChart.AutomationDecreaseInFirstResponseTimeGraphChart]:
                {
                    chartComponent:
                        AutomationDecreaseInFirstResponseTimeTrendChart,
                    label: DECREASE_IN_FIRST_RESPONSE,
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: fetchDecreaseInFirstResponseTimeTrend,
                            metricFormat: 'integer',
                        },
                    ],
                    description: DECREASE_IN_FIRST_RESPONSE_TOOLTIP.title,
                    chartType: ChartType.Card,
                },
            [AutomateOverviewChart.AutomationRateGraphChart]: {
                chartComponent: AutomationRateGraphChart,
                label: AUTOMATION_RATE_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAutomatePerformanceReport,
                    },
                ],
                description: AUTOMATION_RATE_TOOLTIP.title,
                chartType: ChartType.Graph,
            },
            [AutomateOverviewChart.AutomatedInteractionsGraphChart]: {
                chartComponent: AutomatedInteractionsGraphChart,
                label: AUTOMATED_INTERACTIONS_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchAutomatePerformanceReport,
                    },
                ],
                description: AUTOMATED_INTERACTION_TOOLTIP.title,
                chartType: ChartType.Graph,
            },
            [AutomateOverviewChart.AutomatedInteractionsPerFeatureGraphChart]: {
                chartComponent: AutomatedInteractionsPerFeatureGraphChart,
                label: AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Table,
                        fetch: fetchPerformanceByFeatureReport,
                    },
                ],
                description: AUTOMATED_INTERACTION_TOOLTIP.title,
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            optional: [],
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
