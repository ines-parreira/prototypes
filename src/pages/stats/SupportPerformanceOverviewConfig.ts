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
} from 'services/reporting/constants'
import {OverviewMetric} from 'state/ui/stats/types'
import {TooltipData} from './types'

export const overviewMetricConfig: Record<
    OverviewMetric,
    {
        hint: TooltipData
        title: string
    }
> = {
    [OverviewMetric.CustomerSatisfaction]: {
        title: CUSTOMER_SATISFACTION_LABEL,
        hint: {
            title: 'Average CSAT score for tickets assigned to the agent for which a survey was sent within the timeframe; surveys are sent following ticket resolution',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#1customer-satisfaction-csat',
        },
    },
    [OverviewMetric.MedianFirstResponseTime]: {
        title: MEDIAN_FIRST_RESPONSE_TIME_LABEL,
        hint: {
            title: 'Median time between 1st customer message and 1st agent response, for tickets where the response was sent within the selected timeframe',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#2-first-response-time',
        },
    },
    [OverviewMetric.MedianResolutionTime]: {
        title: MEDIAN_RESOLUTION_TIME_LABEL,
        hint: {
            title: 'Median time between 1st customer message and the last time the ticket was closed, for tickets closed within the selected timeframe',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#3-resolution-time',
        },
    },
    [OverviewMetric.MessagesPerTicket]: {
        title: MESSAGES_PER_TICKET_LABEL,
        hint: {
            title: 'Average number of messages exchanged in tickets closed within the selected timeframe; includes auto-responses',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#4-messages-per-ticket',
        },
    },
    [OverviewMetric.OpenTickets]: {
        title: OPEN_TICKETS_LABEL,
        hint: {
            title: 'Number of tickets with the status “open” at the end of the period',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#1-open-tickets',
        },
    },
    [OverviewMetric.TicketsClosed]: {
        title: TICKETS_CLOSED_LABEL,
        hint: {
            title: 'Number of unique closed tickets within the selected timeframe (that did not reopen), assigned to selected agent(s)/team(s)',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#2-closed-tickets',
        },
    },
    [OverviewMetric.TicketsCreated]: {
        title: TICKETS_CREATED_LABEL,
        hint: {
            title: 'Number of inbound and outbound tickets created within the selected timeframe.\nWhen filtering by an agent, only tickets created by the agent are counted.',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#3-tickets-created',
        },
    },
    [OverviewMetric.TicketsReplied]: {
        title: TICKETS_REPLIED_LABEL,
        hint: {
            title: 'Number of unique tickets where an agent or rule sent a message within the selected timeframe',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#4-tickets-replied',
        },
    },
    [OverviewMetric.MessagesSent]: {
        title: MESSAGES_SENT_LABEL,
        hint: {
            title: 'Number of messages sent by an agent or rule within the selected timeframe (excluding internal-notes)',
            link: 'https://docs.gorgias.com/en-US/support-performance-overview-update-226700#5-messages-sent',
        },
    },
}
