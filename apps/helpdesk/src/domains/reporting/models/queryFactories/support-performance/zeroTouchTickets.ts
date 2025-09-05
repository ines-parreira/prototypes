import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketCubeWithJoins,
    TicketDimension,
    TicketMeasure,
    TicketSegment,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMember,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'
import { subtractDaysFromDate } from 'utils/date'

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
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS,
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
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_TIME_SERIES,
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
    METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_PER_AGENT,
)

export const zeroTouchTicketsPerChannelQueryFactory = perDimensionQueryFactory(
    zeroTouchTicketsQueryFactory,
    CHANNEL_DIMENSION,
    METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_PER_CHANNEL,
)

export const zeroTouchTicketsPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...zeroTouchTicketsQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_ZERO_TOUCH_TICKETS_PER_TICKET_DRILL_DOWN,
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
