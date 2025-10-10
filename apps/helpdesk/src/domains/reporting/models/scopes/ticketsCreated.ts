import { z } from 'zod'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { OrderDirection } from 'models/api/types'

import { defineScope } from './scope'

const ticketsCreatedScope = defineScope({
    scope: MetricScope.TicketsCreated,
    measures: ['ticketCount'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations'],
    timeDimensions: ['createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'integrations',
        'tags',
        'customFields',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'score',
    ],
    order: ['ticketId', 'createdDatetime', 'ticketCount'],
})

const direction = z.enum(['asc', 'desc'])

export const createdTicketsCount = ticketsCreatedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['ticketCount'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', input.sortDirection]] as const,
            }
        }

        return query
    })

export const createdTicketsPerChannel = ticketsCreatedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_PER_CHANNEL,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
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

export const createdTicketsTimeseries = ticketsCreatedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'createdDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
        order: [['createdDatetime', OrderDirection.Asc]] as const,
    }))
