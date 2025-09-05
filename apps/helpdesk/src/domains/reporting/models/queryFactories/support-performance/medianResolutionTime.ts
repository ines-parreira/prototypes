import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
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
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME,
})

export const medianResolutionTimeMetricPerAgentQueryFactory =
    perDimensionQueryFactory(
        medianResolutionTimeQueryFactory,
        TicketDimension.AssigneeUserId,
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_AGENT,
    )

export const medianResolutionTimeMetricPerChannelQueryFactory =
    perDimensionQueryFactory(
        medianResolutionTimeQueryFactory,
        CHANNEL_DIMENSION,
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_CHANNEL,
    )

export const resolutionTimeMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...medianResolutionTimeQueryFactory(filters, timezone),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESOLUTION_TIME_PER_TICKET_DRILL_DOWN,
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
