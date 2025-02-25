import { OrderDirection } from 'models/api/types'
import {
    HandleTimeCubeWithJoins,
    HandleTimeDimension,
    HandleTimeMeasure,
} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {
    TicketDimension,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const ticketAverageHandleTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
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

export const ticketAverageHandleTimePerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
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
})

export const ticketAverageHandleTimePerAgentPerChannelQueryFactory =
    perDimensionQueryFactory(
        ticketAverageHandleTimePerAgentQueryFactory,
        CHANNEL_DIMENSION,
    )

export const ticketHandleTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
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

export const ticketHandleTimePerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    ...ticketHandleTimeQueryFactory(filters, timezone, sorting),
    measures: [],
    dimensions: [
        TicketDimension.TicketId,
        HandleTimeDimension.TicketHandleTime,
    ],
    filters: [
        ...ticketAverageHandleTimeQueryFactory(filters, timezone, sorting)
            .filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[HandleTimeDimension.TicketHandleTime, sorting]],
          }
        : {}),
})
