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
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS,
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

export const oneTouchTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...oneTouchTicketsQueryFactory(filters, timezone),
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_TIME_SERIES,
    timeDimensions: [
        {
            dimension: TicketDimension.ClosedDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const oneTouchTicketsPerAgentQueryFactory = perDimensionQueryFactory(
    oneTouchTicketsQueryFactory,
    TicketDimension.AssigneeUserId,
    METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_AGENT,
)

export const oneTouchTicketsPerChannelQueryFactory = perDimensionQueryFactory(
    oneTouchTicketsQueryFactory,
    CHANNEL_DIMENSION,
    METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_CHANNEL,
)

export const oneTouchTicketsPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...oneTouchTicketsQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_ONE_TOUCH_TICKETS_PER_TICKET_DRILL_DOWN,
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
