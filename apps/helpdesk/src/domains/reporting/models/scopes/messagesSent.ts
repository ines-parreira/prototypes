import { z } from 'zod'

import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    AggregationWindow,
    StatsFiltersWithLogicalOperator,
} from 'domains/reporting/models/stat/types'

import { defineScope, initScope, QueryFor } from './scope'
import { createScopeFilters } from './utils'

const scopeConfig = defineScope({
    measures: ['messagesCount'],
    dimensions: ['tickets', 'agents', 'channels', 'integrations'],
    timeDimensions: ['sentDatetime'],
    order: ['ticketId', 'messagesCount'],
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

const messagesSentScope = initScope<MessagesSentScope, Context>().define(
    'messages-sent',
)

export const sentMessagesCount = messagesSentScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT)
    .defineQuery(({ ctx }) => ({
        measures: ['messagesCount'],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

export const sentMessagesTimeseries = messagesSentScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_TIME_SERIES)
    .defineQuery(({ ctx }) => ({
        measures: ['messagesCount'],
        time_dimensions: [
            { dimension: 'sentDatetime', granularity: ctx.granularity },
        ],
        timezone: ctx.timezone,
        filters: createScopeFilters(ctx.filters, scopeConfig),
    }))

const direction = z.enum(['asc', 'desc'])

export const sentMessagesPerAgent = messagesSentScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_AGENT)
    .defineInput(z.object({ sortDirection: direction }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<MessagesSentScope> = {
            measures: ['messagesCount'],
            dimensions: ['agents'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['messagesCount', input.sortDirection]]
        }

        return query
    })

export const sentMessagesPerChannel = messagesSentScope
    .create(METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_CHANNEL)
    .defineInput(z.object({ sortDirection: direction }))
    .defineQuery(({ ctx, input }) => {
        const query: QueryFor<MessagesSentScope> = {
            measures: ['messagesCount'],
            dimensions: ['channels'],
            timezone: ctx.timezone,
            filters: createScopeFilters(ctx.filters, scopeConfig),
        }

        if (input.sortDirection) {
            query.order = [['messagesCount', input.sortDirection]]
        }

        return query
    })
