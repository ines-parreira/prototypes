import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope } from './scope'
import { createScopeFilters } from './utils'

const scopeConfig = defineScope({
    measures: ['onlineTime'],
    dimensions: ['agents'],
    filters: ['periodStart', 'periodEnd', 'agents'],
    order: ['onlineTime'],
})

type OnlineTimeScope = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const onlineTimeScope = initScope<OnlineTimeScope, Context>().define(
    'online-time',
)

export const onlineTime = onlineTimeScope
    .create(METRIC_NAMES.AGENTXP_ONLINE_TIME)
    .defineQuery(({ ctx }) => ({
        measures: ['onlineTime'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

export const onlineTimePerAgent = onlineTimeScope
    .create(METRIC_NAMES.AGENTXP_ONLINE_TIME_PER_AGENT)
    .defineQuery(({ ctx }) => ({
        measures: ['onlineTime'],
        dimensions: ['agents'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))
