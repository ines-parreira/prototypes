import { METRIC_NAMES, MetricScope } from 'domains/reporting/hooks/metricNames'
import type { Context } from 'domains/reporting/models/scopes/scope'
import { defineScope } from 'domains/reporting/models/scopes/scope'
import {
    APIOnlyFilterKey,
    FilterKey,
    TicketTimeReference,
} from 'domains/reporting/models/stat/types'
import type {
    ApiStatsFilters,
    StatsFilters,
} from 'domains/reporting/models/stat/types'

const tagsScope = defineScope({
    scope: MetricScope.Tags,
    measures: ['ticketCount'],
    dimensions: [
        'ticketId',
        'agentId',
        'channel',
        'integrationId',
        'storeId',
        'tagId',
    ],
    timeDimensions: ['timestamp'],
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
        'createdDatetime',
    ],
    order: ['ticketId', 'ticketCount', 'timestamp'],
})

type TagsContext = Context<typeof tagsScope.config>

export const taggedTicketCountTimeseries = tagsScope
    .defineMetricName(
        METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        time_dimensions: [
            {
                dimension: 'timestamp' as const,
                granularity: ctx.granularity,
            },
        ],
        limit: 10_000,
    }))

export const taggedTicketCountTimeseriesQueryV2Factory = (ctx: TagsContext) =>
    taggedTicketCountTimeseries.build(ctx)

export const tagsTicketCount = tagsScope
    .defineMetricName(METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT)
    .defineQuery(({ ctx }) => {
        const query = {
            measures: ['ticketCount'] as const,
            dimensions: ['tagId'] as const,
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

export const tagsTicketCountQueryV2Factory = (ctx: TagsContext) =>
    tagsTicketCount.build(ctx)

export const tagsTicketCountTimeseries = tagsScope
    .defineMetricName(
        METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT_TIME_SERIES,
    )
    .defineQuery(({ ctx }) => ({
        measures: ['ticketCount'] as const,
        dimensions: ['tagId'] as const,
        time_dimensions: [
            {
                dimension: 'timestamp' as const,
                granularity: ctx.granularity,
            },
        ],
        limit: 10_000,
    }))

export const tagsTicketCountTimeseriesQueryV2Factory = (ctx: TagsContext) =>
    tagsTicketCountTimeseries.build(ctx)

/**
 * Add a filter on "createdDatetime" if the time reference is "createdAt".
 * Equivalent of the "OnCreatedDatetime" V1 query factories.
 *
 * @param filters Common filters from the context.
 * @param timeReference The time reference to use for the analysis.
 * @returns Extended filters to use in the query factory.
 */
export const withCreatedDatetimeFilter = (
    filters: StatsFilters,
    timeReference: TicketTimeReference,
) => {
    const extendedFilters: ApiStatsFilters = { ...filters }
    if (timeReference === TicketTimeReference.CreatedAt) {
        extendedFilters[APIOnlyFilterKey.CreatedDatetime] =
            filters[FilterKey.Period]
    }
    return extendedFilters
}
