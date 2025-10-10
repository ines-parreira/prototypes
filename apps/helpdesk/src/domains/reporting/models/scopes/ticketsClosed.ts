import { z } from 'zod'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { OrderDirection } from 'models/api/types'

import { defineScope } from './scope'

const ticketsClosedScope = defineScope({
    scope: MetricScope.TicketsClosed,
    measures: ['ticketCount'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations'],
    timeDimensions: ['closedDatetime', 'createdDatetime'],
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
        'score',
    ],
    order: ['ticketId', 'ticketCount', 'closedDatetime', 'createdDatetime'],
})

export const closedTicketsCount = ticketsClosedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS)
    .defineQuery(() => ({
        measures: ['ticketCount'] as const,
    }))

export const closedTicketsTimeseries = ticketsClosedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'closedDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
        order: [['closedDatetime', OrderDirection.Asc]] as const,
    }))

const direction = z.enum(['asc', 'desc'])

export const closedTicketsPerAgent = ticketsClosedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_AGENT)
    .defineInput(z.object({ sortDirection: direction.optional() }))
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

export const closedTicketsPerChannel = ticketsClosedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_CHANNEL,
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
