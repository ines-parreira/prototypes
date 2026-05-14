import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiAgentTicketsClosedScope = defineScope({
    scope: MetricScope.AiAgentTicketsClosed,
    measures: ['closedTicketsCount', 'zeroTouchTicketsCount'],
    dimensions: [
        'aiAgentRole',
        'channel',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'closedTicketsCount',
        'eventDatetime',
        'ticketId',
        'zeroTouchTicketsCount',
    ],
})

export type AiAgentTicketsClosedContext = Context<
    typeof aiAgentTicketsClosedScope.config
>
