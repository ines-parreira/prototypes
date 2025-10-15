import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const resolutionTimeScope = defineScope({
    scope: MetricScope.ResolutionTime,
    measures: ['medianResolutionTime'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'resolutionTime',
    ],
    timeDimensions: ['createdDatetime'],
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
    order: ['tickets', 'medianResolutionTime'],
})

export const medianResolutionTime = resolutionTimeScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME)
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
    }))

export const medianResolutionTimePerAgent = resolutionTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_AGENT,
    )
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
        dimensions: ['agentId'] as const,
    }))

export const medianResolutionTimePerChannel = resolutionTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_CHANNEL,
    )
    .defineQuery(() => ({
        measures: ['medianResolutionTime'] as const,
        dimensions: ['channel'] as const,
    }))
