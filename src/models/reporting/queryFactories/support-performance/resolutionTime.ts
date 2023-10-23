import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketSegment} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMeasure,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const resolutionTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string
) => ({
    measures: [TicketMessagesMeasure.ResolutionTime],
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
})
export const resolutionTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...resolutionTimeQueryFactory(filters, timezone),
    dimensions: [TicketDimension.AssigneeUserId],
    ...(sorting
        ? {
              order: [[TicketMessagesMeasure.ResolutionTime, sorting]],
          }
        : {}),
})
