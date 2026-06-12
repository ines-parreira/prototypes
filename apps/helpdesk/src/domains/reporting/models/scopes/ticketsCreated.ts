import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import {
    getEmailChannelScopeFilters,
    getVoiceChannelScopeFilters,
} from 'domains/reporting/models/scopes/channelFilter'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { getGenericQueries } from 'domains/reporting/models/scopes/utils'
import { OrderDirection } from 'models/api/types'

const ticketsCreatedScope = defineScope({
    scope: MetricScope.TicketsCreated,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'integrationId',
        'storeId',
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

type TicketsCreatedContext = Context<typeof ticketsCreatedScope.config>

export const createdTicketsCount = ticketsCreatedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]],
            }
        }

        return query
    })

export const createdTicketsCountQueryV2Factory = (ctx: TicketsCreatedContext) =>
    createdTicketsCount.build(ctx)

export const createdTicketsPerChannel = ticketsCreatedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['channel'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const createdTicketsPerChannelQueryV2Factory = (
    ctx: TicketsCreatedContext,
) => createdTicketsPerChannel.build(ctx)

export const createdTicketsTimeseries = ticketsCreatedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'createdDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
        order: [['createdDatetime', OrderDirection.Asc]] as const,
        limit: 10_000,
    }))

export const createdTicketsTimeseriesQueryV2Factory = (
    ctx: TicketsCreatedContext,
) => createdTicketsTimeseries.build(ctx)

const createdTicketsBaseQuery = () => ({
    measures: ['ticketCount'] as const,
})

export const {
    valueQueryFactory: createdTicketsValueQueryFactoryV2,
    breakdownQueryFactory: createdTicketsBreakdownQueryFactoryV2,
    timeseriesQueryFactory: createdTicketsTimeseriesQueryFactoryV2,
} = getGenericQueries(ticketsCreatedScope, createdTicketsBaseQuery, {
    valueMetricName: METRIC_NAMES.PERFORMANCE_OVERVIEW_CREATED_TICKETS_VALUE,
    breakdownMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_CREATED_TICKETS_BREAKDOWN,
    breakdownDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_CREATED_TICKETS_BREAKDOWN_PER_CHANNEL,
        agentId:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_CREATED_TICKETS_BREAKDOWN_PER_AGENT,
    },
    timeseriesMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_CREATED_TICKETS_TIMESERIES,
    timeseriesDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_CREATED_TICKETS_TIMESERIES_PER_CHANNEL,
    },
    timeDimension: 'createdDatetime',
})

const channelsEmailCreatedTicketsBaseQuery = ({
    ctx,
    config,
}: {
    ctx: TicketsCreatedContext
    config: typeof ticketsCreatedScope.config
}) => ({
    measures: ['ticketCount'] as const,
    filters: getEmailChannelScopeFilters(ctx, config),
})

export const {
    valueQueryFactory: channelsEmailCreatedTicketsValueQueryFactoryV2,
    breakdownQueryFactory: channelsEmailCreatedTicketsBreakdownQueryFactoryV2,
    timeseriesQueryFactory: channelsEmailCreatedTicketsTimeseriesQueryFactoryV2,
} = getGenericQueries(
    ticketsCreatedScope,
    channelsEmailCreatedTicketsBaseQuery,
    {
        valueMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_CREATED_TICKETS_VALUE,
        breakdownMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_CREATED_TICKETS_BREAKDOWN,
        breakdownDimensionMetricNames: {
            channel:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_CREATED_TICKETS_BREAKDOWN_PER_CHANNEL,
            agentId:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_CREATED_TICKETS_BREAKDOWN_PER_AGENT,
        },
        timeseriesMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_CREATED_TICKETS_TIMESERIES,
        timeseriesDimensionMetricNames: {
            channel:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_CREATED_TICKETS_TIMESERIES_PER_CHANNEL,
        },
        timeDimension: 'createdDatetime',
    },
)

const channelsVoiceTicketsCreatedBaseQuery = ({
    ctx,
    config,
}: {
    ctx: TicketsCreatedContext
    config: typeof ticketsCreatedScope.config
}) => ({
    measures: ['ticketCount'] as const,
    filters: getVoiceChannelScopeFilters(ctx, config),
})

export const {
    valueQueryFactory: channelsVoiceTicketsCreatedValueQueryFactoryV2,
    breakdownQueryFactory: channelsVoiceTicketsCreatedBreakdownQueryFactoryV2,
    timeseriesQueryFactory: channelsVoiceTicketsCreatedTimeseriesQueryFactoryV2,
} = getGenericQueries(
    ticketsCreatedScope,
    channelsVoiceTicketsCreatedBaseQuery,
    {
        valueMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_VOICE_TICKETS_CREATED_VALUE,
        breakdownMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_VOICE_TICKETS_CREATED_BREAKDOWN,
        breakdownDimensionMetricNames: {
            agentId:
                METRIC_NAMES.PERFORMANCE_CHANNELS_VOICE_TICKETS_CREATED_BREAKDOWN_PER_AGENT,
        },
        timeseriesMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_VOICE_TICKETS_CREATED_TIMESERIES,
        timeDimension: 'createdDatetime',
    },
)
