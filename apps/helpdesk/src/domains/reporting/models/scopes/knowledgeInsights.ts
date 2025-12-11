import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import { OrderDirection } from 'models/api/types'

const knowledgeStatisticsScope = defineScope({
    scope: MetricScope.KnowledgeInsights,
    measures: ['ticketCount', 'averageSurveyScore'],
    dimensions: [
        'resourceType',
        'resourceSourceId',
        'resourceSourceSetId',
        'top2LevelsValue',
    ],
    timeDimensions: ['createdDatetime', 'closedDatetime'],
    filters: [
        'periodStart',
        'periodEnd',
        'customFieldId',
        'resourceSourceId',
        'resourceSourceSetId',
        'storeId',
    ],
    order: [
        'ticketCount',
        'resourceSourceId',
        'resourceSourceSetId',
        'top2LevelsValue',
    ],
})

export const knowledgeTicketsCount = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_TICKETS)
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
                'top2LevelsValue',
                'resourceType',
                'resourceSourceId',
                'resourceSourceSetId',
            ] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    ['top2LevelsValue', OrderDirection.Asc],
                    ['resourceSourceSetId', OrderDirection.Asc],
                    ['resourceSourceId', OrderDirection.Asc],
                ] as const,
            }
        }

        return query
    })

export const knowledgeIntentsQueryV2Factory = (ctx: Context) =>
    knowledgeIntents.build(ctx)
