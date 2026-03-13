import { MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

export const aiAgentCoverageRateScope = defineScope({
    scope: MetricScope.AiAgentCoverageRate,
    measures: ['coverageRate'],
    dimensions: ['aiAgentSkill', 'channel', 'ticketId'],
    timeDimensions: ['eventDatetime'],
    filters: [
        'aiAgentSkill',
        'channel',
        'engagementType',
        'periodEnd',
        'periodStart',
        'storeIntegrationId',
    ],
    order: ['coverageRate', 'eventDatetime', 'ticketId'],
})

export type AiAgentCoverageRateContext = Context<
    typeof aiAgentCoverageRateScope.config
>
