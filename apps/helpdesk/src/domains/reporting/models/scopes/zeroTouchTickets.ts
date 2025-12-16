import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'

const zeroTouchTicketsScope = defineScope({
    scope: MetricScope.ZeroTouchTickets,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId', 'storeId'],
    timeDimensions: ['createdDatetime', 'closedDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'score',
        'integrationId',
        'tags',
        'customFields',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'storeId',
    ],
    order: ['ticketId', 'createdDatetime', 'closedDatetime', 'ticketCount'],
})

type ZeroTouchTicketsContext = Context<typeof zeroTouchTicketsScope.config>

export const zeroTouchTickets = zeroTouchTicketsScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS)
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

export const zeroTouchTicketsQueryV2Factory = (ctx: ZeroTouchTicketsContext) =>
    zeroTouchTickets.build(ctx)

export const zeroTouchTicketsPerAgent = zeroTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_PER_AGENT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['agentId'] as const,
        }
        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]] as const,
            }
        }
        return query
    })

export const zeroTouchTicketsPerAgentQueryV2Factory = (
    ctx: ZeroTouchTicketsContext,
) => zeroTouchTicketsPerAgent.build(ctx)

export const zeroTouchTicketsPerChannel = zeroTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_PER_CHANNEL,
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

export const zeroTouchTicketsPerChannelQueryV2Factory = (
    ctx: ZeroTouchTicketsContext,
) => zeroTouchTicketsPerChannel.build(ctx)

export const zeroTouchTicketsTimeSeries = zeroTouchTicketsScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'closedDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
    }))

export const zeroTouchTicketsTimeSeriesQueryV2Factory = (
    ctx: ZeroTouchTicketsContext,
) => zeroTouchTicketsTimeSeries.build(ctx)
