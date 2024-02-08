export const CUSTOMER_SATISFACTION_LABEL = 'Customer satisfaction'
export const MEDIAN_FIRST_RESPONSE_TIME_LABEL = 'First response time'
export const MEDIAN_RESOLUTION_TIME_LABEL = 'Resolution time'
export const MESSAGES_PER_TICKET_LABEL = 'Messages per ticket'
export const OPEN_TICKETS_LABEL = 'Open tickets'
export const TICKETS_CLOSED_LABEL = 'Closed tickets'
export const TICKETS_CREATED_LABEL = 'Tickets created'
export const TICKETS_REPLIED_LABEL = 'Tickets replied'
export const MESSAGES_SENT_LABEL = 'Messages sent'
export const TOTAL_WORKLOAD_BY_CHANNEL_LABEL = 'Total workload by channel'
export const WORKLOAD_BY_CHANNEL_LABEL = 'workload by channel'
export const DOCUMENTATION_LINK_TEXT = 'How is it calculated?'
export const NOT_AVAILABLE_LABEL = 'N/A'
export const DATE_TIME_FORMAT = 'YYYY-MM-DD'
export const EMPTY_LABEL = ' '
export const CURRENT_PERIOD_LABEL = 'current period'
export const PREVIOUS_PERIOD_LABEL = 'previous period'
export const ONE_TOUCH_TICKETS_LABEL = 'One touch tickets'

export enum MetricName {
    CustomerSatisfaction = 'customerSatisfaction',
    MedianFirstResponseTime = 'medianFirstResponseTime',
    MedianResolutionTime = 'medianResolutionTime',
    MessagesPerTicket = 'messagesPerTicket',
}

export const WORKLOAD_BY_CHANNEL_HINT_MESSAGE =
    'Total number of tickets that had to be handled during the selected timeframe(all closed tickets plus tickets that are still open at the end of the period) broken down by channel.\n\nFor open tickets, only counts tickets that have been created during or within the 180 days preceding the start of the period.'
