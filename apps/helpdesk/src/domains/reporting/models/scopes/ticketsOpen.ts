import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope } from './scope'
import { createScopeFilters } from './utils'

const scopeConfig = defineScope({
    measures: ['ticketCount'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations'],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime'],
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

type TicketsOpenScope = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const ticketsOpenScope = initScope<TicketsOpenScope, Context>().define(
    'tickets-open',
)

export const openTicketsCount = ticketsOpenScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_OPEN_TICKETS)
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))
