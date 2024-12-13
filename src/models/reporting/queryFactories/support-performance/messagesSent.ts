import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
import {CHANNEL_DIMENSION} from 'models/reporting/queryFactories/support-performance/constants'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    HelpdeskMessagesStatsFiltersMembers,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    PublicAndMessageViaFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
} from 'utils/reporting'

export const messagesSentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
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
            filters
        ),
    ],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
          }
        : {}),
})

export const messagesSentTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...messagesSentQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension: HelpdeskMessageDimension.SentDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const messagesSentMetricPerAgentQueryFactory = perDimensionQueryFactory(
    messagesSentQueryFactory,
    HelpdeskMessageDimension.SenderId
)

export const messagesSentMetricPerChannelQueryFactory =
    perDimensionQueryFactory(messagesSentQueryFactory, CHANNEL_DIMENSION)

export const messagesSentMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = messagesSentQueryFactory(filters, timezone)

    return {
        ...baseQuery,
        measures: [HelpdeskMessageMeasure.MessageCount],
        dimensions: [TicketDimension.TicketId, ...baseQuery.dimensions],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[HelpdeskMessageMeasure.MessageCount, sorting]],
              }
            : {}),
    }
}
