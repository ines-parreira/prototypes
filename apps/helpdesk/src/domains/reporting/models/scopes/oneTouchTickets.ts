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

type OneTouchTicketsScope = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const oneTouchTicketsScope = initScope<OneTouchTicketsScope, Context>().define(
    'one-touch-tickets',
)

const direction = z.enum(['asc', 'desc'])

export const oneTouchTickets = oneTouchTicketsScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<OneTouchTicketsScope> = {
            measures: ['ticketCount'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['tickets', input.sortDirection]]
        }

        return query
    })

export const oneTouchTicketsTimeseries = oneTouchTicketsScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'],
        time_dimensions: [
            { dimension: 'closedDatetime', granularity: ctx.granularity },
        ],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

export const oneTouchTicketsPerAgent = oneTouchTicketsScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_AGENT)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<OneTouchTicketsScope> = {
            measures: ['ticketCount'],
            dimensions: ['agents'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['tickets', input.sortDirection]]
        }

        return query
    })

export const oneTouchTicketsPerChannel = oneTouchTicketsScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_CHANNEL)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<OneTouchTicketsScope> = {
            measures: ['ticketCount'],
            dimensions: ['channels'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['tickets', input.sortDirection]]
        }

        return query
    })
