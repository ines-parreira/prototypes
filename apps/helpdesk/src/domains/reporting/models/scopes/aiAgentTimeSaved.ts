import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiAgentTimeSavedScope = defineScope({
    scope: MetricScope.AiAgentTimeSaved,
    measures: ['averageTimeSavedByAgent', 'medianTimeSavedByAgent'],
    dimensions: [
        'aiAgentSkill',
        'channel',
        'customField',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
        'channel',
        'customField',
        'customFieldId',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: [
        'averageTimeSavedByAgent',
        'eventDatetime',
        'medianTimeSavedByAgent',
        'ticketId',
    ],
})

export type AiAgentTimeSavedContext = Context<
    typeof aiAgentTimeSavedScope.config
>
