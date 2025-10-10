import { z } from 'zod'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const firstResponseTimeScope = defineScope({
    scope: MetricScope.FirstResponseTime,
    measures: ['medianFirstResponseTime', 'medianFirstResponseTimeInSeconds'],
    dimensions: [
        'tickets',
        'agents',
        'channels',
        'integrations',
        'firstResponseTime',
    ],
    timeDimensions: ['createdDatetime', 'firstAgentMessageDatetime'],
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
    order: [
        'tickets',
        'createdDatetime',
        'firstAgentMessageDatetime',
        'medianFirstResponseTime',
    ],
})

const direction = z.enum(['asc', 'desc'])

export const medianFirstResponseTime = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', input.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const medianFirstResponseTimePerAgent = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_AGENT,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
            dimensions: ['agents'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', input.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const medianFirstResponseTimePerChannel = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_CHANNEL,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
            dimensions: ['channels'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', input.sortDirection],
                ] as const,
            }
        }

        return query
    })
