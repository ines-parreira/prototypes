import {
    fetchClosedTicketsTrend,
    fetchCustomerSatisfactionTrend,
    fetchMedianFirstResponseTimeTrend,
    fetchMedianResolutionTimeTrend,
    fetchMedianResponseTimeTrend,
    fetchMessagesPerTicketTrend,
    fetchMessagesReceivedTrend,
    fetchMessagesSentTrend,
    fetchOpenTicketsTrend,
    fetchTicketHandleTimeTrend,
    fetchTicketsCreatedTrend,
    fetchTicketsRepliedTrend,
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMedianResponseTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesReceivedTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useTicketHandleTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'domains/reporting/hooks/metricTrends'
import {
    fetchOneTouchTicketsPercentageMetricTrend,
    useOneTouchTicketsPercentageMetricTrend,
} from 'domains/reporting/hooks/support-performance/overview/useOneTouchTicketsPercentageMetricTrend'
import {
    fetchZeroTouchTicketsMetricTrend,
    useZeroTouchTicketsMetricTrend,
} from 'domains/reporting/hooks/support-performance/overview/useZeroTouchTicketsMetricTrend'
import {
    fetchMessagesSentTimeSeries,
    fetchOneTouchTicketsTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
    fetchZeroTouchTicketsTimeSeries,
    useMessagesSentTimeSeries,
    useOneTouchTicketsTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
    useZeroTouchTicketsTimeSeries,
} from 'domains/reporting/hooks/timeSeries'
import {
    MetricTrendFetch,
    MetricTrendHook,
} from 'domains/reporting/hooks/useMetricTrend'
import {
    TimeSeriesFetch,
    TimeSeriesHook,
} from 'domains/reporting/hooks/useTimeSeries'
import { ticketHandleTimePerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/agentxp/ticketHandleTime'
import { closedTicketsPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/closedTickets'
import { customerSatisfactionMetricDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/customerSatisfaction'
import { firstResponseTimeMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianFirstResponseTime'
import { resolutionTimeMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResolutionTime'
import { medianResponseTimeMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/medianResponseTime'
import { messagesPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesPerTicket'
import { messagesReceivedMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesReceived'
import { messagesSentMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/messagesSent'
import { oneTouchTicketsPerTicketQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/oneTouchTickets'
import { openTicketsPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/openTickets'
import { ticketsCreatedPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsCreated'
import { ticketsRepliedMetricPerTicketDrillDownQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/ticketsReplied'
import { zeroTouchTicketsPerTicketQueryFactory } from 'domains/reporting/models/queryFactories/support-performance/zeroTouchTickets'
import { FilterKey } from 'domains/reporting/models/stat/types'
import {
    Domain,
    DrillDownQueryFactory,
} from 'domains/reporting/pages/common/drill-down/types'
import { AUTO_QA_FILTER_KEYS } from 'domains/reporting/pages/common/filters/constants'
import { MetricTrendFormat } from 'domains/reporting/pages/common/utils'
import { TooltipData } from 'domains/reporting/pages/types'
import {
    AVERAGE_RESPONSE_TIME_LABEL,
    CREATED_VS_CLOSED_TICKETS_LABEL,
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_PER_TICKET_LABEL,
    MESSAGES_RECEIVED_LABEL,
    MESSAGES_SENT_LABEL,
    ONE_TOUCH_TICKETS_LABEL,
    OPEN_TICKETS_LABEL,
    TICKET_HANDLE_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
    ZERO_TOUCH_TICKETS_LABEL,
} from 'domains/reporting/services/constants'

export enum OverviewMetric {
    CustomerSatisfaction = 'customer_satisfaction',
    MedianFirstResponseTime = 'median_first_response_time',
    MedianResponseTime = 'median_response_time',
    MessagesPerTicket = 'messages_per_ticket',
    MessagesSent = 'messages_sent',
    MessagesReceived = 'messages_received',
    OpenTickets = 'open_tickets',
    MedianResolutionTime = 'median_resolution_time',
    TicketsClosed = 'tickets_closed',
    TicketsCreated = 'tickets_created',
    TicketsReplied = 'tickets_replied',
    OneTouchTickets = 'one_touch_tickets',
    ZeroTouchTickets = 'zero_touch_tickets',
    TicketHandleTime = 'ticket_handle_time',
}

export const OverviewMetricConfig: Record<
    OverviewMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        fetchTrend: MetricTrendFetch
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat: MetricTrendFormat
        showMetric: boolean
        domain: Domain.Ticket
        drillDownQuery: DrillDownQueryFactory
    }
> = {
    [OverviewMetric.CustomerSatisfaction]: {
        title: CUSTOMER_SATISFACTION_LABEL,
        hint: {
            title: 'Average CSAT score for tickets for which a survey was sent within the timeframe; surveys are sent following ticket resolution.',
            link: 'https://link.gorgias.com/3ol',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'decimal',
        useTrend: useCustomerSatisfactionTrend,
        fetchTrend: fetchCustomerSatisfactionTrend,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: customerSatisfactionMetricDrillDownQueryFactory,
    },
    [OverviewMetric.MedianResponseTime]: {
        title: AVERAGE_RESPONSE_TIME_LABEL,
        hint: {
            title: 'Average response time between message sent by customer and response from the ticket agent response',
        },
        interpretAs: 'less-is-better',
        metricFormat: 'duration',
        useTrend: useMedianResponseTimeTrend,
        fetchTrend: fetchMedianResponseTimeTrend,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: medianResponseTimeMetricPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.MedianFirstResponseTime]: {
        title: MEDIAN_FIRST_RESPONSE_TIME_LABEL,
        hint: {
            title: 'Median time between 1st customer message and 1st agent response, for tickets where the response was sent within the selected timeframe',
            link: 'https://link.gorgias.com/svd',
        },
        interpretAs: 'less-is-better',
        metricFormat: 'duration',
        useTrend: useMedianFirstResponseTimeTrend,
        fetchTrend: fetchMedianFirstResponseTimeTrend,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: firstResponseTimeMetricPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.MedianResolutionTime]: {
        title: MEDIAN_RESOLUTION_TIME_LABEL,
        hint: {
            title: 'Median time between 1st customer message and the last time the ticket was closed, for tickets closed within the selected timeframe',
            link: 'https://link.gorgias.com/5v7',
        },
        interpretAs: 'less-is-better',
        metricFormat: 'duration',
        useTrend: useMedianResolutionTimeTrend,
        fetchTrend: fetchMedianResolutionTimeTrend,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: resolutionTimeMetricPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.MessagesPerTicket]: {
        title: MESSAGES_PER_TICKET_LABEL,
        hint: {
            title: 'Average number of messages exchanged in tickets closed within the selected timeframe; includes auto-responses',
            link: 'https://link.gorgias.com/fhq',
        },
        interpretAs: 'less-is-better',
        metricFormat: 'decimal',
        useTrend: useMessagesPerTicketTrend,
        fetchTrend: fetchMessagesPerTicketTrend,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: messagesPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.OpenTickets]: {
        title: OPEN_TICKETS_LABEL,
        hint: {
            title: 'Number of tickets with the status “open” at the end of the period. Only counts tickets that have been created during or within the 180 days preceding the start of the period.',
            link: 'https://link.gorgias.com/78k',
        },
        interpretAs: 'neutral',
        metricFormat: 'decimal',
        useTrend: useOpenTicketsTrend,
        fetchTrend: fetchOpenTicketsTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: openTicketsPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.TicketsClosed]: {
        title: TICKETS_CLOSED_LABEL,
        hint: {
            title: 'Number of unique closed tickets within the selected timeframe (that did not reopen).',
            link: 'https://link.gorgias.com/126',
        },
        interpretAs: 'neutral',
        metricFormat: 'decimal',
        useTrend: useClosedTicketsTrend,
        fetchTrend: fetchClosedTicketsTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: closedTicketsPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.TicketsCreated]: {
        title: TICKETS_CREATED_LABEL,
        hint: {
            title: 'Number of inbound and outbound tickets created within the selected timeframe.',
            link: 'https://link.gorgias.com/bji',
        },
        interpretAs: 'neutral',
        metricFormat: 'decimal',
        useTrend: useTicketsCreatedTrend,
        fetchTrend: fetchTicketsCreatedTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: ticketsCreatedPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.TicketsReplied]: {
        title: TICKETS_REPLIED_LABEL,
        hint: {
            title: 'Number of unique tickets where an agent sent a message within the selected timeframe',
            link: 'https://link.gorgias.com/27b',
        },
        interpretAs: 'neutral',
        metricFormat: 'decimal',
        useTrend: useTicketsRepliedTrend,
        fetchTrend: fetchTicketsRepliedTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: ticketsRepliedMetricPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.MessagesSent]: {
        title: MESSAGES_SENT_LABEL,
        hint: {
            title: 'Number of messages sent by an agent within the selected timeframe (excluding internal-notes)',
            link: 'https://link.gorgias.com/jo0',
        },
        interpretAs: 'neutral',
        metricFormat: 'decimal',
        useTrend: useMessagesSentTrend,
        fetchTrend: fetchMessagesSentTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: messagesSentMetricPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.MessagesReceived]: {
        title: MESSAGES_RECEIVED_LABEL,
        hint: {
            title: 'Number of messages received within the selected timeframe',
        },
        interpretAs: 'neutral',
        metricFormat: 'decimal',
        useTrend: useMessagesReceivedTrend,
        fetchTrend: fetchMessagesReceivedTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: messagesReceivedMetricPerTicketDrillDownQueryFactory,
    },
    [OverviewMetric.OneTouchTickets]: {
        title: ONE_TOUCH_TICKETS_LABEL,
        hint: {
            title: 'Percentage of tickets closed within the selected timeframe with exactly 1 message sent by an agent or rule.',
            link: 'https://link.gorgias.com/dk7',
        },
        interpretAs: 'more-is-better',
        metricFormat: 'percent',
        useTrend: useOneTouchTicketsPercentageMetricTrend,
        fetchTrend: fetchOneTouchTicketsPercentageMetricTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: oneTouchTicketsPerTicketQueryFactory,
    },
    [OverviewMetric.ZeroTouchTickets]: {
        title: ZERO_TOUCH_TICKETS_LABEL,
        hint: {
            title: 'Number of tickets closed without agent reply.',
            link: '', // TODO: update link
        },
        interpretAs: 'neutral',
        metricFormat: 'decimal',
        useTrend: useZeroTouchTicketsMetricTrend,
        fetchTrend: fetchZeroTouchTicketsMetricTrend,
        showMetric: false,
        domain: Domain.Ticket,
        drillDownQuery: zeroTouchTicketsPerTicketQueryFactory,
    },
    [OverviewMetric.TicketHandleTime]: {
        title: TICKET_HANDLE_TIME_LABEL,
        hint: {
            title: 'Average amount of time spent by any agent on tickets closed during the selected time.',
            link: 'https://link.gorgias.com/eq6',
        },
        interpretAs: 'less-is-better',
        metricFormat: 'duration',
        useTrend: useTicketHandleTimeTrend,
        fetchTrend: fetchTicketHandleTimeTrend,
        showMetric: true,
        domain: Domain.Ticket,
        drillDownQuery: ticketHandleTimePerTicketDrillDownQueryFactory,
    },
}

export type TimeSeriesMetric =
    | OverviewMetric.TicketsCreated
    | OverviewMetric.TicketsClosed
    | OverviewMetric.TicketsReplied
    | OverviewMetric.MessagesSent
    | OverviewMetric.OneTouchTickets
    | OverviewMetric.ZeroTouchTickets

export const OverviewChartConfig: Record<
    TimeSeriesMetric,
    {
        title: string
        hint: TooltipData
        useTimeSeries: TimeSeriesHook
        fetchTimeSeries: TimeSeriesFetch
    }
> = {
    [OverviewMetric.TicketsCreated]: {
        title: TICKETS_CREATED_LABEL,
        hint: { title: 'Number of new tickets to handle' },
        useTimeSeries: useTicketsCreatedTimeSeries,
        fetchTimeSeries: fetchTicketsCreatedTimeSeries,
    },
    [OverviewMetric.TicketsClosed]: {
        title: TICKETS_CLOSED_LABEL,
        hint: {
            title: 'Number of opened tickets solved by the end of the period',
        },
        useTimeSeries: useTicketsClosedTimeSeries,
        fetchTimeSeries: fetchTicketsClosedTimeSeries,
    },
    [OverviewMetric.TicketsReplied]: {
        title: TICKETS_REPLIED_LABEL,
        hint: { title: 'Number of tickets where the customer got a response' },
        useTimeSeries: useTicketsRepliedTimeSeries,
        fetchTimeSeries: fetchTicketsRepliedTimeSeries,
    },
    [OverviewMetric.MessagesSent]: {
        title: MESSAGES_SENT_LABEL,
        hint: { title: 'Number of messages received by your customer' },
        useTimeSeries: useMessagesSentTimeSeries,
        fetchTimeSeries: fetchMessagesSentTimeSeries,
    },
    [OverviewMetric.OneTouchTickets]: {
        title: ONE_TOUCH_TICKETS_LABEL,
        hint: {
            title: 'Percentage of tickets closed within the selected timeframe with exactly 1 message sent by an agent or rule.',
        },
        useTimeSeries: useOneTouchTicketsTimeSeries,
        fetchTimeSeries: fetchOneTouchTicketsTimeSeries,
    },
    [OverviewMetric.ZeroTouchTickets]: {
        title: ZERO_TOUCH_TICKETS_LABEL,
        hint: { title: 'Number of tickets closed without agent reply.' },
        useTimeSeries: useZeroTouchTicketsTimeSeries,
        fetchTimeSeries: fetchZeroTouchTicketsTimeSeries,
    },
}

export const WORKLOAD_BY_CHANNEL_HINT = {
    title: TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
    description:
        'Total number of tickets that had to be handled during the selected timeframe(all closed tickets plus tickets that are still open at the end of the period) broken down by channel.\n\nFor open tickets, only counts tickets that have been created during or within the 180 days preceding the start of the period.',
    link: 'https://link.gorgias.com/wub',
}

export const TICKETS_CREATED_VS_CLOSED_HINT = {
    title: CREATED_VS_CLOSED_TICKETS_LABEL,
    description:
        'Total number of tickets that had to be handled during the selected timeframe broken down by channel',
    link: 'https://link.gorgias.com/q3m',
}

export const PERFORMANCE_OVERVIEW_OPTIONAL_FILTERS = [
    FilterKey.Channels,
    FilterKey.Integrations,
    FilterKey.Tags,
    FilterKey.Agents,
    FilterKey.CustomFields,
    FilterKey.Score,
    ...AUTO_QA_FILTER_KEYS,
]

export const PERFORMANCE_OVERVIEW_CHART_TYPE = 'bar'
export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'
