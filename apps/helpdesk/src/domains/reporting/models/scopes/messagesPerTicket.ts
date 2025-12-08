import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const messagesPerTicketScope = defineScope({
    scope: MetricScope.MessagesPerTicket,
    measures: ['messagesAverage'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'messagesCount',
    ],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime', 'messagesCount'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'teams',
        'channels',
        'score',
        'integrations',
        'stores',
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

export const messagesPerTicketCount = messagesPerTicketScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET)
    .defineQuery(() => ({
        measures: ['messagesAverage'] as const,
    }))

export const messagesPerTicketCountQueryV2Factory = (ctx: Context) =>
    messagesPerTicketCount.build(ctx)
