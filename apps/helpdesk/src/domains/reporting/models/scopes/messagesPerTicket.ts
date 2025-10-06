import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope } from './scope'
import { createScopeFilters } from './utils'

const scopeConfig = defineScope({
    measures: ['messagesAverage'],
    dimensions: [
        'tickets',
        'agents',
        'channels',
        'integrations',
        'messagesCount',
    ],
    timeDimensions: ['createdDatetime'],
    order: ['ticketId', 'createdDatetime', 'messagesCount'],
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

type MessagesSentScope = typeof scopeConfig

type Context = {
    timezone: string
    filters: StatsFiltersWithLogicalOperator
    granularity: AggregationWindow
}

const messagesPerTicketScope = initScope<MessagesSentScope, Context>().define(
    'messages-per-ticket',
)

export const messagesPerTicketCount = messagesPerTicketScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET)
    .defineQuery(({ ctx }) => ({
        measures: ['messagesAverage'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))
