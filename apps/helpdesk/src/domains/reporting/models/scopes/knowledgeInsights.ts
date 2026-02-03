import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import {
    type ApiStatsFilters,
    FilterKey,
} from 'domains/reporting/models/stat/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import { DRILLDOWN_QUERY_LIMIT } from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

import type { StringStandardFilter } from './types'
import { createScopeFilters } from './utils'

const knowledgeStatisticsScope = defineScope({
    scope: MetricScope.KnowledgeInsights,
    measures: ['ticketCount', 'averageSurveyScore'],
    dimensions: [
        'ticketId',
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
        'ticketCount',
        'resourceSourceId',
        'resourceSourceSetId',
        'customFieldTop2LevelsValue',
    ],
})

export const knowledgeTicketsCount = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_TICKETS)
    .defineQuery(({ ctx, config }) => {
        const query = {
            filters: [
                ...createScopeFilters(ctx.filters, config),
                ...getCustomFilterIdFilters(ctx.filters),
            ] as any,
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
    .defineQuery(({ ctx, config }) => {
        const query = {
            filters: [
                ...createScopeFilters(ctx.filters, config),
                ...getCustomFilterIdFilters(ctx.filters),
            ] as any,
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
    .defineQuery(({ ctx, config }) => {
        const query = {
            filters: [
                ...createScopeFilters(ctx.filters, config),
                ...getCustomFilterIdFilters(ctx.filters),
            ] as any,
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
    .defineQuery(({ ctx, config }) => {
        const query = {
            filters: [
                ...createScopeFilters(ctx.filters, config),
                ...getCustomFilterIdFilters(ctx.filters),
            ] as any,
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

// Drilldown query factories

export const knowledgeTicketsDrillDown = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_TICKETS)
    .defineQuery(({ ctx, config }) => ({
        filters: [
            ...createScopeFilters(ctx.filters, config),
            ...getCustomFilterIdFilters(ctx.filters),
        ] as any,
        measures: [] as const,
        dimensions: [
            'ticketId',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ] as const,
        limit: DRILLDOWN_QUERY_LIMIT,
    }))

export const knowledgeTicketsDrillDownQueryV2Factory = (ctx: Context) =>
    knowledgeTicketsDrillDown.build(ctx)

export const knowledgeHandoverTicketsDrillDown = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_HANDOVER_TICKETS)
    .defineQuery(({ ctx, config }) => ({
        filters: [
            ...createScopeFilters(ctx.filters, config),
            ...getCustomFilterIdFilters(ctx.filters),
        ] as any,
        measures: [] as const,
        dimensions: [
            'ticketId',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ] as const,
        limit: DRILLDOWN_QUERY_LIMIT,
    }))

export const knowledgeHandoverTicketsDrillDownQueryV2Factory = (ctx: Context) =>
    knowledgeHandoverTicketsDrillDown.build(ctx)

export const knowledgeCSATDrillDown = knowledgeStatisticsScope
    .defineMetricName(METRIC_NAMES.KNOWLEDGE_CSAT)
    .defineQuery(({ ctx, config }) => ({
        filters: [
            ...createScopeFilters(ctx.filters, config),
            ...getCustomFilterIdFilters(ctx.filters),
        ] as any,
        measures: ['averageSurveyScore'] as const,
        dimensions: [
            'ticketId',
            'resourceType',
            'resourceSourceId',
            'resourceSourceSetId',
        ] as const,
        limit: DRILLDOWN_QUERY_LIMIT,
    }))

export const knowledgeCSATDrillDownQueryV2Factory = (ctx: Context) =>
    knowledgeCSATDrillDown.build(ctx)

export const getCustomFilterIdFilters = (
    filters: ApiStatsFilters,
): StringStandardFilter[] => {
    // We have custom logic that adds a customFieldId filter for each value in the customFields filter
    const additionalFilters: StringStandardFilter[] = []

    if (
        filters[FilterKey.CustomFields] &&
        filters[FilterKey.CustomFields].length > 0
    ) {
        filters[FilterKey.CustomFields].forEach((cf) => {
            additionalFilters.push({
                member: 'customFieldId' as const,
                operator: LogicalOperatorEnum.ONE_OF,
                values: [cf.customFieldId.toString()],
            })
        })
    }
    return additionalFilters
}
