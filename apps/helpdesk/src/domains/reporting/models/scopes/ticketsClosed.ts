import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { OrderDirection } from 'models/api/types'

const ticketsClosedScope = defineScope({
    scope: MetricScope.TicketsClosed,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['closedDatetime', 'createdDatetime'],
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
        'score',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
    ],
    order: ['ticketId', 'ticketCount', 'closedDatetime', 'createdDatetime'],
})

type TicketsClosedContext = Context<typeof ticketsClosedScope.config>

export const closedTicketsCount = ticketsClosedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS)
    .defineQuery(() => ({
        measures: ['ticketCount'] as const,
    }))

export const closedTicketsCountQueryV2Factory = (ctx: TicketsClosedContext) =>
    closedTicketsCount.build(ctx)

export const closedTicketsTimeseries = ticketsClosedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'closedDatetime' as const,
                granularity: ctx.granularity,
            },
        ],
        order: [['closedDatetime', ctx.sortDirection || OrderDirection.Asc]],
        limit: 10_000,
    }))

export const closedTicketsTimeseriesQueryV2Factory = (
    ctx: TicketsClosedContext,
) => closedTicketsTimeseries.build(ctx)

export const closedTicketsPerAgent = ticketsClosedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_AGENT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['agentId'] as const,
            limit: 10_000,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]] as const,
            }
        }

        return query
    })

export const closedTicketsPerAgentQueryV2Factory = (
    ctx: TicketsClosedContext,
) => closedTicketsPerAgent.build(ctx)

export const closedTicketsPerChannel = ticketsClosedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_CHANNEL,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['channel'] as const,
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

export const closedTicketsPerChannelQueryV2Factory = (
    ctx: TicketsClosedContext,
) => closedTicketsPerChannel.build(ctx)
