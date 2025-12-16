import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const messagesPerTicketScope = defineScope({
    scope: MetricScope.MessagesPerTicket,
    measures: ['averageMessagesCount'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'messagesCount',
    ],
    timeDimensions: ['createdDatetime'],
    order: [
        'ticketId',
        'createdDatetime',
        'messagesCount',
        'averageMessagesCount',
    ],
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

type MessagesPerTicketContext = Context<typeof messagesPerTicketScope.config>

export const messagesPerTicketCount = messagesPerTicketScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET)
    .defineQuery(() => ({
        measures: ['averageMessagesCount'] as const,
    }))

export const messagesPerTicketCountQueryV2Factory = (
    ctx: MessagesPerTicketContext,
) => messagesPerTicketCount.build(ctx)
