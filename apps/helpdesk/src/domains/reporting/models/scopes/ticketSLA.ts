import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { TicketSLAStatus } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { createScopeFilters } from 'domains/reporting/models/scopes/utils'

const ticketSLAScope = defineScope({
    scope: MetricScope.TicketServiceLevelAgreement,
    measures: ['ticketCount'],
    dimensions: ['status'],
    timeDimensions: ['anchorDatetime'],
    order: ['ticketCount'],
    filters: [
        'periodStart',
        'periodEnd',
        'agentId',
        'teamId',
        'channel',
        'integrationId',
        'tags',
        'customFields',
        'storeId',
        'status',
        'slaPolicyUuid',
        'score',
        'resolutionCompleteness',
        'communicationSkills',
        'languageProficiency',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
    ],
})

type TicketSLAContext = Context<typeof ticketSLAScope.config>

export const satisfiedOrBreachedTickets = ticketSLAScope
    .defineMetricName(METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_TICKETS)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['status'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [['ticketCount', ctx.sortDirection]],
            }
        }

        return query
    })

export const satisfiedOrBreachedTicketsQueryV2Factory = (
    ctx: TicketSLAContext,
) => satisfiedOrBreachedTickets.build(ctx)

export const satisfiedOrBreachedTicketsTimeseries = ticketSLAScope
    .defineMetricName(
        METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_TICKETS_TIME_SERIES,
    )
    .defineQuery(({ ctx, config }) => ({
        measures: ['ticketCount'] as const,
        dimensions: ['status'] as const,
        time_dimensions: [
            {
                dimension: 'anchorDatetime',
                granularity: ctx.granularity,
            },
        ],
        filters: [
            ...createScopeFilters(ctx.filters, config),
            {
                member: 'status',
                operator: 'one-of',
                values: [TicketSLAStatus.Satisfied, TicketSLAStatus.Breached],
            },
        ] as any,
        limit: 10_000,
    }))

export const satisfiedOrBreachedTicketsTimeseriesQueryV2Factory = (
    ctx: TicketSLAContext,
) => satisfiedOrBreachedTicketsTimeseries.build(ctx)
