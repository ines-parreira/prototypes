import {OrderDirection} from 'models/api/types'
import {
    TicketDimension,
    TicketSegment,
    TicketCubeWithJoins,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'
import {subtractDaysFromDate} from 'utils/date'

export const MESSAGES_MAX_DAYS_INTO_THE_PAST = 180

export const messagesPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string
): ReportingQuery<TicketCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            MESSAGES_MAX_DAYS_INTO_THE_PAST
        )
    )
    return {
        measures: [TicketMessagesMeasure.MessagesAverage],
        dimensions: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
            {
                member: TicketMessagesMember.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
        ],
        segments: [
            TicketSegment.ClosedTickets,
            TicketMessagesSegment.ConversationStarted,
        ],
    }
}

export const messagesPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketCubeWithJoins> => {
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
