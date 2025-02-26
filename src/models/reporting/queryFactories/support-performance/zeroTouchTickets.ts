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
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { subtractDaysFromDate } from 'utils/date'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const ZERO_TOUCH_TICKETS_MAX_DAYS_INTO_THE_PAST = 180

export const zeroTouchTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const hardPeriodStart = formatReportingQueryDate(
        subtractDaysFromDate(
            filters.period.start_datetime,
            ZERO_TOUCH_TICKETS_MAX_DAYS_INTO_THE_PAST,
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
            TicketMessagesDimension.ZeroTouchTickets,
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

export const zeroTouchTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...zeroTouchTicketsQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension: TicketDimension.ClosedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const zeroTouchTicketsPerAgentQueryFactory = perDimensionQueryFactory(
    zeroTouchTicketsQueryFactory,
    TicketDimension.AssigneeUserId,
)

export const zeroTouchTicketsPerChannelQueryFactory = perDimensionQueryFactory(
    zeroTouchTicketsQueryFactory,
    CHANNEL_DIMENSION,
)

export const zeroTouchTicketsPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...zeroTouchTicketsQueryFactory(filters, timezone, sorting),
    measures: [],
    dimensions: [TicketDimension.TicketId, TicketDimension.CreatedDatetime],
    filters: [
        ...zeroTouchTicketsQueryFactory(filters, timezone, sorting).filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
