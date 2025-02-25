import { OrderDirection } from 'models/api/types'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { addOptionalFilter } from 'models/reporting/queryFactories/utils'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const medianFirstResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const { agents, ...statFiltersWithoutAgents } = statsFilters
    let commonFilters: ReportingFilter[] = [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters.period),
        },
    ]
    commonFilters = addOptionalFilter(commonFilters, agents, {
        member: TicketMessagesMember.FirstHelpdeskMessageUserId,
        operator: ReportingFilterOperator.Equals,
    })

    return {
        measures: [TicketMessagesMeasure.MedianFirstResponseTime],
        dimensions: [],
        timezone,
        segments: [TicketMessagesSegment.ConversationStarted],
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents,
            ),
        ],
        ...(sorting
            ? {
                  order: [
                      [TicketMessagesMeasure.MedianFirstResponseTime, sorting],
                  ],
              }
            : {}),
    }
}

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
