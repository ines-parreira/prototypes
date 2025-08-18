import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'

export const CUSTOMER_SATISFACTION_LABEL = 'Average CSAT'
export const MEDIAN_FIRST_RESPONSE_TIME_LABEL = 'First response time'
export const AVERAGE_RESPONSE_TIME_LABEL = 'Average response time'
export const MEDIAN_RESOLUTION_TIME_LABEL = 'Resolution time'
export const HRT_AI_TIME_LABEL = 'Human response time after AI handoff'
export const MESSAGES_PER_TICKET_LABEL = 'Messages per ticket'
export const OPEN_TICKETS_LABEL = 'Open tickets'
export const TICKETS_CLOSED_LABEL = 'Closed tickets'
export const PERCENT_OF_CREATED_TICKETS = '% of created Tickets'
export const PERCENT_OF_CLOSED_TICKETS = '% of Closed Tickets'
export const CHANNEL_COLUMN_LABEL = 'Channel'
export const TICKETS_CREATED_LABEL = 'Created tickets'
export const TICKETS_REPLIED_LABEL = 'Tickets replied'
export const MESSAGES_SENT_LABEL = 'Messages sent'
export const MESSAGES_RECEIVED_LABEL = 'Messages received'
export const TOTAL_WORKLOAD_BY_CHANNEL_LABEL =
    'Open & closed tickets by channel'
export const WORKLOAD_BY_CHANNEL_LABEL = 'workload by channel'
export const DOCUMENTATION_LINK_TEXT = 'How is it calculated?'
export const NOT_AVAILABLE_LABEL = 'N/A'
export const DATE_TIME_FORMAT = 'YYYY-MM-DD'
export const EMPTY_LABEL = ' '
export const CURRENT_PERIOD_LABEL = 'current period'
export const PREVIOUS_PERIOD_LABEL = 'previous period'
export const ONE_TOUCH_TICKETS_LABEL = 'One touch tickets'
export const ZERO_TOUCH_TICKETS_LABEL = 'Zero touch tickets'
export const TICKET_HANDLE_TIME_LABEL = 'Ticket handle time'
export const CREATED_VS_CLOSED_TICKETS_LABEL = 'Created vs. closed tickets'
export const ONLINE_TIME_LABEL = 'Online time'

export const MESSAGES_SENT_PER_HOUR = 'Messages sent per hour'
export const REPLIED_TICKETS_PER_HOUR = 'Tickets replied per hour'
export const CLOSED_TICKETS_PER_HOUR = 'Closed Tickets per hour'

export const ACHIEVEMENT_RATE_LABEL = 'Achievement rate'
export const TICKETS_WITH_BREACHED_SLAS_LABEL = 'Tickets with breached SLAs'
export const BREACHED_SLA_LABEL = 'Breached'
export const ACHIEVED_SLA_LABEL = 'Achieved'
export const PENDING_SLA_LABEL = 'Pending'
export const DATES_WITHIN_PERIOD_LABEL = 'Dates within period'

export enum MetricName {
    CustomerSatisfaction = 'customerSatisfaction',
    MedianFirstResponseTime = 'medianFirstResponseTime',
    MedianResolutionTime = 'medianResolutionTime',
    MessagesPerTicket = 'messagesPerTicket',
    HumanResponseTimeAfterAiHandoff = 'humanResponseTimeAfterAiHandoff',
}

export const SlaStatusLabel: Record<TicketSLAStatus, string> = {
    [TicketSLAStatus.Breached]: BREACHED_SLA_LABEL,
    [TicketSLAStatus.Satisfied]: ACHIEVED_SLA_LABEL,
    [TicketSLAStatus.Pending]: PENDING_SLA_LABEL,
}
