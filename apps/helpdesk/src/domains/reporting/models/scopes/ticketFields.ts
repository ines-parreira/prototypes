import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import { withLogicalOperator } from 'domains/reporting/models/queryFactories/utils'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    APIOnlyFilterKey,
    FilterKey,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import { ApiOnlyOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'

const ticketFieldsScope = defineScope({
    scope: MetricScope.TicketFields,
    measures: ['ticketCount'],
    dimensions: ['customFieldValue'],
    timeDimensions: ['updatedDatetime'],
    order: ['ticketCount', 'channel', 'customFieldValue'],
    filters: [
        'agentId',
        'channel',
        'createdDatetime',
        'customFieldId',
        'customFields',
        'integrationId',
        'periodEnd',
        'periodStart',
        'productId',
        'storeId',
        'tags',
        'teamId',
        'customFieldValue',
        'communicationSkills',
        'languageProficiency',
        'resolutionCompleteness',
        'accuracy',
        'efficiency',
        'internalCompliance',
        'brandVoice',
        'score',
    ],
})

export type TicketFieldsMetricContext = Context<typeof ticketFieldsScope.config>

export const ticketFieldsCount = ticketFieldsScope
    .defineMetricName(
        METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_TOTAL_COUNT,
    )
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    [ctx.sortBy ?? 'ticketCount', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const ticketFieldsCountQueryV2Factory = (
    ctx: TicketFieldsMetricContext,
) => ticketFieldsCount.build(ctx)

export const ticketFieldsCountPerFieldValue = ticketFieldsScope
    .defineMetricName(METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['customFieldValue'] as const,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [
                    [ctx.sortBy ?? 'ticketCount', ctx.sortDirection],
                ] as const,
            }
        }

        return query
    })

export const ticketFieldsCountPerFieldValueQueryV2Factory = (
    ctx: TicketFieldsMetricContext,
) => ticketFieldsCountPerFieldValue.build(ctx)

/**
 * Adjusts the provided stats filters to include a filter for the specified
 * custom field ID and optional product ID.
 * @param stats common filters stored in state
 * @param timeReference the time reference to use for ticket fields analysis
 * @param customFieldId the custom field id to filter on
 * @param productId optional product id to filter on
 * @returns extended filters to use in the query factory
 */
export const withCustomFieldIdAndProductFilter = (
    stats: StatsFilters,
    timeReference: TicketTimeReference,
    customFieldId: number,
    productId?: string,
) => {
    const extendedFilters: TicketFieldsMetricContext['filters'] = {
        ...stats,
        ...(timeReference === TicketTimeReference.CreatedAt
            ? {
                  [APIOnlyFilterKey.CreatedDatetime]: stats[FilterKey.Period],
              }
            : {}),
        [APIOnlyFilterKey.CustomFieldId]: withLogicalOperator([customFieldId]),
        ...(productId
            ? { [APIOnlyFilterKey.ProductId]: withLogicalOperator([productId]) }
            : {}),
    }
    return extendedFilters
}

/**
 * Adjusts the provided stats filters to include a filter for the specified
 * custom field ID and set product ID.
 * @param stats common filters stored in state
 * @param timeReference the time reference to use for ticket fields analysis
 * @param customFieldId the custom field id to filter on
 * @returns extended filters to use in the query factory
 */
export const withCustomFieldIdAndProductSetFilter = (
    stats: StatsFilters,
    timeReference: TicketTimeReference,
    customFieldId: number,
) => {
    const extendedFilters: TicketFieldsMetricContext['filters'] = {
        ...stats,
        ...(timeReference === TicketTimeReference.CreatedAt
            ? {
                  [APIOnlyFilterKey.CreatedDatetime]: stats[FilterKey.Period],
              }
            : {}),
        [APIOnlyFilterKey.CustomFieldId]: withLogicalOperator([customFieldId]),
        [APIOnlyFilterKey.ProductId]: withLogicalOperator(
            [],
            ApiOnlyOperatorEnum.SET,
        ),
    }
    return extendedFilters
}

export const ticketFieldsCountPerFieldValueTimeSeries = ticketFieldsScope
    .defineMetricName(METRIC_NAMES.TICKET_INSIGHTS_CUSTOM_FIELDS_TICKET_COUNT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['customFieldValue'] as const,
            time_dimensions: [
                {
                    dimension: 'updatedDatetime' as const,
                    granularity: ctx.granularity,
                },
            ],
            limit: 10000,
        }

        if (ctx.sortDirection) {
            return {
                ...query,
                order: [[ctx.sortBy ?? 'ticketCount', ctx.sortDirection]],
            }
        }

        return query
    })

export const ticketFieldsCountPerFieldValueTimeSeriesQueryV2Factory = (
    ctx: TicketFieldsMetricContext,
) => ticketFieldsCountPerFieldValueTimeSeries.build(ctx)
