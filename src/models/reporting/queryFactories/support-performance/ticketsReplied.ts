import {TicketMessageSourceType} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketDimension, TicketMember} from 'models/reporting/cubes/TicketCube'
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
    PublicHelpdeskAndApiMessagesFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
} from 'utils/reporting'

export const ticketsRepliedQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => ({
    measures: [HelpdeskMessageMeasure.TicketCount],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: HelpdeskMessageMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters),
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
})

export const ticketsRepliedTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...ticketsRepliedQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension: HelpdeskMessageDimension.SentDatetime,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
})

export const ticketsRepliedMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...ticketsRepliedQueryFactory(filters, timezone),
    dimensions: [HelpdeskMessageDimension.SenderId],
    ...(sorting
        ? {
              order: [[HelpdeskMessageMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const ticketsRepliedMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = ticketsRepliedMetricPerAgentQueryFactory(
        filters,
        timezone,
        sorting
    )
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
