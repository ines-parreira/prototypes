import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const closedTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMeasure.TicketCount],
    dimensions: [],
    timezone,
    segments: [TicketSegment.ClosedTickets],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    ...(sorting
        ? {
              order: [[TicketMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const closedTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...closedTicketsQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension: TicketDimension.ClosedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    order: [[TicketDimension.ClosedDatetime, OrderDirection.Asc]],
})

export const closedTicketsPerAgentQueryFactory = perDimensionQueryFactory(
    closedTicketsQueryFactory,
    TicketDimension.AssigneeUserId,
)

export const closedTicketsPerChannelQueryFactory = perDimensionQueryFactory(
    closedTicketsQueryFactory,
    CHANNEL_DIMENSION,
)

export const closedTicketsPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = closedTicketsPerAgentQueryFactory(filters, timezone)
    return {
        ...baseQuery,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketDimension.CreatedDatetime,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketDimension.CreatedDatetime, sorting]],
              }
            : {}),
    }
}
