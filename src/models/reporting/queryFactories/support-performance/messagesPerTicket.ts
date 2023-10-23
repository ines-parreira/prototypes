import {HelpdeskMessageMember} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketSegment} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMeasure,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {ReportingFilterOperator} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    PublicHelpdeskAndApiMessagesFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const messagesPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
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
