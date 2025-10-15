import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const firstResponseTimeScope = defineScope({
    scope: MetricScope.FirstResponseTime,
    measures: ['medianFirstResponseTime', 'medianFirstResponseTimeInSeconds'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
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

export const medianFirstResponseTime = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const medianFirstResponseTimePerAgent = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
            dimensions: ['agentId'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const medianFirstResponseTimePerChannel = firstResponseTimeScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['medianFirstResponseTime'] as const,
            dimensions: ['channel'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['medianFirstResponseTime', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })
