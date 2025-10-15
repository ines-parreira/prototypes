import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const oneTouchTicketsScope = defineScope({
    scope: MetricScope.OneTouchTickets,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
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
    order: ['tickets', 'createdDatetime'],
})

export const oneTouchTickets = oneTouchTicketsScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['tickets', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const oneTouchTicketsTimeseries = oneTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'closedDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
    }))

export const oneTouchTicketsPerAgent = oneTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['agentId'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['tickets', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const oneTouchTicketsPerChannel = oneTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['channel'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['tickets', ctx.sortDirection]] as const,
            }
        }

        return query
    })
