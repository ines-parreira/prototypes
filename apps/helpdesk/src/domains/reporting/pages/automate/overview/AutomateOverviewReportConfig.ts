import { fetchFilteredAutomatedInteractions } from 'domains/reporting/hooks/automate/automationTrends'
import { fetchAIAgentAutomatedInteractionsTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomatedInteractionsTrend'
import { fetchAIAgentAutomationRateTrend } from 'domains/reporting/hooks/automate/useAIAgentAutomationRateTrend'
import { fetchAIAgentInteractionsDatasetBySkillTimeSeries } from 'domains/reporting/hooks/automate/useAIAgentInteractionsBySkillTimeSeries'
import { fetchAutomationCostSavedTrend } from 'domains/reporting/hooks/automate/useAutomationCostSavedTrend'
import { fetchAutomationRateTrend } from 'domains/reporting/hooks/automate/useAutomationRateTrend'
import { fetchDecreaseInFirstResponseTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInFirstResponseTimeTrend'
import { fetchDecreaseInResolutionTimeTrend } from 'domains/reporting/hooks/automate/useDecreaseInResolutionTimeTrend'
import { fetchTimeSavedByAgentsTrend } from 'domains/reporting/hooks/automate/useTimeSavedByAgentsTrend'
import { AIAgentSkills } from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    AI_AGENT_AUTOMATED_INTERACTIONS_LABEL,
    AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP as AI_AGENT_BAR_CHART_TOOLTIP,
    AIAgentAutomatedInteractionsGraphBar,
} from 'domains/reporting/pages/automate/overview/charts/AIAgentAutomatedInteractionsGraphBar'
import { AIAgentAutomatedInteractionsKPIChart } from 'domains/reporting/pages/automate/overview/charts/AIAgentAutomatedInteractionsKPIChart'
import { AIAgentAutomationRateKPIChart } from 'domains/reporting/pages/automate/overview/charts/AIAgentAutomationRateKPIChart'
import { AutomatedInteractionsGraphChart } from 'domains/reporting/pages/automate/overview/charts/AutomatedInteractionsGraphChart'
import { AutomatedInteractionsKPIChart } from 'domains/reporting/pages/automate/overview/charts/AutomatedInteractionsKPIChart'
import { AutomatedInteractionsPerFeatureGraphChart } from 'domains/reporting/pages/automate/overview/charts/AutomatedInteractionsPerFeatureGraphChart'
import { AutomationCostSavedKPIChart } from 'domains/reporting/pages/automate/overview/charts/AutomationCostSavedKPIChart'
import { AutomationDecreaseInFirstResponseTimeTrendChart } from 'domains/reporting/pages/automate/overview/charts/AutomationDecreaseInFirstResponseTimeTrendChart'
import { AutomationRateGraphChart } from 'domains/reporting/pages/automate/overview/charts/AutomationRateGraphChart'
import { AutomationRateKPIChart } from 'domains/reporting/pages/automate/overview/charts/AutomationRateKPIChart'
import { DecreaseInResolutionTimeKPIChart } from 'domains/reporting/pages/automate/overview/charts/DecreaseInResolutionTimeKPIChart'
import { TimeSavedByAgentsKPIChart } from 'domains/reporting/pages/automate/overview/charts/TimeSavedByAgentsKPIChart'
import {
    AUTOMATE_AI_AGENT_INTERACTIONS_FILENAME,
    AUTOMATE_AI_AGENT_SALES_LABEL,
    AUTOMATE_AI_AGENT_SUPPORT_LABEL,
    DATES_WITHIN_PERIOD_LABEL,
} from 'domains/reporting/pages/automate/overview/constants'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'domains/reporting/pages/dashboards/types'
import {
    AUTOMATED_INTERACTIONS_BY_FEATURE_LABEL,
    PAGE_TITLE_AUTOMATE_PAYWALL,
} from 'domains/reporting/pages/self-service/constants'
import {
    fetchAutomatePerformanceReport,
    fetchPerformanceByFeatureReport,
} from 'domains/reporting/services/automateOverviewReportingService'
import { AUTOMATION_RATE_TOOLTIP } from 'pages/automate/automate-metrics/AutomationRateMetric'
import {
    AI_AGENT_AUTOMATED_INTERACTIONS_COUNT_LABEL,
    AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP,
    AI_AGENT_AUTOMATION_RATE_LABEL,
    AI_AGENT_AUTOMATION_RATE_TOOLTIP,
    AUTOMATED_INTERACTION_TOOLTIP,
    AUTOMATED_INTERACTIONS_LABEL,
    AUTOMATION_RATE_LABEL,
    COST_SAVED,
    DECREASE_IN_FIRST_RESPONSE,
    DECREASE_IN_RESOLUTION_TIME,
    OVERALL_AUTOMATED_INTERACTIONS_LABEL,
    OVERALL_AUTOMATION_RATE_LABEL,
    TIME_SAVED_BY_AGENTS,
} from 'pages/automate/automate-metrics/constants'
import { COST_SAVED_TOOLTIP } from 'pages/automate/automate-metrics/CostSavedMetric'
import { DECREASE_IN_FIRST_RESPONSE_TOOLTIP } from 'pages/automate/automate-metrics/DecreaseInFirstResponseTimeMetric'
import { DECREASE_IN_RESOLUTION_TIME_TOOLTIP } from 'pages/automate/automate-metrics/DecreaseInResolutionTimeMetric'
import { TIME_SAVED_BY_AGENTS_TOOLTIP } from 'pages/automate/automate-metrics/TimeSavedByAgentsMetric'
import { STATS_ROUTES } from 'routes/constants'

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
    AIAgentAutomatedInteractionsGraphBar = 'ai_agent_automated_interactions_graph_bar',
    AIAgentAutomationRateKPIChart = 'ai_agent_automation_rate_kpichart',
    AIAgentAutomatedInteractionsKPIChart = 'ai_agent_automated_interactions_kpichart',
}

