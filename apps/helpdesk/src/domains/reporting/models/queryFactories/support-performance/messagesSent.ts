import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    HelpdeskMessagesStatsFiltersMembers,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    PublicAndMessageViaFilter,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const messagesSentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [HelpdeskMessageMeasure.MessageCount],
    dimensions: [],
    timezone,
    filters: [
        {
            member: TicketMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [formatReportingQueryDate(filters.period.start_datetime)],
        },
        {
            member: TicketMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [formatReportingQueryDate(filters.period.end_datetime)],
        },
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters.period),
        },
        ...NotSpamNorTrashedTicketsFilter,
        ...PublicAndMessageViaFilter,
        ...statsFiltersToReportingFilters(
            HelpdeskMessagesStatsFiltersMembers,
            filters,
        ),
    ],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
          }
        : {}),
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT,
})

export const messagesSentTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...messagesSentQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension: HelpdeskMessageDimension.SentDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_TIME_SERIES,
})

export const messagesSentMetricPerAgentQueryFactory = perDimensionQueryFactory(
    messagesSentQueryFactory,
    HelpdeskMessageDimension.SenderId,
    METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_AGENT,
)

export const messagesSentMetricPerChannelQueryFactory =
    perDimensionQueryFactory(
        messagesSentQueryFactory,
        CHANNEL_DIMENSION,
        METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_CHANNEL,
    )

export const messagesSentMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = messagesSentQueryFactory(filters, timezone)

    return {
        ...baseQuery,
        measures: [HelpdeskMessageMeasure.MessageCount],
        dimensions: [TicketDimension.TicketId, ...baseQuery.dimensions],
        limit: DRILLDOWN_QUERY_LIMIT,
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_SENT_PER_TICKET_DRILL_DOWN,
        ...(sorting
            ? {
                  order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
              }
            : {}),
    }
}
