import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketSegment} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const medianResolutionTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
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
            statsFilters
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
        TicketDimension.AssigneeUserId
    )

export const medianResolutionTimeMetricPerChannelQueryFactory =
    perDimensionQueryFactory(
        medianResolutionTimeQueryFactory,
        CHANNEL_DIMENSION
    )

export const resolutionTimeMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
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
