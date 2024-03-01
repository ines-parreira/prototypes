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

export const ticketHandleTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    filters: [
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    measures: [HandleTimeMeasure.AverageHandleTime],
    dimensions: [],
    segments: [TicketSegment.ClosedTickets],
    timezone,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
          }
        : {}),
})

export const ticketHandleTimePerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    ...ticketHandleTimeQueryFactory(filters, timezone, sorting),
    measures: [HandleTimeMeasure.HandleTime],
    dimensions: [TicketDimension.TicketId],
    filters: [
        ...ticketHandleTimeQueryFactory(filters, timezone, sorting).filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.HandleTime, sorting]],
          }
        : {}),
})