export const AutomateOverviewReportConfig: ReportConfig<AutomateOverviewChart> =
    {
        id: ReportsIDs.AutomateOverviewReportConfig,
        reportName: PAGE_TITLE_AUTOMATE_PAYWALL,
        reportPath: STATS_ROUTES.AUTOMATE_OVERVIEW,
        charts: {
            [AutomateOverviewChart.AutomationRateKPIChart]: {
                chartComponent: AutomationRateKPIChart,
                label: OVERALL_AUTOMATION_RATE_LABEL,
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
                label: OVERALL_AUTOMATED_INTERACTIONS_LABEL,
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
            [AutomateOverviewChart.AIAgentAutomationRateKPIChart]: {
                chartComponent: AIAgentAutomationRateKPIChart,
                label: AI_AGENT_AUTOMATION_RATE_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAIAgentAutomationRateTrend,
                        metricFormat: 'decimal',
                    },
                ],
                description: AI_AGENT_AUTOMATION_RATE_TOOLTIP.title,
                chartType: ChartType.Card,
            },
            [AutomateOverviewChart.AIAgentAutomatedInteractionsKPIChart]: {
                chartComponent: AIAgentAutomatedInteractionsKPIChart,
                label: AI_AGENT_AUTOMATED_INTERACTIONS_COUNT_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: fetchAIAgentAutomatedInteractionsTrend,
                        metricFormat: 'integer',
                    },
                ],
                description: AI_AGENT_AUTOMATED_INTERACTIONS_TOOLTIP.title,
                chartType: ChartType.Card,
            },
            [AutomateOverviewChart.AIAgentAutomatedInteractionsGraphBar]: {
                chartComponent: AIAgentAutomatedInteractionsGraphBar,
                label: AI_AGENT_AUTOMATED_INTERACTIONS_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.TimeSeriesPerDimension,
                        fetch: fetchAIAgentInteractionsDatasetBySkillTimeSeries,
                        title: AUTOMATE_AI_AGENT_INTERACTIONS_FILENAME,
                        headers: [
                            DATES_WITHIN_PERIOD_LABEL,
                            AUTOMATE_AI_AGENT_SUPPORT_LABEL,
                            AUTOMATE_AI_AGENT_SALES_LABEL,
                        ],
                        dimensions: [
                            AIAgentSkills.AIAgentSupport,
                            AIAgentSkills.AIAgentSales,
                        ],
                    },
                ],
                description: AI_AGENT_BAR_CHART_TOOLTIP.title,
                chartType: ChartType.Graph,
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
