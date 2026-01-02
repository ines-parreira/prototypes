import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
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
