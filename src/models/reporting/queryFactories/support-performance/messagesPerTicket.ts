import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketSegment} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    PublicHelpdeskAndApiMessagesFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const messagesPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [TicketMessagesMeasure.MessagesAverage],
    dimensions: [],
    timezone,
    filters: [
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters),
        },
        ...PublicHelpdeskAndApiMessagesFilter,
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    segments: [
        TicketSegment.ClosedTickets,
        TicketMessagesSegment.ConversationStarted,
    ],
})

export const messagesPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = messagesPerTicketQueryFactory(filters, timezone)
    return {
        ...baseQuery,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketMessagesDimension.MessagesCount,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketMessagesDimension.MessagesCount, sorting]],
              }
            : {}),
    }
}
