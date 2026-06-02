import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { getStatsTrendFetch } from 'domains/reporting/hooks/useStatsMetricTrend'
import { firstResponseTimeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { humanResponseTimeAfterAiHandoffValueQueryFactoryV2 } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { messagesPerTicketValueQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { sentMessagesValueQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesSent'
import { resolutionTimeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { averageScoreQueryV2Factory } from 'domains/reporting/models/scopes/satisfactionSurveys'
import { closedTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsClosed'
import { createdTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import { ticketsRepliedValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsReplied'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import {
    fetchPerformanceOverviewAgentAsConfigurableTable,
    PERFORMANCE_OVERVIEW_AGENT_TABLE,
    PerformanceOverviewAgentTable,
} from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewAgentTable'
import {
    fetchPerformanceOverviewChannelAsConfigurableTable,
    PERFORMANCE_OVERVIEW_CHANNEL_TABLE,
    PerformanceOverviewChannelTable,
} from 'domains/reporting/pages/performance/overview/charts/breakdownTables/PerformanceOverviewChannelTable'
import { OverviewAverageCSATCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewAverageCSATCard'
import { OverviewClosedTicketsCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewClosedTicketsCard'
import { OverviewCreatedTicketsCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewCreatedTicketsCard'
import { OverviewFirstResponseTimeCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewFirstResponseTimeCard'
import { OverviewHumanResponseTimeAfterAiHandoffCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewHumanResponseTimeAfterAiHandoffCard'
import { OverviewMessagesPerTicketCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewMessagesPerTicketCard'
import { OverviewMessagesSentCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewMessagesSentCard'
import { OverviewResolutionTimeCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewResolutionTimeCard'
import { OverviewTicketsRepliedCard } from 'domains/reporting/pages/performance/overview/charts/kpiCharts/OverviewTicketsRepliedCard'
import { PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { STATS_ROUTES } from 'routes/constants'

export enum PerformanceOverviewChart {
    AverageCSATCard = 'performance-overview-average-csat-card',
    ResolutionTimeCard = 'performance-overview-resolution-time-card',
    MessagesPerTicketCard = 'performance-overview-messages-per-ticket-card',
    FirstResponseTimeCard = 'performance-overview-first-response-time-card',
    HumanResponseTimeAfterAiHandoffCard = 'performance-overview-human-response-time-after-ai-handoff-card',
    CreatedTicketsCard = 'performance-overview-created-tickets-card',
    ClosedTicketsCard = 'performance-overview-closed-tickets-card',
    TicketsRepliedCard = 'performance-overview-tickets-replied-card',
    MessagesSentCard = 'performance-overview-messages-sent-card',
    AgentTable = 'performance-overview-agent-table',
    ChannelTable = 'performance-overview-channel-table',
}

export const PerformanceOverviewReportConfig: ReportConfig<PerformanceOverviewChart> =
    {
        id: ReportsIDs.PerformanceOverviewReportConfig,
        reportName: 'Performance',
        reportPath: STATS_ROUTES.PERFORMANCE_OVERVIEW,
        charts: {
            [PerformanceOverviewChart.AverageCSATCard]: {
                chartComponent: OverviewAverageCSATCard,
                label: METRIC_TOOLTIPS.averageCSAT.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(averageScoreQueryV2Factory),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.averageCSAT,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [PerformanceOverviewChart.ResolutionTimeCard]: {
                chartComponent: OverviewResolutionTimeCard,
                label: METRIC_TOOLTIPS.resolutionTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            resolutionTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.resolutionTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [PerformanceOverviewChart.MessagesPerTicketCard]: {
                chartComponent: OverviewMessagesPerTicketCard,
                label: METRIC_TOOLTIPS.messagesPerTicket.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            messagesPerTicketValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.messagesPerTicket,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [PerformanceOverviewChart.FirstResponseTimeCard]: {
                chartComponent: OverviewFirstResponseTimeCard,
                label: METRIC_TOOLTIPS.firstResponseTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            firstResponseTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.firstResponseTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [PerformanceOverviewChart.HumanResponseTimeAfterAiHandoffCard]: {
                chartComponent: OverviewHumanResponseTimeAfterAiHandoffCard,
                label: METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            humanResponseTimeAfterAiHandoffValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [PerformanceOverviewChart.CreatedTicketsCard]: {
                chartComponent: OverviewCreatedTicketsCard,
                label: METRIC_TOOLTIPS.createdTickets.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            createdTicketsValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.createdTickets,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
            [PerformanceOverviewChart.ClosedTicketsCard]: {
                chartComponent: OverviewClosedTicketsCard,
                label: METRIC_TOOLTIPS.performanceClosedTickets.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            closedTicketsValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.performanceClosedTickets,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
            [PerformanceOverviewChart.TicketsRepliedCard]: {
                chartComponent: OverviewTicketsRepliedCard,
                label: METRIC_TOOLTIPS.ticketsReplied.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            ticketsRepliedValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.ticketsReplied,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
            [PerformanceOverviewChart.MessagesSentCard]: {
                chartComponent: OverviewMessagesSentCard,
                label: METRIC_TOOLTIPS.messagesSent.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            sentMessagesValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.messagesSent,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
            [PerformanceOverviewChart.AgentTable]: {
                chartComponent: PerformanceOverviewAgentTable,
                label: PERFORMANCE_OVERVIEW_AGENT_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchPerformanceOverviewAgentAsConfigurableTable,
                    },
                ],
                description: PERFORMANCE_OVERVIEW_AGENT_TABLE.description,
                chartType: ChartType.Table,
            },
            [PerformanceOverviewChart.ChannelTable]: {
                chartComponent: PerformanceOverviewChannelTable,
                label: PERFORMANCE_OVERVIEW_CHANNEL_TABLE.title,
                csvProducer: [
                    {
                        type: DataExportFormat.ConfigurableTable,
                        fetch: fetchPerformanceOverviewChannelAsConfigurableTable,
                    },
                ],
                description: PERFORMANCE_OVERVIEW_CHANNEL_TABLE.description,
                chartType: ChartType.Table,
            },
        },
        reportFilters: {
            optional: PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
