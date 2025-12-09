import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const ticketsOpenScope = defineScope({
    scope: MetricScope.TicketsOpen,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'score',
        'integrationId',
        'storeId',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'customFields',
        'tags',
    ],
})

export const openTicketsCount = ticketsOpenScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_OPEN_TICKETS)
    .defineQuery(() => ({
        measures: ['ticketCount'],
    }))

export const openTicketsCountQueryV2Factory = (ctx: Context) =>
    openTicketsCount.build(ctx)
