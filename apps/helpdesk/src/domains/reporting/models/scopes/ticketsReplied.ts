import { z } from 'zod'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const ticketsRepliedScope = defineScope({
    scope: MetricScope.TicketsReplied,
    measures: ['ticketCount'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations'],
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

export const openTicketsCount = ticketsRepliedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED)
    .defineQuery(() => ({
        measures: ['ticketCount'] as const,
    }))

const direction = z.enum(['asc', 'desc'])

export const openTicketsTimeseries = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'createdDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
    }))

export const openTicketsCountPerAgent = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_AGENT,
    )
    .defineInput(z.object({ sortDirection: direction }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['agents'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', input.sortDirection]] as const,
            }
        }

        return query
    })

export const openTicketsCountPerChannel = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_CHANNEL,
    )
    .defineInput(z.object({ sortDirection: direction }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['channels'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', input.sortDirection]] as const,
            }
        }

        return query
    })
