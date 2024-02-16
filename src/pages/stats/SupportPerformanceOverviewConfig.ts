import {
    useMessagesSentTimeSeries,
    useTicketsClosedTimeSeries,
    useTicketsCreatedTimeSeries,
    useTicketsRepliedTimeSeries,
} from 'hooks/reporting/timeSeries'
import {TimeSeriesHook} from 'hooks/reporting/useTimeSeries'
import {
    useClosedTicketsTrend,
    useCustomerSatisfactionTrend,
    useMedianFirstResponseTimeTrend,
    useMedianResolutionTimeTrend,
    useMessagesPerTicketTrend,
    useMessagesSentTrend,
    useOpenTicketsTrend,
    useTicketsCreatedTrend,
    useTicketsRepliedTrend,
} from 'hooks/reporting/metricTrends'
import {MetricTrendHook} from 'hooks/reporting/useMetricTrend'
import {MetricTrendFormat} from 'pages/stats/common/utils'
import {
    CUSTOMER_SATISFACTION_LABEL,
    MEDIAN_FIRST_RESPONSE_TIME_LABEL,
    MESSAGES_PER_TICKET_LABEL,
    MESSAGES_SENT_LABEL,
    OPEN_TICKETS_LABEL,
    MEDIAN_RESOLUTION_TIME_LABEL,
    TICKETS_CLOSED_LABEL,
    TICKETS_CREATED_LABEL,
    TICKETS_REPLIED_LABEL,
    ONE_TOUCH_TICKETS_LABEL,
} from 'services/reporting/constants'
import {OverviewMetric} from 'state/ui/stats/types'
import {useOneTouchTicketsPercentageMetric} from 'hooks/reporting/useOneTouchTicketsPercentageMetric'
import {TooltipData} from './types'

export const OverviewMetricConfig: Record<
    OverviewMetric,
    {
        hint: TooltipData
        title: string
        useTrend: MetricTrendHook
        interpretAs: 'more-is-better' | 'less-is-better' | 'neutral'
        metricFormat?: MetricTrendFormat
    }
> = {
    [OverviewMetric.CustomerSatisfaction]: {
        title: CUSTOMER_SATISFACTION_LABEL,
        hint: {
            title: 'Average CSAT score for tickets assigned to the agent for which a survey was sent within the timeframe; surveys are sent following ticket resolution',
            link: 'https://link.gorgias.com/3ol',
        },
        interpretAs: 'more-is-better',
        useTrend: useCustomerSatisfactionTrend,
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
    },
    [OverviewMetric.MessagesPerTicket]: {
        title: MESSAGES_PER_TICKET_LABEL,
        hint: {
            title: 'Average number of messages exchanged in tickets closed within the selected timeframe; includes auto-responses',
            link: 'https://link.gorgias.com/fhq',
        },
        interpretAs: 'less-is-better',
        useTrend: useMessagesPerTicketTrend,
    },
    [OverviewMetric.OpenTickets]: {
        title: OPEN_TICKETS_LABEL,
        hint: {
            title: 'Number of tickets with the status “open” at the end of the period. Only counts tickets that have been created during or within the 180 days preceding the start of the period.',
            link: 'https://link.gorgias.com/78k',
        },
        interpretAs: 'neutral',
        useTrend: useOpenTicketsTrend,
    },
    [OverviewMetric.TicketsClosed]: {
        title: TICKETS_CLOSED_LABEL,
        hint: {
            title: 'Number of unique closed tickets within the selected timeframe (that did not reopen), assigned to selected agent(s)/team(s)',
            link: 'https://link.gorgias.com/126',
        },
        interpretAs: 'neutral',
        useTrend: useClosedTicketsTrend,
    },
    [OverviewMetric.TicketsCreated]: {
        title: TICKETS_CREATED_LABEL,
        hint: {
            title: 'Number of inbound and outbound tickets created within the selected timeframe.\nWhen filtering by an agent, only tickets created by the agent are counted.',
            link: 'https://link.gorgias.com/bji',
        },
        interpretAs: 'neutral',
        useTrend: useTicketsCreatedTrend,
    },
    [OverviewMetric.TicketsReplied]: {
        title: TICKETS_REPLIED_LABEL,
        hint: {
            title: 'Number of unique tickets where an agent sent a message within the selected timeframe',
            link: 'https://link.gorgias.com/27b',
        },
        interpretAs: 'neutral',
        useTrend: useTicketsRepliedTrend,
    },
    [OverviewMetric.MessagesSent]: {
        title: MESSAGES_SENT_LABEL,
        hint: {
            title: 'Number of messages sent by an agent within the selected timeframe (excluding internal-notes)',
            link: 'https://link.gorgias.com/jo0',
        },
        interpretAs: 'neutral',
        useTrend: useMessagesSentTrend,
    },
    [OverviewMetric.OneTouchTickets]: {
        title: ONE_TOUCH_TICKETS_LABEL,
        hint: {
            title: 'Percentage of tickets closed within the selected timeframe with exactly 1 message sent by an agent or rule.',
            link: 'https://link.gorgias.com/dk7',
        },
        interpretAs: 'more-is-better',
        useTrend: useOneTouchTicketsPercentageMetric,
        metricFormat: 'percent',
    },
}

export const OverviewChartConfig: Record<
    | OverviewMetric.TicketsCreated
    | OverviewMetric.TicketsClosed
    | OverviewMetric.TicketsReplied
    | OverviewMetric.MessagesSent,
    {
        title: string
        hint: TooltipData
        useTimeSeries: TimeSeriesHook
    }
> = {
    [OverviewMetric.TicketsCreated]: {
        title: TICKETS_CREATED_LABEL,
        hint: {title: 'Number of new tickets to handle'},
        useTimeSeries: useTicketsCreatedTimeSeries,
    },
    [OverviewMetric.TicketsClosed]: {
        title: TICKETS_CLOSED_LABEL,
        hint: {
            title: 'Number of opened tickets solved by the end of the period',
        },
        useTimeSeries: useTicketsClosedTimeSeries,
    },
    [OverviewMetric.TicketsReplied]: {
        title: TICKETS_REPLIED_LABEL,
        hint: {title: 'Number of tickets where the customer got a response'},
        useTimeSeries: useTicketsRepliedTimeSeries,
    },
    [OverviewMetric.MessagesSent]: {
        title: MESSAGES_SENT_LABEL,
        hint: {title: 'Number of messages received by your customer'},
        useTimeSeries: useMessagesSentTimeSeries,
    },
}

export const WORKLOAD_BY_CHANNEL_HINT = {
    title: 'Total number of tickets that had to be handled during the selected timeframe(all closed tickets plus tickets that are still open at the end of the period) broken down by channel.\n\nFor open tickets, only counts tickets that have been created during or within the 180 days preceding the start of the period.',
    link: 'https://link.gorgias.com/wub',
}

export const TICKETS_CREATED_VS_CLOSED_HINT = {
    title: 'Number of tickets created vs closed over time.',
    link: 'https://link.gorgias.com/3ol',
}
