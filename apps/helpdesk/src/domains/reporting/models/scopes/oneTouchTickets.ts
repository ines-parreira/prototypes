import { z } from 'zod'

import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'

import { defineScope } from './scope'

const oneTouchTicketsScope = defineScope({
    scope: MetricScope.OneTouchTickets,
    measures: ['ticketCount'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations'],
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

const direction = z.enum(['asc', 'desc'])

export const oneTouchTickets = oneTouchTicketsScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['ticketCount'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['tickets', input.sortDirection]] as const,
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
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ input }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['agents'] as const,
        }

        if (input.sortDirection) {
            return {
                ...query,
                order: [['tickets', input.sortDirection]] as const,
            }
        }

        return query
    })

export const oneTouchTicketsPerChannel = oneTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_CHANNEL,
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
                order: [['tickets', input.sortDirection]] as const,
            }
        }

        return query
    })
