import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { OrderDirection } from 'models/api/types'

const knowledgeStatisticsScope = defineScope({
    scope: MetricScope.KnowledgeInsights,
    measures: ['ticketCount', 'averageSurveyScore'],
    dimensions: [
        'ticketId',
        'createdDatetime',
        'resourceType',
        'resourceSourceId',
        'resourceSourceSetId',
        'customFieldTop2LevelsValue',
    ],
    timeDimensions: ['createdDatetime', 'closedDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'customFields',
        'customFieldId',
        'resourceSourceId',
        'resourceSourceSetId',
        'storeId',
    ],
    order: [
        'createdDatetime',
        'ticketCount',
        'resourceSourceId',
        'resourceSourceSetId',
        'customFieldTop2LevelsValue',
    ],
})

export const knowledgeTicketsResourceCount = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_TICKETS_RESOURCE_TICKET_COUNT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: [
                'resourceType',
                'resourceSourceId',
                'resourceSourceSetId',
            ] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['resourceSourceSetId', OrderDirection.Asc],
                    ['resourceSourceId', OrderDirection.Asc],
                ] as const,
            }
        }

        return query
    })

export const knowledgeTicketsResourceCountQueryV2Factory = (ctx: Context) =>
    knowledgeTicketsResourceCount.build(ctx)

export const knowledgeTicketsCount = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_TICKETS_TICKET_COUNT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: [
                'resourceType',
                'resourceSourceId',
                'resourceSourceSetId',
            ] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['resourceSourceSetId', OrderDirection.Asc],
                    ['resourceSourceId', OrderDirection.Asc],
                ] as const,
            }
        }

        return query
    })

export const knowledgeTicketsCountQueryV2Factory = (ctx: Context) =>
    knowledgeTicketsCount.build(ctx)

export const knowledgeHandoverTicketsCount = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: [
                'resourceType',
                'resourceSourceId',
                'resourceSourceSetId',
            ] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['resourceSourceSetId', OrderDirection.Asc],
                    ['resourceSourceId', OrderDirection.Asc],
                ] as const,
            }
        }

        return query
    })

export const knowledgeHandoverTicketsCountQueryV2Factory = (ctx: Context) =>
    knowledgeHandoverTicketsCount.build(ctx)

export const knowledgeCSAT = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_CSAT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['averageSurveyScore'] as const,
            dimensions: [
                'resourceType',
                'resourceSourceId',
                'resourceSourceSetId',
            ] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['resourceSourceSetId', OrderDirection.Asc],
                    ['resourceSourceId', OrderDirection.Asc],
                ] as const,
            }
        }

        return query
    })

export const knowledgeCSATQueryV2Factory = (ctx: Context) =>
    knowledgeCSAT.build(ctx)

export const knowledgeIntents = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_INTENTS)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: [
                'customFieldTop2LevelsValue',
                'resourceType',
                'resourceSourceId',
                'resourceSourceSetId',
            ] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['customFieldTop2LevelsValue', OrderDirection.Asc],
                    ['resourceSourceSetId', OrderDirection.Asc],
                    ['resourceSourceId', OrderDirection.Asc],
                ] as const,
            }
        }

        return query
    })

export const knowledgeIntentsQueryV2Factory = (ctx: Context) =>
    knowledgeIntents.build(ctx)
