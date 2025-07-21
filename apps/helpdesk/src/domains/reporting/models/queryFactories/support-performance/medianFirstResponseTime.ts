import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketMessagesEnrichedFirstResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const medianFirstResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TicketMessagesMeasure.MedianFirstResponseTime],
    dimensions: [],
    timezone,
    segments: [TicketMessagesSegment.ConversationStarted],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters.period),
        },
        ...statsFiltersToReportingFilters(
            TicketMessagesEnrichedFirstResponseTimesMembers,
            statsFilters,
        ),
    ],
    ...(sorting
        ? {
              order: [[TicketMessagesMeasure.MedianFirstResponseTime, sorting]],
          }
        : {}),
})

export const medianFirstResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianFirstResponseTimeQueryFactory(filters, timezone, sorting),
    dimensions: [TicketMessagesDimension.FirstHelpdeskMessageUserId],
})

export const medianFirstResponseTimeMetricPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianFirstResponseTimeQueryFactory(filters, timezone, sorting),
    dimensions: [CHANNEL_DIMENSION],
})

export const firstResponseTimeMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = medianFirstResponseTimeMetricPerAgentQueryFactory(
        filters,
        timezone,
    )
    return {
        ...baseQuery,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketMessagesDimension.FirstResponseTime,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketMessagesDimension.FirstResponseTime, sorting]],
              }
            : {}),
    }
}
