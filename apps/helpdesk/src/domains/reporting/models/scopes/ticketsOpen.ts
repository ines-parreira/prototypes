import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const ticketsOpenScope = defineScope({
    scope: MetricScope.TicketsOpen,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime'],
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

export const openTicketsCount = ticketsOpenScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_OPEN_TICKETS)
    .defineQuery(() => ({
        measures: ['ticketCount'],
    }))
