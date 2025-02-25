import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
    TicketMeasure,
    TicketSegment,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMember,
} from 'models/reporting/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { ReportingFilterOperator, ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { subtractDaysFromDate } from 'utils/date'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const ONE_TOUCH_TICKETS_MAX_DAYS_INTO_THE_PAST = 180

export const oneTouchTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            ONE_TOUCH_TICKETS_MAX_DAYS_INTO_THE_PAST,
        ),
    )
    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                filters,
            ),
            {
                member: TicketDimension.CreatedDatetime,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
            {
                member: TicketMessagesMember.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: [hardPeriodStart],
            },
        ],
        segments: [
            TicketMessagesDimension.OneTouchTickets,
            TicketSegment.ClosedTickets,
        ],
        timeDimensions: [],
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}

export const oneTouchTicketsPerAgentQueryFactory = perDimensionQueryFactory(
    oneTouchTicketsQueryFactory,
    TicketDimension.AssigneeUserId,
)

export const oneTouchTicketsPerChannelQueryFactory = perDimensionQueryFactory(
    oneTouchTicketsQueryFactory,
    CHANNEL_DIMENSION,
)

export const oneTouchTicketsPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...oneTouchTicketsQueryFactory(filters, timezone, sorting),
    measures: [],
    dimensions: [TicketDimension.TicketId, TicketDimension.CreatedDatetime],
    filters: [
        ...oneTouchTicketsQueryFactory(filters, timezone, sorting).filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
