import type { MetricPerChannelQueryHook } from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import {
    useClosedTicketsMetricPerChannel,
    useCreatedTicketsMetricPerChannel,
    useCustomerSatisfactionMetricPerChannel,
    useHumanResponseTimeAfterAiHandoffPerChannel,
    useMedianFirstResponseTimeMetricPerChannel,
    useMedianResolutionTimeMetricPerChannel,
    useMedianResponseTimeMetricPerChannel,
    useMessagesReceivedMetricPerChannel,
    useMessagesSentMetricPerChannel,
    useTicketAverageHandleTimePerChannel,
    useTicketsRepliedMetricPerChannel,
} from 'domains/reporting/hooks/support-performance/channels/metricsPerChannel'
import { usePercentageOfCreatedTicketsMetricPerChannel } from 'domains/reporting/hooks/support-performance/channels/usePercentageOfCreatedTicketsMetricPerChannel'
import { ticketHandleTimePerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { humanResponseTimeAfterAiHandoffDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/humanResponseTimeAfterAiHandoff'
import { firstResponseTimeMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { resolutionTimeMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesReceivedMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { ticketsCreatedPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import type { DrillDownQueryFactory } from 'domains/reporting/pages/common/drill-down/types'
import { Domain } from 'domains/reporting/pages/common/drill-down/types'
import type { MetricValueFormat } from 'domains/reporting/pages/common/utils'
import {
    METRIC_COLUMN_WIDTH,
    MOBILE_METRIC_COLUMN_WIDTH,
} from 'domains/reporting/pages/support-performance/agents/AgentsTableConfig'
import {
    OverviewMetric,
    OverviewMetricConfig,
} from 'domains/reporting/pages/support-performance/overview/SupportPerformanceOverviewConfig'
import type { TooltipData } from 'domains/reporting/pages/types'
import {
    AVERAGE_RESPONSE_TIME_LABEL,
    CHANNEL_COLUMN_LABEL,
    CUSTOMER_SATISFACTION_LABEL,
    HRT_AI_TIME_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_RECEIVED_LABEL,
    MESSAGES_SENT_LABEL,
    PERCENT_OF_CREATED_TICKETS,
    TICKET_HANDLE_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
} from 'domains/reporting/services/constants'
import type { TableSetting } from 'domains/reporting/state/ui/stats/types'
import {
    ChannelsTableColumns,
    ChannelsTableViewIdentifier,
} from 'domains/reporting/state/ui/stats/types'
import { isMediumOrSmallScreen } from 'pages/common/utils/mobile'

export const LeadColumn = ChannelsTableColumns.Channel
export const columnsOrder: ChannelsTableColumns[] = [
    ChannelsTableColumns.Channel,
    ChannelsTableColumns.TicketsCreated,
    ChannelsTableColumns.HumanResponseTimeAfterAiHandoff,
    ChannelsTableColumns.CreatedTicketsPercentage,
    ChannelsTableColumns.ClosedTickets,
    ChannelsTableColumns.TicketHandleTime,
    ChannelsTableColumns.FirstResponseTime,
    ChannelsTableColumns.MedianResponseTime,
    ChannelsTableColumns.MedianResolutionTime,
    ChannelsTableColumns.TicketsReplied,
    ChannelsTableColumns.MessagesSent,
    ChannelsTableColumns.CustomerSatisfaction,
    ChannelsTableColumns.MessagesReceived,
]
export const columnsOrderWithoutHrtAi = columnsOrder.filter(
    (col) => col !== ChannelsTableColumns.HumanResponseTimeAfterAiHandoff,
)

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
    [ChannelsTableColumns.HumanResponseTimeAfterAiHandoff]: HRT_AI_TIME_LABEL,
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
                dimensions: [],
                measures: [],
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
        // dummy factory, we pick query factory at runtime based on feature flag in `drill-down/helpers.ts`
        drillDownQuery: firstResponseTimeMetricPerTicketDrillDownQueryFactory,
        showMetric: true,
        domain: Domain.Ticket,
    },
    [ChannelsTableColumns.HumanResponseTimeAfterAiHandoff]: {
        format: 'duration',
        hint: OverviewMetricConfig[
            OverviewMetric.HumanResponseTimeAfterAiHandoff
        ].hint,
        useMetric: useHumanResponseTimeAfterAiHandoffPerChannel,
        drillDownQuery: humanResponseTimeAfterAiHandoffDrillDownQueryFactory,
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

export const CHANNEL_COLUMN_WIDTH = 240
export const MOBILE_CHANNEL_COLUMN_WIDTH = 180
export const DESKTOP_CHANNEL_COLUMN_WIDTH = 200

export const getColumnWidth = (column: ChannelsTableColumns) => {
    if (isMediumOrSmallScreen()) {
        return column === LeadColumn
            ? MOBILE_CHANNEL_COLUMN_WIDTH
            : MOBILE_METRIC_COLUMN_WIDTH
    }
    return column === LeadColumn
        ? CHANNEL_COLUMN_WIDTH
        : column === ChannelsTableColumns.HumanResponseTimeAfterAiHandoff
          ? DESKTOP_CHANNEL_COLUMN_WIDTH
          : METRIC_COLUMN_WIDTH
}

export const channelsReportTableActiveView = {
    id: ChannelsTableViewIdentifier.ChannelsReport,
    name: 'Channels report',
    metrics: channelsMetrics,
}
