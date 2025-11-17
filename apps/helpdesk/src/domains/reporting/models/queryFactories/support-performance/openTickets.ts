import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

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
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_OPEN_TICKETS,
    }
}

export const openTicketsPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...openTicketsQueryFactory(filters, timezone),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_OPEN_TICKETS_PER_TICKET_DRILL_DOWN,
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
