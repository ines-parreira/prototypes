import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { getEmailChannelScopeFilters } from 'domains/reporting/models/scopes/channelFilter'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { getGenericQueries } from 'domains/reporting/models/scopes/utils'

const ticketsRepliedScope = defineScope({
    scope: MetricScope.TicketsReplied,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['sentDatetime'],
    order: ['ticketId', 'createdDatetime', 'ticketCount'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'score',
        'integrationId',
        'storeId',
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

type TicketsRepliedContext = Context<typeof ticketsRepliedScope.config>

export const ticketsRepliedCount = ticketsRepliedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED)
    .defineQuery(() => ({
        measures: ['ticketCount'] as const,
    }))

export const ticketsRepliedCountQueryV2Factory = (ctx: TicketsRepliedContext) =>
    ticketsRepliedCount.build(ctx)

export const ticketsRepliedTimeseries = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'sentDatetime',
                granularity: ctx.granularity,
            },
        ],
        limit: 10_000,
    }))

export const ticketsRepliedTimeseriesQueryV2Factory = (
    ctx: TicketsRepliedContext,
) => ticketsRepliedTimeseries.build(ctx)

export const ticketsRepliedCountPerAgent = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['agentId'] as const,
            limit: 10000,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]],
            }
        }

        return query
    })

export const ticketsRepliedCountPerAgentQueryV2Factory = (
    ctx: TicketsRepliedContext,
) => ticketsRepliedCountPerAgent.build(ctx)

export const ticketsRepliedCountPerChannel = ticketsRepliedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['channel'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]],
            }
        }

        return query
    })

export const ticketsRepliedCountPerChannelQueryV2Factory = (
    ctx: TicketsRepliedContext,
) => ticketsRepliedCountPerChannel.build(ctx)

const ticketsRepliedBaseQuery = () => ({
    measures: ['ticketCount'] as const,
})

export const {
    valueQueryFactory: ticketsRepliedValueQueryFactoryV2,
    breakdownQueryFactory: ticketsRepliedBreakdownQueryFactoryV2,
    timeseriesQueryFactory: ticketsRepliedTimeseriesQueryFactoryV2,
} = getGenericQueries(ticketsRepliedScope, ticketsRepliedBaseQuery, {
    valueMetricName: METRIC_NAMES.PERFORMANCE_OVERVIEW_TICKETS_REPLIED_VALUE,
    breakdownMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_TICKETS_REPLIED_BREAKDOWN,
    breakdownDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_TICKETS_REPLIED_BREAKDOWN_PER_CHANNEL,
        agentId:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_TICKETS_REPLIED_BREAKDOWN_PER_AGENT,
    },
    timeseriesMetricName:
        METRIC_NAMES.PERFORMANCE_OVERVIEW_TICKETS_REPLIED_TIMESERIES,
    timeseriesDimensionMetricNames: {
        channel:
            METRIC_NAMES.PERFORMANCE_OVERVIEW_TICKETS_REPLIED_TIMESERIES_PER_CHANNEL,
    },
    timeDimension: 'sentDatetime',
})

const channelsEmailTicketsRepliedBaseQuery = ({
    ctx,
    config,
}: {
    ctx: TicketsRepliedContext
    config: typeof ticketsRepliedScope.config
}) => ({
    measures: ['ticketCount'] as const,
    filters: getEmailChannelScopeFilters(ctx, config),
})

export const {
    valueQueryFactory: channelsEmailTicketsRepliedValueQueryFactoryV2,
    breakdownQueryFactory: channelsEmailTicketsRepliedBreakdownQueryFactoryV2,
    timeseriesQueryFactory: channelsEmailTicketsRepliedTimeseriesQueryFactoryV2,
} = getGenericQueries(
    ticketsRepliedScope,
    channelsEmailTicketsRepliedBaseQuery,
    {
        valueMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_TICKETS_REPLIED_VALUE,
        breakdownMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_TICKETS_REPLIED_BREAKDOWN,
        breakdownDimensionMetricNames: {
            channel:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_TICKETS_REPLIED_BREAKDOWN_PER_CHANNEL,
            agentId:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_TICKETS_REPLIED_BREAKDOWN_PER_AGENT,
        },
        timeseriesMetricName:
            METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_TICKETS_REPLIED_TIMESERIES,
        timeseriesDimensionMetricNames: {
            channel:
                METRIC_NAMES.PERFORMANCE_CHANNELS_EMAIL_TICKETS_REPLIED_TIMESERIES_PER_CHANNEL,
        },
        timeDimension: 'sentDatetime',
    },
)
