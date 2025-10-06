import { z } from 'zod'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'
import { OrderDirection } from 'models/api/types'

import { defineScope, initScope, QueryFor } from './scope'
import { createScopeFilters } from './utils'

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const scopeConfig = defineScope({
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

type TicketsCreatedScope = typeof scopeConfig

const ticketsCreatedScope = initScope<TicketsCreatedScope, Context>().define(
    'tickets-created',
)

const direction = z.enum(['asc', 'desc'])

export const createdTicketsCount = ticketsCreatedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<TicketsCreatedScope> = {
            measures: ['ticketCount'],
            filters: createScopeFilters(ctx.filters, scopeConfig),
            timezone: ctx.timezone,
        }

        if (input.sortDirection) {
            query.order = [['ticketCount', input.sortDirection]]
        }

        return query
    })

export const createdTicketsPerChannel = ticketsCreatedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_PER_CHANNEL)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<TicketsCreatedScope> = {
            measures: ['ticketCount'],
            dimensions: ['channels'],
            filters: createScopeFilters(ctx.filters, scopeConfig),
            timezone: ctx.timezone,
        }

        if (input.sortDirection) {
            query.order = [['ticketCount', input.sortDirection]]
        }

        return query
    })

export const createdTicketsTimeseries = ticketsCreatedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'],
        time_dimensions: [
            { dimension: 'createdDatetime', granularity: ctx.granularity },
        ],
        filters: createScopeFilters(ctx.filters, scopeConfig),
        timezone: ctx.timezone,
        order: [['createdDatetime', OrderDirection.Asc]],
    }))
