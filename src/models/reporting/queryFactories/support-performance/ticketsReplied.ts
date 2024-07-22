import {TicketMessageSourceType} from 'business/types/ticket'
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
    PublicHelpdeskAndApiMessagesFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
} from 'utils/reporting'

export const ticketsRepliedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    measures: [HelpdeskMessageMeasure.TicketCount],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters.period),
        },
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
            member: TicketMember.Channel,
            operator: ReportingFilterOperator.NotEquals,
            values: [TicketMessageSourceType.InternalNote],
        },
        ...PublicHelpdeskAndApiMessagesFilter,
        ...statsFiltersToReportingFilters(
            HelpdeskMessagesStatsFiltersMembers,
            filters
        ),
    ],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const ticketsRepliedTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...ticketsRepliedQueryFactory(filters, timezone, sorting),
    timeDimensions: [
        {
            dimension: HelpdeskMessageDimension.SentDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const ticketsRepliedMetricPerAgentQueryFactory =
    perDimensionQueryFactory(
        ticketsRepliedQueryFactory,
        HelpdeskMessageDimension.SenderId
    )

export const ticketsRepliedMetricPerChannelQueryFactory =
    perDimensionQueryFactory(ticketsRepliedQueryFactory, CHANNEL_DIMENSION)

export const ticketsRepliedMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = ticketsRepliedQueryFactory(filters, timezone, sorting)
    return {
        ...baseQuery,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketDimension.CreatedDatetime,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketDimension.CreatedDatetime, sorting]],
              }
            : {}),
    }
}
