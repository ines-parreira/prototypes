import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const oneTouchTicketsScope = defineScope({
    scope: MetricScope.OneTouchTickets,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['createdDatetime', 'closedDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
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
        'score',
    ],
    order: ['ticketId', 'createdDatetime', 'closedDatetime', 'ticketCount'],
})

type OneTouchTicketsContext = Context<typeof oneTouchTicketsScope.config>

export const oneTouchTickets = oneTouchTicketsScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketId', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const oneTouchTicketsQueryV2Factory = (ctx: OneTouchTicketsContext) =>
    oneTouchTickets.build(ctx)

export const oneTouchTicketsTimeseries = oneTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'closedDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
        limit: 10_000,
    }))

export const oneTouchTicketsTimeseriesQueryV2Factory = (
    ctx: OneTouchTicketsContext,
) => oneTouchTicketsTimeseries.build(ctx)

export const oneTouchTicketsPerAgent = oneTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_AGENT,
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
                order: [['ticketCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const oneTouchTicketsPerAgentQueryV2Factory = (
    ctx: OneTouchTicketsContext,
) => oneTouchTicketsPerAgent.build(ctx)

export const oneTouchTicketsPerChannel = oneTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['channel'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketId', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const oneTouchTicketsPerChannelQueryV2Factory = (
    ctx: OneTouchTicketsContext,
) => oneTouchTicketsPerChannel.build(ctx)
