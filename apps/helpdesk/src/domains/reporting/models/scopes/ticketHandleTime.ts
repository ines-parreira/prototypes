import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope } from './scope'
import { createScopeFilters } from './utils'

const scopeConfig = defineScope({
    measures: ['averageHandleTime', 'handleTime'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations', 'handleTime'],
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
    order: ['tickets', 'handleTime'],
})

type TicketHandleTimeScopeMeta = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const ticketHandleTimeScope = initScope<
    TicketHandleTimeScopeMeta,
    Context
>().define('ticket-handle-time')

export const ticketHandleTime = ticketHandleTimeScope
    .create(METRIC_NAMES.AGENTXP_TICKET_HANDLE_TIME)
    .defineQuery(({ ctx }) => ({
        measures: ['handleTime'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

export const ticketAverageHandleTime = ticketHandleTimeScope
    .create(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME)
    .defineQuery(({ ctx }) => ({
        measures: ['averageHandleTime'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

export const ticketAverageHandleTimePerAgent = ticketHandleTimeScope
    .create(METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT)
    .defineQuery(({ ctx }) => ({
        measures: ['averageHandleTime'],
        dimensions: ['agents'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

export const ticketAverageHandleTimePerChannel = ticketHandleTimeScope
    .create(
        METRIC_NAMES.AGENTXP_TICKET_AVERAGE_HANDLE_TIME_PER_AGENT_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['averageHandleTime'],
        dimensions: ['channels'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))
