import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

export const MESSAGES_MAX_DAYS_INTO_THE_PAST = 180

export const messagesPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<TicketCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            MESSAGES_MAX_DAYS_INTO_THE_PAST,
        ),
    )
    return {
        measures: [TicketMessagesMeasure.MessagesAverage],
        dimensions: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
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
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET,
    }
}

export const messagesPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = messagesPerTicketQueryFactory(filters, timezone)
    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_PER_TICKET_DRILL_DOWN,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketMessagesDimension.MessagesCount,
            ...baseQuery.dimensions,
        ],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketMessagesDimension.MessagesCount, sorting]],
              }
            : {}),
    }
}
