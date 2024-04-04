import {OrderDirection} from 'models/api/types'
import {
    HandleTimeCubeWithJoins,
    HandleTimeMeasure,
} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {TicketDimension, TicketSegment} from 'models/reporting/cubes/TicketCube'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const ticketAverageHandleTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    measures: [HandleTimeMeasure.AverageHandleTime],
    dimensions: [],
    segments: ['TicketEnriched.closedTickets'], // quick fix until cube rename is fixed
    timezone,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
          }
        : {}),
})

export const ticketAverageHandleTimePerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    ...ticketAverageHandleTimeQueryFactory(filters, timezone, sorting),
    measures: [HandleTimeMeasure.AverageHandleTime],
    dimensions: [TicketDimension.AssigneeUserId],
    filters: [
        ...ticketAverageHandleTimeQueryFactory(filters, timezone, sorting)
            .filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
          }
        : {}),
})

export const ticketHandleTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    measures: [HandleTimeMeasure.HandleTime],
    dimensions: [],
    segments: [TicketSegment.ClosedTickets],
    timezone,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.HandleTime, sorting]],
          }
        : {}),
})

export const ticketHandleTimePerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    ...ticketHandleTimeQueryFactory(filters, timezone, sorting),
    dimensions: [TicketDimension.TicketId],
    filters: [
        ...ticketAverageHandleTimeQueryFactory(filters, timezone, sorting)
            .filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.HandleTime, sorting]],
          }
        : {}),
})
