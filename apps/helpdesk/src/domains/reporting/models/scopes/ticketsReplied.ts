import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const ticketsRepliedScope = defineScope({
    scope: MetricScope.TicketsReplied,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime', 'ticketCount'],
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

export const ticketsRepliedCount = ticketsRepliedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED)
    .defineQuery(() => ({
        measures: ['ticketCount'] as const,
    }))

export const ticketsRepliedTimeseries = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'createdDatetime',
                granularity: ctx.granularity,
            },
        ],
    }))

export const ticketsRepliedCountPerAgent = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['agentId'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]],
            }
        }

        return query
    })

export const ticketsRepliedCountPerChannel = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['channel'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]],
            }
        }

        return query
    })
