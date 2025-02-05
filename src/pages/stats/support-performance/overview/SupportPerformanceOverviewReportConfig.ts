import {
    fetchWorkloadPerChannelDistribution,
    fetchWorkloadPerChannelDistributionForPreviousPeriod,
} from 'hooks/reporting/distributions'
import {FilterKey} from 'models/stat/types'
import {
    ChartType,
    DataExportFormat,
    ReportConfig,
} from 'pages/stats/custom-reports/types'
import {CustomerSatisfactionTrendCard} from 'pages/stats/support-performance/overview/charts/CustomerSatisfactionTrendCard'
import {MedianResolutionTimeTrendCard} from 'pages/stats/support-performance/overview/charts/MedianResolutionTimeTrendCard'
import {MedianFirstResponseTimeTrendCard} from 'pages/stats/support-performance/overview/charts/MedianResponseTimeTrendCard'
import {MessagesPerTicketTrendCard} from 'pages/stats/support-performance/overview/charts/MessagesPerTicketTrendCard'
import {MessagesSentGraph} from 'pages/stats/support-performance/overview/charts/MessagesSentGraph'
import {MessagesSentTrendCard} from 'pages/stats/support-performance/overview/charts/MessagesSentTrendCard'
import {OneTouchTicketsTrendCard} from 'pages/stats/support-performance/overview/charts/OneTouchTicketsTrendCard'
import {OpenTicketsTrendCard} from 'pages/stats/support-performance/overview/charts/OpenTicketsTrendCard'
import {TicketHandleTimeTrendCard} from 'pages/stats/support-performance/overview/charts/TicketHandleTimeTrendCard'
import {TicketsClosedTrendCard} from 'pages/stats/support-performance/overview/charts/TicketsClosedTrendCard'
import {TicketsCreatedTrendCard} from 'pages/stats/support-performance/overview/charts/TicketsCreatedTrendCard'
import {TicketsCreatedVsClosedChart} from 'pages/stats/support-performance/overview/charts/TicketsCreatedVsClosedChart'
import {TicketsRepliedGraph} from 'pages/stats/support-performance/overview/charts/TicketsRepliedGraph'
import {TicketsRepliedTrendCard} from 'pages/stats/support-performance/overview/charts/TicketsRepliedTrendCard'
import {WorkloadPerChannelChart} from 'pages/stats/support-performance/overview/charts/WorkloadPerChannelChart'
import {
    OverviewChartConfig,
    OverviewMetric,
    OverviewMetricConfig,
    PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
    TICKETS_CREATED_VS_CLOSED_HINT,
    WORKLOAD_BY_CHANNEL_HINT,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import {
    TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
    WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'

export const SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE =
    'Support performance overview'

export enum OverviewChart {
    CustomerSatisfactionTrendCard = 'customer_satisfaction_trend_card',
    MedianFirstResponseTimeTrendCard = 'median_first_response_time_trend_card',
    MedianResolutionTimeTrendCard = 'median_resolution_time_trend_card',
    MessagesPerTicketTrendCard = 'messages_per_ticket_trend_card',
    TicketsCreatedTrendCard = 'tickets_created_trend_card',
    TicketsClosedTrendCard = 'tickets_closed_trend_card',
    OpenTicketsTrendCard = 'open_tickets_trend_card',
    WorkloadPerChannelChart = 'workload_per_channel_chart',
    TicketsCreatedVsClosedChart = 'tickets_created_vs_closed_chart',
    TicketsRepliedTrendCard = 'tickets_replied_trend_card',
    MessagesSentTrendCard = 'messages_sent_trend_card',
    TicketHandleTimeTrendCard = 'ticket_handle_time_trend_card',
    OneTouchTicketsTrendCard = 'one_touch_tickets_trend_card',
    TicketsRepliedGraph = 'tickets_replied_graph',
    MessagesSentGraph = 'messages_sent_graph',
}

export const SupportPerformanceOverviewReportConfig: ReportConfig<OverviewChart> =
    {
        reportName: SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE,
        reportPath: 'support-performance-overview',
        charts: {
            [OverviewChart.CustomerSatisfactionTrendCard]: {
                chartComponent: CustomerSatisfactionTrendCard,
                label: OverviewMetricConfig[OverviewMetric.CustomerSatisfaction]
                    .title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.CustomerSatisfaction
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[
                                OverviewMetric.CustomerSatisfaction
                            ].metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.CustomerSatisfaction]
                        .hint.title,
                chartType: ChartType.Card,
            },
            [OverviewChart.MedianFirstResponseTimeTrendCard]: {
                chartComponent: MedianFirstResponseTimeTrendCard,
                label: OverviewMetricConfig[
                    OverviewMetric.MedianFirstResponseTime
                ].title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.MedianFirstResponseTime
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[
                                OverviewMetric.MedianFirstResponseTime
                            ].metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.MedianFirstResponseTime]
                        .hint.title,
                chartType: ChartType.Card,
            },
            [OverviewChart.MedianResolutionTimeTrendCard]: {
                chartComponent: MedianResolutionTimeTrendCard,
                label: OverviewMetricConfig[OverviewMetric.MedianResolutionTime]
                    .title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.MedianResolutionTime
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[
                                OverviewMetric.MedianResolutionTime
                            ].metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.MedianResolutionTime]
                        .hint.title,
                chartType: ChartType.Card,
            },
            [OverviewChart.MessagesPerTicketTrendCard]: {
                chartComponent: MessagesPerTicketTrendCard,
                label: OverviewMetricConfig[OverviewMetric.MessagesPerTicket]
                    .title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.MessagesPerTicket
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[
                                OverviewMetric.MessagesPerTicket
                            ].metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.MessagesPerTicket].hint
                        .title,
                chartType: ChartType.Card,
            },
            [OverviewChart.TicketsCreatedTrendCard]: {
                chartComponent: TicketsCreatedTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketsCreated]
                    .title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.TicketsCreated
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[OverviewMetric.TicketsCreated]
                                .metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.TicketsCreated].hint
                        .title,
                chartType: ChartType.Card,
            },
            [OverviewChart.TicketsClosedTrendCard]: {
                chartComponent: TicketsClosedTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketsClosed].title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.TicketsClosed
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[OverviewMetric.TicketsClosed]
                                .metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.TicketsClosed].hint
                        .title,
                chartType: ChartType.Card,
            },
            [OverviewChart.OpenTicketsTrendCard]: {
                chartComponent: OpenTicketsTrendCard,
                label: OverviewMetricConfig[OverviewMetric.OpenTickets].title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[OverviewMetric.OpenTickets]
                            .fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[OverviewMetric.OpenTickets]
                                .metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.OpenTickets].hint.title,
                chartType: ChartType.Card,
            },
            [OverviewChart.WorkloadPerChannelChart]: {
                chartComponent: WorkloadPerChannelChart,
                label: TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
                csvProducer: [
                    {
                        type: DataExportFormat.Distribution,
                        fetch: {
                            fetchCurrentDistribution:
                                fetchWorkloadPerChannelDistribution,
                            fetchPreviousDistribution:
                                fetchWorkloadPerChannelDistributionForPreviousPeriod,
                            labelPrefix: WORKLOAD_BY_CHANNEL_LABEL,
                        },
                    },
                ],
                description: WORKLOAD_BY_CHANNEL_HINT.description,
                chartType: ChartType.Graph,
            },
            [OverviewChart.TicketsCreatedVsClosedChart]: {
                chartComponent: TicketsCreatedVsClosedChart,
                label: TICKETS_CREATED_VS_CLOSED_HINT.title,
                csvProducer: [
                    {
                        type: DataExportFormat.TimeSeries,
                        fetch: OverviewChartConfig[
                            OverviewMetric.TicketsCreated
                        ].fetchTimeSeries,
                        title: OverviewChartConfig[
                            OverviewMetric.TicketsCreated
                        ].title,
                    },
                    {
                        type: DataExportFormat.TimeSeries,
                        fetch: OverviewChartConfig[OverviewMetric.TicketsClosed]
                            .fetchTimeSeries,
                        title: OverviewChartConfig[OverviewMetric.TicketsClosed]
                            .title,
                    },
                ],
                description: TICKETS_CREATED_VS_CLOSED_HINT.description,
                chartType: ChartType.Graph,
            },
            [OverviewChart.TicketsRepliedTrendCard]: {
                chartComponent: TicketsRepliedTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketsReplied]
                    .title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.TicketsReplied
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[OverviewMetric.TicketsReplied]
                                .metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.TicketsReplied].hint
                        .title,
                chartType: ChartType.Card,
            },
            [OverviewChart.MessagesSentTrendCard]: {
                chartComponent: MessagesSentTrendCard,
                label: OverviewMetricConfig[OverviewMetric.MessagesSent].title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[OverviewMetric.MessagesSent]
                            .fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[OverviewMetric.MessagesSent]
                                .metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.MessagesSent].hint
                        .title,
                chartType: ChartType.Card,
            },
            [OverviewChart.TicketHandleTimeTrendCard]: {
                chartComponent: TicketHandleTimeTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketHandleTime]
                    .title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.TicketHandleTime
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[
                                OverviewMetric.TicketHandleTime
                            ].metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.TicketHandleTime].hint
                        .title,
                chartType: ChartType.Card,
            },
            [OverviewChart.OneTouchTicketsTrendCard]: {
                chartComponent: OneTouchTicketsTrendCard,
                label: OverviewMetricConfig[OverviewMetric.OneTouchTickets]
                    .title,
                csvProducer: [
                    {
                        type: DataExportFormat.Trend,
                        fetch: OverviewMetricConfig[
                            OverviewMetric.OneTouchTickets
                        ].fetchTrend,
                        metricFormat:
                            OverviewMetricConfig[OverviewMetric.OneTouchTickets]
                                .metricFormat,
                    },
                ],
                description:
                    OverviewMetricConfig[OverviewMetric.OneTouchTickets].hint
                        .title,
                chartType: ChartType.Card,
            },
            [OverviewChart.TicketsRepliedGraph]: {
                chartComponent: TicketsRepliedGraph,
                label: OverviewChartConfig[OverviewMetric.TicketsReplied].title,
                csvProducer: [
                    {
                        type: DataExportFormat.TimeSeries,
                        fetch: OverviewChartConfig[
                            OverviewMetric.TicketsReplied
                        ].fetchTimeSeries,
                    },
                ],
                description:
                    OverviewChartConfig[OverviewMetric.TicketsReplied].hint
                        .title,
                chartType: ChartType.Graph,
            },
            [OverviewChart.MessagesSentGraph]: {
                chartComponent: MessagesSentGraph,
                label: OverviewChartConfig[OverviewMetric.MessagesSent].title,
                csvProducer: [
                    {
                        type: DataExportFormat.TimeSeries,
                        fetch: OverviewChartConfig[OverviewMetric.MessagesSent]
                            .fetchTimeSeries,
                    },
                ],
                description:
                    OverviewChartConfig[OverviewMetric.MessagesSent].hint.title,
                chartType: ChartType.Graph,
            },
        },
        reportFilters: {
            persistent: [FilterKey.AggregationWindow, FilterKey.Period],
            optional: PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS,
        },
    }
