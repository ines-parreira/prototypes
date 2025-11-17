import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import type { TicketTagsEnrichedCube } from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import {
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'domains/reporting/models/cubes/TicketTagsEnrichedCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import { TicketTimeReference } from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const totalTaggedTicketCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketTagsEnrichedCube> => ({
    measures: [TicketTagsEnrichedMeasure.TicketCount],
    dimensions: [],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    ...(sorting
        ? {
              order: [[TicketTagsEnrichedMeasure.TicketCount, sorting]],
          }
        : {}),
    metricName: METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT,
})

export const tagsTicketCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketTagsEnrichedCube> => ({
    metricName: METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT,
    measures: [TicketTagsEnrichedMeasure.TicketCount],
    dimensions: [TicketTagsEnrichedDimension.TagId],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    ...(sorting
        ? {
              order: [[TicketTagsEnrichedMeasure.TicketCount, sorting]],
          }
        : {}),
})

const createdTicketFilter = (filters: StatsFilters) => ({
    member: TicketMember.CreatedDatetime,
    operator: ReportingFilterOperator.InDateRange,
    values: [
        formatReportingQueryDate(filters.period.start_datetime),
        formatReportingQueryDate(filters.period.end_datetime),
    ],
})

export const tagsTicketCountTimeSeriesFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
): TimeSeriesQuery<TicketCubeWithJoins> => ({
    ...tagsTicketCountQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT_TIME_SERIES,
    timeDimensions: [
        {
            dimension: TicketTagsEnrichedDimension.Timestamp,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const tagsTicketCountOnCreatedDatetimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketTagsEnrichedCube> => {
    const { filters: baseQueryFilters, ...baseQuery } =
        tagsTicketCountQueryFactory(filters, timezone, sorting)

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT_ON_CREATED_DATETIME,
        filters: [...baseQueryFilters, createdTicketFilter(filters)],
    }
}

export const tagsTicketCountOnCreatedDatetimeTimeSeriesFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
): TimeSeriesQuery<TicketCubeWithJoins> => ({
    ...tagsTicketCountOnCreatedDatetimeQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT_ON_CREATED_DATETIME_TIME_SERIES,
    timeDimensions: [
        {
            dimension: TicketTagsEnrichedDimension.Timestamp,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const totalTaggedTicketCountTimeSeriesFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
): TimeSeriesQuery<TicketCubeWithJoins> => ({
    ...totalTaggedTicketCountQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT_TIME_SERIES,
    timeDimensions: [
        {
            dimension: TicketTagsEnrichedDimension.Timestamp,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const totalTaggedTicketCountOnCreatedDatetimeTimeSeriesFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
): TimeSeriesQuery<TicketCubeWithJoins> => {
    const { filters: baseQueryFilters, ...baseQuery } =
        totalTaggedTicketCountTimeSeriesFactory(
            filters,
            timezone,
            granularity,
            sorting,
        )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_TAGGED_TICKET_COUNT_ON_CREATED_DATETIME_TIME_SERIES,
        filters: [...baseQueryFilters, createdTicketFilter(filters)],
    }
}

export const tagsTicketCountDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    tagId: string,
    dateRange: StatsFilters['period'],
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...tagsTicketCountQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT_DRILL_DOWN,
    dimensions: [TicketDimension.TicketId],
    filters: [
        ...tagsTicketCountQueryFactory(filters, timezone, sorting).filters,
        {
            member: TicketTagsEnrichedDimension.TagId,
            operator: ReportingFilterOperator.Equals,
            values: [tagId],
        },
        {
            member: TicketTagsEnrichedDimension.Timestamp,
            operator: ReportingFilterOperator.InDateRange,
            values: [
                formatReportingQueryDate(dateRange.start_datetime),
                formatReportingQueryDate(dateRange.end_datetime),
            ],
        },
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
})

export const tagsTicketCountOnCreatedDatetimeDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    tagId: string,
    dateRange: StatsFilters['period'],
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const { filters: baseQueryFilters, ...baseQuery } =
        tagsTicketCountDrillDownQueryFactory(
            filters,
            timezone,
            tagId,
            dateRange,
            sorting,
        )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.TICKET_INSIGHTS_TAGS_TICKET_COUNT_ON_CREATED_DATETIME_DRILL_DOWN,
        filters: [...baseQueryFilters, createdTicketFilter(filters)],
    }
}

export const tagsTicketCountDrillDownByReferenceQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    tagId: string,
    dateRange: StatsFilters['period'],
    sorting?: OrderDirection,
    ticketTimeReference: TicketTimeReference = TicketTimeReference.TaggedAt,
) => {
    const queryFactory =
        ticketTimeReference === TicketTimeReference.TaggedAt
            ? tagsTicketCountDrillDownQueryFactory
            : tagsTicketCountOnCreatedDatetimeDrillDownQueryFactory

    return queryFactory(filters, timezone, tagId, dateRange, sorting)
}
