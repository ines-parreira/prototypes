import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiAgentDecreaseInFirstResponseTimeScope = defineScope({
    scope: MetricScope.AiAgentDecreaseInFirstResponseTime,
    measures: [
        'averageDecreaseInFirstResponseTime',
        'medianDecreaseInFirstResponseTime',
    ],
    dimensions: [
        'aiAgentRole',
        'aiAgentSkill',
        'channel',
        'customField',
        'engagementType',
        'firstResponseTime',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentRole',
        'aiAgentSkill',
        'channel',
        'customField',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'averageDecreaseInFirstResponseTime',
        'eventDatetime',
        'firstResponseTime',
        'medianDecreaseInFirstResponseTime',
        'ticketId',
    ],
})

export type AiAgentDecreaseInFirstResponseTimeContext = Context<
    typeof aiAgentDecreaseInFirstResponseTimeScope.config
>
