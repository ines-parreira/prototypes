import { z } from 'zod'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope, QueryFor } from './scope'
import { createScopeFilters } from './utils'

const scopeConfig = defineScope({
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

type TicketsRepliedScope = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const ticketsRepliedScope = initScope<TicketsRepliedScope, Context>().define(
    'tickets-replied',
)

export const openTicketsCount = ticketsRepliedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED)
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

const direction = z.enum(['asc', 'desc'])

export const openTicketsTimeseries = ticketsRepliedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'],
        time_dimensions: [
            { dimension: 'createdDatetime', granularity: ctx.granularity },
        ],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

export const openTicketsCountPerAgent = ticketsRepliedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_AGENT)
    .defineInput(z.object({ sortDirection: direction }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<TicketsRepliedScope> = {
            measures: ['ticketCount'],
            dimensions: ['agents'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['ticketCount', input.sortDirection]]
        }

        return query
    })

export const openTicketsCountPerChannel = ticketsRepliedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_CHANNEL)
    .defineInput(z.object({ sortDirection: direction }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<TicketsRepliedScope> = {
            measures: ['ticketCount'],
            dimensions: ['channels'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['ticketCount', input.sortDirection]]
        }

        return query
    })
