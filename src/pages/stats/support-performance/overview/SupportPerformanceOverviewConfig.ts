import {
    fetchClosedTicketsTrend,
    fetchCustomerSatisfactionTrend,
    fetchMedianFirstResponseTimeTrend,
    fetchMedianResolutionTimeTrend,
    fetchMessagesPerTicketTrend,
    fetchMessagesSentTrend,
    fetchOpenTicketsTrend,
    fetchTicketHandleTimeTrend,
    fetchTicketsCreatedTrend,
    fetchTicketsRepliedTrend,
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useTicketHandleTimeTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {
    fetchOneTouchTicketsPercentageMetricTrend,
    useOneTouchTicketsPercentageMetricTrend,
} from 'hooks/reporting/support-performance/agents/useOneTouchTicketsPercentageMetricTrend'
import {
    fetchMessagesSentTimeSeries,
    fetchTicketsClosedTimeSeries,
    fetchTicketsCreatedTimeSeries,
    fetchTicketsRepliedTimeSeries,
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {MetricTrendFetch, MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {TimeSeriesFetch, TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import {FilterKey} from 'models/stat/types'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {TooltipData} from 'pages/stats/types'
import {
    CREATED_VS_CLOSED_TICKETS_LABEL,
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    MESSAGES_PER_TICKET_LABEL,
    MESSAGES_SENT_LABEL,
    ONE_TOUCH_TICKETS_LABEL,
    OPEN_TICKETS_LABEL,
    TICKET_HANDLE_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    TOTAL_WORKLOAD_BY_CHANNEL_LABEL,
} from 'services/reporting/constants'

export enum OverviewMetric {
    CustomerSatisfaction = 'customer_satisfaction',
    MedianFirstResponseTime = 'median_first_response_time',
    MessagesPerTicket = 'messages_per_ticket',
    MessagesSent = 'messages_sent',
    OpenTickets = 'open_tickets',
    MedianResolutionTime = 'median_resolution_time',
    TicketsClosed = 'tickets_closed',
    TicketsCreated = 'tickets_created',
    TicketsReplied = 'tickets_replied',
    OneTouchTickets = 'one_touch_tickets',
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
    },
}

export type TimeSeriesMetric =
    | OverviewMetric.TicketsCreated
    | OverviewMetric.TicketsClosed
    | OverviewMetric.TicketsReplied
    | OverviewMetric.MessagesSent

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
        hint: {title: 'Number of new tickets to handle'},
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
        hint: {title: 'Number of tickets where the customer got a response'},
        useTimeSeries: useTicketsRepliedTimeSeries,
        fetchTimeSeries: fetchTicketsRepliedTimeSeries,
    },
    [OverviewMetric.MessagesSent]: {
        title: MESSAGES_SENT_LABEL,
        hint: {title: 'Number of messages received by your customer'},
        useTimeSeries: useMessagesSentTimeSeries,
        fetchTimeSeries: fetchMessagesSentTimeSeries,
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
]

export const PERFORMANCE_OVERVIEW_CHART_TYPE = 'bar'
export const STATS_TIPS_VISIBILITY_KEY = 'gorgias-stats-tips-visibility'
