import {OrderDirection} from 'models/api/types'
import {
    HandleTimeCubeWithJoins,
    HandleTimeMeasure,
} from 'models/reporting/cubes/agentxp/HandleTimeCube'
import {
    TicketDimension,
    TicketMember,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {ReportingFilterOperator, ReportingQuery} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {subtractDaysFromDate} from 'utils/date'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const AVERAGE_HANDLE_TIME_TICKET_CREATION_MAX_DAYS_INTO_THE_PAST = 30

export const ticketAverageHandleTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            AVERAGE_HANDLE_TIME_TICKET_CREATION_MAX_DAYS_INTO_THE_PAST
        )
    )

    return {
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
        ],
        measures: [HandleTimeMeasure.AverageHandleTime],
        dimensions: [],
        segments: [TicketSegment.ClosedTickets],
        timezone,
        ...(sorting
            ? {
                  order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
              }
            : {}),
    }
}

export const ticketAverageHandleTimePerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    ...ticketAverageHandleTimeQueryFactory(filters, timezone, sorting),
    measures: [HandleTimeMeasure.AverageHandleTime],
    dimensions: [TicketDimension.AssigneeUserId],
    filters: [
        ...ticketAverageHandleTimeQueryFactory(filters, timezone, sorting)
            .filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.AverageHandleTime, sorting]],
          }
        : {}),
})

export const ticketHandleTimeQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            AVERAGE_HANDLE_TIME_TICKET_CREATION_MAX_DAYS_INTO_THE_PAST
        )
    )

    return {
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters
            ),
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
        ],
        measures: [HandleTimeMeasure.HandleTime],
        dimensions: [],
        segments: [TicketSegment.ClosedTickets],
        timezone,
        ...(sorting
            ? {
                  order: [[HandleTimeMeasure.HandleTime, sorting]],
              }
            : {}),
    }
}

export const ticketHandleTimePerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HandleTimeCubeWithJoins> => ({
    ...ticketHandleTimeQueryFactory(filters, timezone, sorting),
    dimensions: [TicketDimension.TicketId],
    filters: [
        ...ticketAverageHandleTimeQueryFactory(filters, timezone, sorting)
            .filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[HandleTimeMeasure.HandleTime, sorting]],
          }
        : {}),
})
