export const CUSTOMER_SATISFACTION_LABEL = 'Customer satisfaction'
export const FIRST_RESPONSE_TIME_LABEL = 'First response time'
export const RESOLUTION_TIME_LABEL = 'Resolution time'
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

export enum MetricName {
    CustomerSatisfaction = 'customerSatisfaction',
    FirstResponseTime = 'firstResponseTime',
    ResolutionTime = 'resolutionTime',
    MessagesPerTicket = 'messagesPerTicket',
}

export const MetricNameToLabelMap: Record<MetricName, string> = {
    [MetricName.CustomerSatisfaction]: CUSTOMER_SATISFACTION_LABEL,
    [MetricName.FirstResponseTime]: FIRST_RESPONSE_TIME_LABEL,
    [MetricName.ResolutionTime]: RESOLUTION_TIME_LABEL,
    [MetricName.MessagesPerTicket]: MESSAGES_PER_TICKET_LABEL,
}
