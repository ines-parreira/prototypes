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

type TicketsClosedScope = typeof scopeConfig

const ticketsClosedScope = initScope<TicketsClosedScope, Context>().define(
    'tickets-closed',
)

export const closedTicketsCount = ticketsClosedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS)
    .defineQuery(({ ctx }) => {
        const filters = createScopeFilters(ctx.filters, scopeConfig)

        return {
            measures: ['ticketCount'],
            timezone: ctx.timezone,
            filters,
            // TODO: optional order <- Do we need it? This should only be a single number?
        }
    })

export const closedTicketsTimeseries = ticketsClosedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'],
        time_dimensions: [
            { dimension: 'closedDatetime', granularity: ctx.granularity },
        ],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
        order: [['closedDatetime', OrderDirection.Asc]],
    }))

const direction = z.enum(['asc', 'desc'])

export const closedTicketsPerAgent = ticketsClosedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_AGENT)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<TicketsClosedScope> = {
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

export const closedTicketsPerChannel = ticketsClosedScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_CHANNEL)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<TicketsClosedScope> = {
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
