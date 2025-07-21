import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const medianResolutionTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMessagesMeasure.MedianResolutionTime],
    dimensions: [],
    timezone,
    segments: [
        TicketSegment.ClosedTickets,
        TicketMessagesSegment.ConversationStarted,
    ],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketStatsFiltersMembers,
            statsFilters,
        ),
    ],
    ...(sorting
        ? {
              order: [[TicketMessagesMeasure.MedianResolutionTime, sorting]],
          }
        : {}),
})

export const medianResolutionTimeMetricPerAgentQueryFactory =
    perDimensionQueryFactory(
        medianResolutionTimeQueryFactory,
        TicketDimension.AssigneeUserId,
    )

export const medianResolutionTimeMetricPerChannelQueryFactory =
    perDimensionQueryFactory(
        medianResolutionTimeQueryFactory,
        CHANNEL_DIMENSION,
    )

export const resolutionTimeMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...medianResolutionTimeQueryFactory(filters, timezone),
    measures: [],
    dimensions: [
        TicketDimension.TicketId,
        TicketMessagesDimension.ResolutionTime,
    ],
    filters: [
        ...medianResolutionTimeQueryFactory(filters, timezone).filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketMessagesDimension.ResolutionTime, sorting]],
          }
        : {}),
})
