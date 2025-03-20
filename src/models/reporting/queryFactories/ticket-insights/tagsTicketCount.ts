import { OrderDirection } from 'models/api/types'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketTagsEnrichedCube,
    TicketTagsEnrichedDimension,
    TicketTagsEnrichedMeasure,
} from 'models/reporting/cubes/TicketTagsEnrichedCube'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

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
})

export const tagsTicketCountQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketTagsEnrichedCube> => ({
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

export const tagsTicketCountTimeSeriesFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
): TimeSeriesQuery<TicketCubeWithJoins> => ({
    ...tagsTicketCountQueryFactory(filters, timezone, sorting),
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
    timeDimensions: [
        {
            dimension: TicketTagsEnrichedDimension.Timestamp,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const tagsTicketCountDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    tagId: string,
    dateRange: StatsFilters['period'],
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...tagsTicketCountQueryFactory(filters, timezone, sorting),
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
