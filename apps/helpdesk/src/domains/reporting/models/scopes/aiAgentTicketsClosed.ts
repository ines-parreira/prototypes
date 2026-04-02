import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
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

export const closedTicketsCount = aiAgentTicketsClosedScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_ALL_AGENTS_CLOSED_TICKETS)
    .defineQuery(() => ({
        measures: ['closedTicketsCount'] as const,
    }))

export const closedTicketsCountQueryV2Factory = (
    ctx: AiAgentTicketsClosedContext,
) => closedTicketsCount.build(ctx)

export const zeroTouchTicketsCount = aiAgentTicketsClosedScope
    .defineMetricName(METRIC_NAMES.AI_AGENT_ALL_AGENTS_ZERO_TOUCH_TICKETS)
    .defineQuery(() => ({
        measures: ['zeroTouchTicketsCount'] as const,
    }))

export const zeroTouchTicketsCountQueryV2Factory = (
    ctx: AiAgentTicketsClosedContext,
) => zeroTouchTicketsCount.build(ctx)
