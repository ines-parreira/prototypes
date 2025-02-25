import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { subtractDaysFromDate } from 'utils/date'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const OPEN_TICKETS_MAX_DAYS_INTO_THE_PAST = 180

export const openTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            OPEN_TICKETS_MAX_DAYS_INTO_THE_PAST,
        ),
    )
    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            {
                member: TicketMember.Status,
                operator: ReportingFilterOperator.Equals,
                values: ['open'],
            },
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ).map((filter) => {
                if (filter.member === TicketStatsFiltersMembers.periodStart)
                    return {
                        member: TicketMember.PeriodStart,
                        operator: ReportingFilterOperator.AfterDate,
                        values: [hardPeriodStart],
                    }
                return filter
            }),
            {
                member: TicketMember.CreatedDatetime,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
        ],
    }
}

export const openTicketsPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...openTicketsQueryFactory(filters, timezone),
    measures: [],
    dimensions: [TicketDimension.TicketId, TicketDimension.CreatedDatetime],
    filters: [
        ...openTicketsQueryFactory(filters, timezone).filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
