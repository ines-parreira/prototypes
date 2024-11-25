import {ReportConfig} from 'pages/stats/common/CustomReport/types'

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
    TICKETS_CREATED_VS_CLOSED_HINT,
    WORKLOAD_BY_CHANNEL_HINT,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'

const SUPPORT_PERFORMANCE_OVERVIEW_PAGE_TITLE = 'Support performance overview'

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
                label: OverviewMetric.CustomerSatisfaction,
            },
            [OverviewChart.MedianFirstResponseTimeTrendCard]: {
                chartComponent: MedianFirstResponseTimeTrendCard,
                label: OverviewMetric.MedianFirstResponseTime,
            },
            [OverviewChart.MedianResolutionTimeTrendCard]: {
                chartComponent: MedianResolutionTimeTrendCard,
                label: OverviewMetric.MedianResolutionTime,
            },
            [OverviewChart.MessagesPerTicketTrendCard]: {
                chartComponent: MessagesPerTicketTrendCard,
                label: OverviewMetric.MedianResolutionTime,
            },
            [OverviewChart.TicketsCreatedTrendCard]: {
                chartComponent: TicketsCreatedTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketsCreated].hint
                    .title,
            },
            [OverviewChart.TicketsClosedTrendCard]: {
                chartComponent: TicketsClosedTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketsClosed].hint
                    .title,
            },
            [OverviewChart.OpenTicketsTrendCard]: {
                chartComponent: OpenTicketsTrendCard,
                label: OverviewMetricConfig[OverviewMetric.OpenTickets].hint
                    .title,
            },
            [OverviewChart.WorkloadPerChannelChart]: {
                chartComponent: WorkloadPerChannelChart,
                label: WORKLOAD_BY_CHANNEL_HINT.title,
            },
            [OverviewChart.TicketsCreatedVsClosedChart]: {
                chartComponent: TicketsCreatedVsClosedChart,
                label: TICKETS_CREATED_VS_CLOSED_HINT.title,
            },
            [OverviewChart.TicketsRepliedTrendCard]: {
                chartComponent: TicketsRepliedTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketsReplied].hint
                    .title,
            },
            [OverviewChart.MessagesSentTrendCard]: {
                chartComponent: MessagesSentTrendCard,
                label: OverviewMetricConfig[OverviewMetric.MessagesSent].hint
                    .title,
            },
            [OverviewChart.TicketHandleTimeTrendCard]: {
                chartComponent: TicketHandleTimeTrendCard,
                label: OverviewMetricConfig[OverviewMetric.TicketHandleTime]
                    .hint.title,
            },
            [OverviewChart.OneTouchTicketsTrendCard]: {
                chartComponent: OneTouchTicketsTrendCard,
                label: OverviewMetricConfig[OverviewMetric.OneTouchTickets].hint
                    .title,
            },
            [OverviewChart.TicketsRepliedGraph]: {
                chartComponent: TicketsRepliedGraph,
                label: OverviewChartConfig[OverviewMetric.TicketsReplied].hint
                    .title,
            },
            [OverviewChart.MessagesSentGraph]: {
                chartComponent: MessagesSentGraph,
                label: OverviewChartConfig[OverviewMetric.MessagesSent].hint
                    .title,
            },
        },
    }
