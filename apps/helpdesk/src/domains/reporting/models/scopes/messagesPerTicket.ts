import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const messagesPerTicketScope = defineScope({
    scope: MetricScope.MessagesPerTicket,
    measures: ['messagesAverage'],
    dimensions: [
        'tickets',
        'agents',
        'channels',
        'integrations',
        'messagesCount',
    ],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime', 'messagesCount'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'score',
        'integrations',
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
