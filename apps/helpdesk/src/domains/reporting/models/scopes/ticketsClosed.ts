import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { Context, defineScope } from 'domains/reporting/models/scopes/scope'
import { OrderDirection } from 'models/api/types'

const ticketsClosedScope = defineScope({
    scope: MetricScope.TicketsClosed,
    measures: ['ticketCount'],
    dimensions: ['ticketId', 'agentId', 'channel', 'integrationId'],
    timeDimensions: ['closedDatetime', 'createdDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'agents',
        'channels',
        'integrations',
        'stores',
        'tags',
        'customFields',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'score',
    ],
    order: ['ticketId', 'ticketCount', 'closedDatetime', 'createdDatetime'],
})

export const closedTicketsCount = ticketsClosedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS)
    .defineQuery(() => ({
        measures: ['ticketCount'] as const,
    }))

export const closedTicketsCountQueryV2Factory = (ctx: Context) =>
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
        order: [['closedDatetime', OrderDirection.Asc]] as const,
    }))

export const closedTicketsTimeseriesQueryV2Factory = (ctx: Context) =>
    closedTicketsTimeseries.build(ctx)

export const closedTicketsPerAgent = ticketsClosedScope
    .defineMetricName(METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_AGENT)
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

export const closedTicketsPerAgentQueryV2Factory = (ctx: Context) =>
    closedTicketsPerAgent.build(ctx)

export const closedTicketsPerChannel = ticketsClosedScope
    .defineMetricName(
        METRIC_NAMES.SUPPORT_PERFORMANCE_CLOSED_TICKETS_PER_CHANNEL,
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

export const closedTicketsPerChannelQueryV2Factory = (ctx: Context) =>
    closedTicketsPerChannel.build(ctx)
