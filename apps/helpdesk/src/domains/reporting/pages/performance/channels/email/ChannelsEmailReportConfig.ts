import { METRIC_TOOLTIPS } from 'domains/reporting/config/metricTooltipDefinitions'
import { getStatsTrendFetch } from 'domains/reporting/hooks/useStatsMetricTrend'
import { channelsEmailFirstResponseTimeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/firstResponseTime'
import { channelsEmailHumanResponseTimeAfterAiHandoffValueQueryFactoryV2 } from 'domains/reporting/models/scopes/humanResponseTimeAfterAiHandoff'
import { channelsEmailMessagesPerTicketValueQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesPerTicket'
import { channelsEmailMessagesSentValueQueryFactoryV2 } from 'domains/reporting/models/scopes/messagesSent'
import { channelsEmailResolutionTimeValueQueryFactoryV2 } from 'domains/reporting/models/scopes/resolutionTime'
import { channelsEmailAverageCsatValueQueryFactoryV2 } from 'domains/reporting/models/scopes/satisfactionSurveys'
import { channelsEmailClosedTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsClosed'
import { channelsEmailCreatedTicketsValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsCreated'
import { channelsEmailTicketsRepliedValueQueryFactoryV2 } from 'domains/reporting/models/scopes/ticketsReplied'
import { FilterKey } from 'domains/reporting/models/stat/types'
import { ReportsIDs } from 'domains/reporting/pages/dashboards/constants'
import type { ReportConfig } from 'domains/reporting/pages/dashboards/types'
import {
    ChartType,
    DataExportFormat,
} from 'domains/reporting/pages/dashboards/types'
import { ChannelsEmailAverageCSATCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailAverageCSATCard'
import { ChannelsEmailClosedTicketsCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailClosedTicketsCard'
import { ChannelsEmailCreatedTicketsCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailCreatedTicketsCard'
import { ChannelsEmailFirstResponseTimeCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailFirstResponseTimeCard'
import { ChannelsEmailHumanResponseTimeAfterAiHandoffCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailHumanResponseTimeAfterAiHandoffCard'
import { ChannelsEmailMessagesPerTicketCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailMessagesPerTicketCard'
import { ChannelsEmailMessagesSentCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailMessagesSentCard'
import { ChannelsEmailResolutionTimeCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailResolutionTimeCard'
import { ChannelsEmailTicketsRepliedCard } from 'domains/reporting/pages/performance/channels/email/charts/kpiCharts/ChannelsEmailTicketsRepliedCard'
import { PERFORMANCE_CHANNELS_OPTIONAL_FILTERS } from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import { STATS_ROUTES } from 'routes/constants'

export enum PerformanceChannelsEmailChart {
    AverageCSATCard = 'performance-channels-email-average-csat-card',
    ResolutionTimeCard = 'performance-channels-email-resolution-time-card',
    MessagesPerTicketCard = 'performance-channels-email-messages-per-ticket-card',
    FirstResponseTimeCard = 'performance-channels-email-first-response-time-card',
    HumanResponseTimeAfterAiHandoffCard = 'performance-channels-email-human-response-time-after-ai-handoff-card',
    CreatedTicketsCard = 'performance-channels-email-created-tickets-card',
    ClosedTicketsCard = 'performance-channels-email-closed-tickets-card',
    TicketsRepliedCard = 'performance-channels-email-tickets-replied-card',
    MessagesSentCard = 'performance-channels-email-messages-sent-card',
}

export const ChannelsEmailReportConfig: ReportConfig<PerformanceChannelsEmailChart> =
    {
        id: ReportsIDs.PerformanceChannelsEmailReportConfig,
        reportName: 'Channels > Email',
        reportPath: STATS_ROUTES.PERFORMANCE_CHANNELS,
        charts: {
            [PerformanceChannelsEmailChart.AverageCSATCard]: {
                chartComponent: ChannelsEmailAverageCSATCard,
                label: METRIC_TOOLTIPS.averageCSAT.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailAverageCsatValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.averageCSAT,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'more-is-better',
            },
            [PerformanceChannelsEmailChart.ResolutionTimeCard]: {
                chartComponent: ChannelsEmailResolutionTimeCard,
                label: METRIC_TOOLTIPS.resolutionTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailResolutionTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.resolutionTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [PerformanceChannelsEmailChart.MessagesPerTicketCard]: {
                chartComponent: ChannelsEmailMessagesPerTicketCard,
                label: METRIC_TOOLTIPS.messagesPerTicket.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailMessagesPerTicketValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.messagesPerTicket,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'less-is-better',
            },
            [PerformanceChannelsEmailChart.FirstResponseTimeCard]: {
                chartComponent: ChannelsEmailFirstResponseTimeCard,
                label: METRIC_TOOLTIPS.firstResponseTime.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailFirstResponseTimeValueQueryFactoryV2,
                        ),
                        metricFormat: 'duration',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.firstResponseTime,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'duration',
                interpretAs: 'less-is-better',
            },
            [PerformanceChannelsEmailChart.HumanResponseTimeAfterAiHandoffCard]:
                {
                    chartComponent:
                        ChannelsEmailHumanResponseTimeAfterAiHandoffCard,
                    label: METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff
                        .title,
                    csvProducer: [
                        {
                            type: DataExportFormat.Trend,
                            fetch: getStatsTrendFetch(
                                channelsEmailHumanResponseTimeAfterAiHandoffValueQueryFactoryV2,
                            ),
                            metricFormat: 'duration',
                        },
                    ],
                    tooltipConfig:
                        METRIC_TOOLTIPS.humanResponseTimeAfterAiHandoff,
                    chartType: ChartType.CardWithTimeseries,
                    metricFormat: 'duration',
                    interpretAs: 'less-is-better',
                },
            [PerformanceChannelsEmailChart.CreatedTicketsCard]: {
                chartComponent: ChannelsEmailCreatedTicketsCard,
                label: 'Email tickets created',
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailCreatedTicketsValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.createdTickets,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
            [PerformanceChannelsEmailChart.ClosedTicketsCard]: {
                chartComponent: ChannelsEmailClosedTicketsCard,
                label: METRIC_TOOLTIPS.performanceClosedTickets.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailClosedTicketsValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.performanceClosedTickets,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
            [PerformanceChannelsEmailChart.TicketsRepliedCard]: {
                chartComponent: ChannelsEmailTicketsRepliedCard,
                label: METRIC_TOOLTIPS.ticketsReplied.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailTicketsRepliedValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.ticketsReplied,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
            [PerformanceChannelsEmailChart.MessagesSentCard]: {
                chartComponent: ChannelsEmailMessagesSentCard,
                label: METRIC_TOOLTIPS.messagesSent.title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: getStatsTrendFetch(
                            channelsEmailMessagesSentValueQueryFactoryV2,
                        ),
                        metricFormat: 'decimal',
                    },
                ],
                tooltipConfig: METRIC_TOOLTIPS.messagesSent,
                chartType: ChartType.CardWithTimeseries,
                metricFormat: 'decimal',
                interpretAs: 'neutral',
            },
        },
        reportFilters: {
            optional: PERFORMANCE_CHANNELS_OPTIONAL_FILTERS,
            persistent: [FilterKey.Period, FilterKey.AggregationWindow],
        },
    }
