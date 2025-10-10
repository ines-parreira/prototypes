import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const ticketHandleTimeScope = defineScope({
    scope: MetricScope.TicketHandleTime,
    measures: ['averageHandleTime', 'handleTime'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations', 'handleTime'],
    timeDimensions: ['createdDatetime', 'closedDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'csatScores',
        'integrations',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracyScore',
        'efficiencyScore',
        'internalComplianceScore',
        'brandVoiceScore',
        'customFields',
        'tags',
    ],
    order: ['tickets', 'handleTime'],
})

export const ticketHandleTime = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_HANDLE_TIME)
    .defineQuery(() => ({
        measures: ['handleTime'] as const,
    }))

export const ticketAverageHandleTime = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME)
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
    }))

export const ticketAverageHandleTimePerAgent = ticketHandleTimeScope
    .defineMetricName(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT)
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
        dimensions: ['agents'] as const,
    }))

export const ticketAverageHandleTimePerChannel = ticketHandleTimeScope
    .defineMetricName(
        METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['averageHandleTime'] as const,
        dimensions: ['channels'] as const,
    }))
