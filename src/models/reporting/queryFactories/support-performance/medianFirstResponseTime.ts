import {OrderDirection} from 'models/api/types'
import {TicketCubeWithJoins} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const medianFirstResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => {
    const {agents, ...statFiltersWithoutAgents} = statsFilters
    const commonFilters: ReportingFilter[] = [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters),
        },
    ]
    if (agents?.length) {
        commonFilters.push({
            member: TicketMessagesMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
            values: agents.map((agent) => agent.toString()),
        })
    }

    return {
        measures: [TicketMessagesMeasure.MedianFirstResponseTime],
        dimensions: [],
        timezone,
        segments: [TicketMessagesSegment.ConversationStarted],
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents
            ),
        ],
    }
}

export const medianFirstResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianFirstResponseTimeQueryFactory(filters, timezone),
    dimensions: [TicketMessagesDimension.FirstHelpdeskMessageUserId],
    ...(sorting
        ? {
              order: [[TicketMessagesMeasure.MedianFirstResponseTime, sorting]],
          }
        : {}),
})
