import {
    MetricPerChannelQueryHook,
    useClosedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
    useCustomerSatisfactionMetricPerChannel,
    useMedianFirstResponseTimeMetricPerChannel,
    useMedianResolutionTimeMetricPerChannel,
    useMedianResponseTimeMetricPerChannel,
    useMessagesReceivedMetricPerChannel,
    useMessagesSentMetricPerChannel,
    useTicketAverageHandleTimePerChannel,
    useTicketsRepliedMetricPerChannel,
} from 'hooks/reporting/support-performance/channels/metricsPerChannel'
import { usePercentageOfCreatedTicketsMetricPerChannel } from 'hooks/reporting/support-performance/channels/usePercentageOfCreatedTicketsMetricPerChannel'
import { ticketHandleTimePerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/customerSatisfaction'
import { firstResponseTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianFirstResponseTime'
import { resolutionTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/messagesSent'
import { ticketsCreatedPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerTicketDrillDownQueryFactory } from 'models/reporting/queryFactories/support-performance/ticketsReplied'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'
import { DrillDownQueryFactory } from 'pages/stats/common/drill-down/DrillDownTableConfig'
import { Domain } from 'pages/stats/common/drill-down/types'
import { MetricValueFormat } from 'pages/stats/common/utils'
import {
    METRIC_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'pages/stats/support-performance/agents/AgentsTableConfig'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'pages/stats/support-performance/overview/SupportPerformanceOverviewConfig'
import { TooltipData } from 'pages/stats/types'
import {
    AVERAGE_RESPONSE_TIME_LABEL,
    CHANNEL_COLUMN_LABEL,
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_RECEIVED_LABEL,
    MESSAGES_SENT_LABEL,
    PERCENT_OF_CREATED_TICKETS,
    TICKET_HANDLE_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'services/reporting/constants'
import {
    ChannelsTableColumns,
    ChannelsTableViewIdentifier,
    TableSetting,
} from 'state/ui/stats/types'

export const LeadColumn = ChannelsTableColumns.Channel
export const columnsOrder: ChannelsTableColumns[] = [
    ChannelsTableColumns.Channel,
    ChannelsTableColumns.TicketsCreated,
    ChannelsTableColumns.CreatedTicketsPercentage,
    ChannelsTableColumns.ClosedTickets,
    ChannelsTableColumns.TicketHandleTime,
    ChannelsTableColumns.FirstResponseTime,
    ChannelsTableColumns.MedianResolutionTime,
    ChannelsTableColumns.TicketsReplied,
    ChannelsTableColumns.MessagesSent,
    ChannelsTableColumns.CustomerSatisfaction,
    ChannelsTableColumns.MessagesReceived,
]

export const ChannelsTableLabels: Record<ChannelsTableColumns, string> = {
    [ChannelsTableColumns.Channel]: CHANNEL_COLUMN_LABEL,
    [ChannelsTableColumns.TicketsCreated]: TICKETS_CREATED_LABEL,
    [ChannelsTableColumns.CreatedTicketsPercentage]: PERCENT_OF_CREATED_TICKETS,
    [ChannelsTableColumns.ClosedTickets]: TICKETS_CLOSED_LABEL,
    [ChannelsTableColumns.TicketHandleTime]: TICKET_HANDLE_TIME_LABEL,
    [ChannelsTableColumns.FirstResponseTime]: MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    [ChannelsTableColumns.MedianResolutionTime]: MEDIAN_RESOLUTION_TIME_LABEL,
    [ChannelsTableColumns.TicketsReplied]: TICKETS_REPLIED_LABEL,
    [ChannelsTableColumns.MessagesSent]: MESSAGES_SENT_LABEL,
    [ChannelsTableColumns.MessagesReceived]: MESSAGES_RECEIVED_LABEL,
    [ChannelsTableColumns.CustomerSatisfaction]: CUSTOMER_SATISFACTION_LABEL,
    [ChannelsTableColumns.MedianResponseTime]: AVERAGE_RESPONSE_TIME_LABEL,
}

export const ChannelColumnConfig: Record<
    ChannelsTableColumns,
    {
        format: MetricValueFormat
        hint: TooltipData | null
        useMetric: MetricPerChannelQueryHook
        drillDownQuery: DrillDownQueryFactory
        showMetric: boolean
        domain: Domain.Ticket
    }
> = {
    [ChannelsTableColumns.Channel]: {
        format: 'integer',
        hint: null,
        useMetric: () => ({
            isFetching: false,
            isError: false,
            data: {
                value: null,
                decile: null,
                allData: [],
            },
        }),
        drillDownQuery: ticketsCreatedPerTicketDrillDownQueryFactory, //TODO: clean up
        showMetric: false,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.TicketsCreated]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.TicketsCreated].hint,
        useMetric: useCreatedTicketsMetricPerChannel,
        drillDownQuery: ticketsCreatedPerTicketDrillDownQueryFactory,
        showMetric: false,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.CreatedTicketsPercentage]: {
        format: 'percent',
        hint: {
            title: 'Proportion of tickets created in the given channel.',
        },
        useMetric: usePercentageOfCreatedTicketsMetricPerChannel,
        drillDownQuery: ticketsCreatedPerTicketDrillDownQueryFactory,
        showMetric: false,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.ClosedTickets]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.TicketsClosed].hint,
        useMetric: useClosedTicketsMetricPerChannel,
        drillDownQuery: closedTicketsPerTicketDrillDownQueryFactory,
        showMetric: false,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.TicketHandleTime]: {
        format: 'duration',
        hint: OverviewMetricConfig[OverviewMetric.TicketHandleTime].hint,
        useMetric: useTicketAverageHandleTimePerChannel,
        drillDownQuery: ticketHandleTimePerTicketDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.FirstResponseTime]: {
        format: 'duration',
        hint: OverviewMetricConfig[OverviewMetric.MedianFirstResponseTime].hint,
        useMetric: useMedianFirstResponseTimeMetricPerChannel,
        drillDownQuery: firstResponseTimeMetricPerTicketDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.MedianResponseTime]: {
        format: 'duration',
        hint: OverviewMetricConfig[OverviewMetric.MedianResponseTime].hint,
        useMetric: useMedianResponseTimeMetricPerChannel,
        drillDownQuery: medianResponseTimeMetricPerTicketDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.MedianResolutionTime]: {
        format: 'duration',
        hint: OverviewMetricConfig[OverviewMetric.MedianResolutionTime].hint,
        useMetric: useMedianResolutionTimeMetricPerChannel,
        drillDownQuery: resolutionTimeMetricPerTicketDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.TicketsReplied]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.TicketsReplied].hint,
        useMetric: useTicketsRepliedMetricPerChannel,
        drillDownQuery: ticketsRepliedMetricPerTicketDrillDownQueryFactory,
        showMetric: false,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.MessagesSent]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.MessagesSent].hint,
        useMetric: useMessagesSentMetricPerChannel,
        drillDownQuery: messagesSentMetricPerTicketDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.MessagesReceived]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.MessagesReceived].hint,
        useMetric: useMessagesReceivedMetricPerChannel,
        drillDownQuery: messagesReceivedMetricPerTicketDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.CustomerSatisfaction]: {
        format: 'decimal',
        hint: OverviewMetricConfig[OverviewMetric.CustomerSatisfaction].hint,
        useMetric: useCustomerSatisfactionMetricPerChannel,
        drillDownQuery: customerSatisfactionMetricDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
}

export const channelsMetrics = columnsOrder.map((column) => ({
    id: column,
    visibility: true,
}))
export const ChannelsTableViews: TableSetting<ChannelsTableColumns> = {
    active_view: ChannelsTableViewIdentifier.ChannelsReport,
    views: [],
}

const CHANNEL_COLUMN_WIDTH = 240
export const MOBILE_CHANNEL_COLUMN_WIDTH = 180

export const getColumnWidth = (column: ChannelsTableColumns) => {
    if (isMediumOrSmallScreen()) {
        return column === LeadColumn
            ? MOBILE_CHANNEL_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }
    return column === LeadColumn ? CHANNEL_COLUMN_WIDTH : METRIC_COLUMN_WIDTH
}

export const channelsReportTableActiveView = {
    id: ChannelsTableViewIdentifier.ChannelsReport,
    name: 'Channels report',
    metrics: channelsMetrics,
}
