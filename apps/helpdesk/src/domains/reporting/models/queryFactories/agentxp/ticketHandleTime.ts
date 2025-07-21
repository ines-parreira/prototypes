import {
    HandleTimeCubeWithJoins,
    HandleTimeDimension,
    HandleTimeMeasure,
} from 'domains/reporting/models/cubes/agentxp/HandleTimeCube'
import {
    TicketDimension,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

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
