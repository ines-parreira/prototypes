import {
    MetricPerChannelQueryHook,
    useClosedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
    useCustomerSatisfactionMetricPerChannel,
    useMedianFirstResponseTimeMetricPerChannel,
    useMedianResolutionTimeMetricPerChannel,
    useMessagesSentMetricPerChannel,
    useTicketAverageHandleTimePerChannel,
    useTicketsRepliedMetricPerChannel,
} from 'hooks/reporting/metricsPerChannel'
import {usePercentageOfCreatedTicketsMetricPerChannel} from 'hooks/reporting/usePercentageOfCreatedTicketsMetricPerChannel'
import {isMediumOrSmallScreen} from 'pages/common/utils/mobile'
import {
    METRIC_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'pages/stats/AgentsTableConfig'
import {MetricValueFormat} from 'pages/stats/common/utils'
import {OverviewMetricConfig} from 'pages/stats/SupportPerformanceOverviewConfig'
import {TooltipData} from 'pages/stats/types'
import {
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_SENT_LABEL,
    PERCENT_OF_CREATED_TICKETS,
    TICKET_HANDLE_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'services/reporting/constants'
import {
    ChannelsTableViewIdentifier,
    OverviewMetric,
    TableSetting,
} from 'state/ui/stats/types'

export enum ChannelsTableColumns {
    Channel = 'channels_channel',
    TicketsCreated = 'channels_tickets_created',
    CreatedTicketsPercentage = 'channels_created_tickets_as_percentage',
    ClosedTickets = 'channels_closed_tickets',
    TicketHandleTime = 'channels_ticket_handle_time',
    FirstResponseTime = 'channels_first_response_time',
    MedianResolutionTime = 'channels_median_resolution_time',
    TicketsReplied = 'channels_tickets_replied',
    MessagesSent = 'channels_messages_sent',
    CustomerSatisfaction = 'channels_customer_satisfaction',
}

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
]

export const ChannelsTableLabels: Record<ChannelsTableColumns, string> = {
    [ChannelsTableColumns.Channel]: 'Channel',
    [ChannelsTableColumns.TicketsCreated]: TICKETS_CREATED_LABEL,
    [ChannelsTableColumns.CreatedTicketsPercentage]: PERCENT_OF_CREATED_TICKETS,
    [ChannelsTableColumns.ClosedTickets]: TICKETS_CLOSED_LABEL,
    [ChannelsTableColumns.TicketHandleTime]: TICKET_HANDLE_TIME_LABEL,
    [ChannelsTableColumns.FirstResponseTime]: MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    [ChannelsTableColumns.MedianResolutionTime]: MEDIAN_RESOLUTION_TIME_LABEL,
    [ChannelsTableColumns.TicketsReplied]: TICKETS_REPLIED_LABEL,
    [ChannelsTableColumns.MessagesSent]: MESSAGES_SENT_LABEL,
    [ChannelsTableColumns.CustomerSatisfaction]: CUSTOMER_SATISFACTION_LABEL,
}

export const ChannelColumnConfig: Record<
    ChannelsTableColumns,
    {
        format: MetricValueFormat
        hint: TooltipData | null
        useMetric: MetricPerChannelQueryHook
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
    },
    [ChannelsTableColumns.TicketsCreated]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.TicketsCreated].hint,
        useMetric: useCreatedTicketsMetricPerChannel,
    },
    [ChannelsTableColumns.CreatedTicketsPercentage]: {
        format: 'percent',
        hint: {
            title: 'Proportion of tickets created in the given channel.',
        },
        useMetric: usePercentageOfCreatedTicketsMetricPerChannel,
    },
    [ChannelsTableColumns.ClosedTickets]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.TicketsClosed].hint,
        useMetric: useClosedTicketsMetricPerChannel,
    },
    [ChannelsTableColumns.TicketHandleTime]: {
        format: 'duration',
        hint: OverviewMetricConfig[OverviewMetric.TicketHandleTime].hint,
        useMetric: useTicketAverageHandleTimePerChannel,
    },
    [ChannelsTableColumns.FirstResponseTime]: {
        format: 'duration',
        hint: OverviewMetricConfig[OverviewMetric.MedianFirstResponseTime].hint,
        useMetric: useMedianFirstResponseTimeMetricPerChannel,
    },
    [ChannelsTableColumns.MedianResolutionTime]: {
        format: 'duration',
        hint: OverviewMetricConfig[OverviewMetric.MedianResolutionTime].hint,
        useMetric: useMedianResolutionTimeMetricPerChannel,
    },
    [ChannelsTableColumns.TicketsReplied]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.TicketsReplied].hint,
        useMetric: useTicketsRepliedMetricPerChannel,
    },
    [ChannelsTableColumns.MessagesSent]: {
        format: 'integer',
        hint: OverviewMetricConfig[OverviewMetric.MessagesSent].hint,
        useMetric: useMessagesSentMetricPerChannel,
    },
    [ChannelsTableColumns.CustomerSatisfaction]: {
        format: 'decimal',
        hint: OverviewMetricConfig[OverviewMetric.CustomerSatisfaction].hint,
        useMetric: useCustomerSatisfactionMetricPerChannel,
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

const CHANNEL_COLUMN_WIDTH = 200
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
