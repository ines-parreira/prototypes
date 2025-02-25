import { FilterKey, StaticFilter } from 'models/stat/types'
import { AUTOMATED_INTERACTIONS_LABEL } from 'pages/automate/automate-metrics/constants'
import { AiAgentTableChart } from 'pages/stats/automate/ai-agent/AiAgentTableChart'
import { AutomatedInteractionsMetricCard } from 'pages/stats/automate/ai-agent/AutomatedInteractionsMetricCard'
import {
    AUTOMATED_INTERACTIONS_OVER_TIME_CHART_TITLE,
    AutomatedInteractionsOverTimeChart,
} from 'pages/stats/automate/ai-agent/AutomatedInteractionsOverTimeChart'
import {
    ChartType,
    // DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import { PAGE_TITLE_AI_AGENT } from 'pages/stats/self-service/constants'
import { CustomFieldsTicketCountBreakdownTableChart } from 'pages/stats/ticket-insights/ticket-fields/CustomFieldsTicketCountBreakdownTableChart'
import { TicketDistributionChart } from 'pages/stats/ticket-insights/ticket-fields/TicketDistributionTable'
import {
    TicketInsightsFieldsMetric,
    TicketInsightsFieldsMetricConfig,
} from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldsMetricConfig'
import { TicketInsightsFieldTrend } from 'pages/stats/ticket-insights/ticket-fields/TicketInsightsFieldTrend'
import { STATS_ROUTES } from 'routes/constants'

export enum AutomateAiAgentsChart {
    AiAgentTable = 'automate_ai_agent_table',
    AiAgentTicketDistribution = 'automate_ai_agent_ticket_distribution',
    AiAgentTicketInsightsFieldTrend = 'automate_ai_agent_ticket_insights_field_trend',
    AiAgentCustomFieldsTicketCountBreakdown = 'automate_ai_agent_custom_fields_ticket_count_breakdown',
    AiAgentAutomatedInteractionsMetric = 'automate_ai_agent_automated_interactions_metric',
    AiAgentAutomatedInteractionsOverTime = 'automate_ai_agent_automated_interactions_over_time',
}

export const AUTOMATE_AI_AGENTS_PERSISTENT_FILTERS: StaticFilter[] = [
    FilterKey.Period,
]
export const AUTOMATE_AI_AGENTS_OPTIONAL_FILTERS = []

export const AutomateAiAgentsReportConfig: ReportConfig<AutomateAiAgentsChart> =
    {
        reportName: 'AI Agents',
        reportPath: STATS_ROUTES.AUTOMATE_AI_AGENTS,
        reportFilters: {
            persistent: AUTOMATE_AI_AGENTS_PERSISTENT_FILTERS,
            optional: AUTOMATE_AI_AGENTS_OPTIONAL_FILTERS,
        },
        charts: {
            [AutomateAiAgentsChart.AiAgentTable]: {
                chartType: ChartType.Table,
                chartComponent: AiAgentTableChart,
                label: PAGE_TITLE_AI_AGENT,
                description: '', // TODO: add description
                csvProducer: [],
            },
            [AutomateAiAgentsChart.AiAgentTicketDistribution]: {
                chartType: ChartType.Table,
                chartComponent: TicketDistributionChart,
                label: TicketInsightsFieldsMetricConfig[
                    TicketInsightsFieldsMetric.TicketDistribution
                ].title,
                description:
                    TicketInsightsFieldsMetricConfig[
                        TicketInsightsFieldsMetric.TicketDistribution
                    ].hint.title,
                csvProducer: [],
            },
            [AutomateAiAgentsChart.AiAgentTicketInsightsFieldTrend]: {
                chartType: ChartType.Graph,
                chartComponent: TicketInsightsFieldTrend,
                label: TicketInsightsFieldsMetricConfig[
                    TicketInsightsFieldsMetric.TicketInsightsFieldTrend
                ].title,
                description:
                    TicketInsightsFieldsMetricConfig[
                        TicketInsightsFieldsMetric.TicketInsightsFieldTrend
                    ].hint.title,
                csvProducer: [],
            },
            [AutomateAiAgentsChart.AiAgentCustomFieldsTicketCountBreakdown]: {
                chartType: ChartType.Table,
                chartComponent: CustomFieldsTicketCountBreakdownTableChart,
                label: TicketInsightsFieldsMetricConfig[
                    TicketInsightsFieldsMetric.CustomFieldsTicketCountBreakdown
                ].title,
                description:
                    TicketInsightsFieldsMetricConfig[
                        TicketInsightsFieldsMetric
                            .CustomFieldsTicketCountBreakdown
                    ].hint.title,
                csvProducer: [],
            },
            [AutomateAiAgentsChart.AiAgentAutomatedInteractionsMetric]: {
                chartType: ChartType.Card,
                chartComponent: AutomatedInteractionsMetricCard,
                label: AUTOMATED_INTERACTIONS_LABEL,
                description: '', // TODO: add description
                csvProducer: [],
            },
            [AutomateAiAgentsChart.AiAgentAutomatedInteractionsOverTime]: {
                chartType: ChartType.Graph,
                chartComponent: AutomatedInteractionsOverTimeChart,
                label: AUTOMATED_INTERACTIONS_OVER_TIME_CHART_TITLE,
                description: '', // TODO: add description
                csvProducer: [],
            },
        },
    }
