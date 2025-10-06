import { z } from 'zod'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope, QueryFor } from './scope'
import { createScopeFilters } from './utils'

const scopeConfig = defineScope({
    measures: ['medianFirstResponseTime', 'medianFirstResponseTimeInSeconds'],
    dimensions: [
        'tickets',
        'agents',
        'channels',
        'integrations',
        'firstResponseTime',
    ],
    timeDimensions: ['createdDatetime', 'firstAgentMessageDatetime'],
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
    order: [
        'tickets',
        'createdDatetime',
        'firstAgentMessageDatetime',
        'medianFirstResponseTime',
    ],
})

type FirstResponseTimeScope = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const firstResponseTimeScope = initScope<
    FirstResponseTimeScope,
    Context
>().define('first-response-time')

const direction = z.enum(['asc', 'desc'])

export const medianFirstResponseTime = firstResponseTimeScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME)
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<FirstResponseTimeScope> = {
            measures: ['medianFirstResponseTime'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['medianFirstResponseTime', input.sortDirection]]
        }

        return query
    })

export const medianFirstResponseTimePerAgent = firstResponseTimeScope
    .create(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_AGENT,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<FirstResponseTimeScope> = {
            measures: ['medianFirstResponseTime'],
            dimensions: ['agents'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['medianFirstResponseTime', input.sortDirection]]
        }

        return query
    })

export const medianFirstResponseTimePerChannel = firstResponseTimeScope
    .create(
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_CHANNEL,
    )
    .defineInput(z.object({ sortDirection: direction.optional() }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<FirstResponseTimeScope> = {
            measures: ['medianFirstResponseTime'],
            dimensions: ['channels'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['medianFirstResponseTime', input.sortDirection]]
        }

        return query
    })
