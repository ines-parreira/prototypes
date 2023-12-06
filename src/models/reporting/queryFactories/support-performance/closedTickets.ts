import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const closedTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMeasure.TicketCount],
    dimensions: [],
    timezone,
    segments: [TicketSegment.ClosedTickets],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
})

export const closedTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...closedTicketsQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension: TicketDimension.ClosedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    order: [[TicketDimension.ClosedDatetime, OrderDirection.Asc]],
})

export const closedTicketsPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...closedTicketsQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [[TicketMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const closedTicketsPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...closedTicketsQueryFactory(filters, timezone),
    measures: [],
    dimensions: [TicketDimension.TicketId],
    filters: [
        ...closedTicketsQueryFactory(filters, timezone).filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketMeasure.TicketCount, sorting]],
          }
        : {}),
})
