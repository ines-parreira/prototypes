import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiAgentAutomatedInteractionsScope = defineScope({
    scope: MetricScope.AiAgentAutomatedInteractions,
    measures: ['automatedInteractionsCount'],
    dimensions: [
        'aiAgentSkill',
        'channel',
        'customField',
        'engagementType',
        'storeIntegrationId',
        'ticketId',
    ],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
        'channel',
        'customField',
        'customFieldId',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['automatedInteractionsCount', 'eventDatetime', 'ticketId'],
})

export type AiAgentAutomatedInteractionsContext = Context<
    typeof aiAgentAutomatedInteractionsScope.config
>
