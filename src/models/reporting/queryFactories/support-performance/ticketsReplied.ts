import {TicketMessageSourceType} from 'business/types/ticket'
import {OrderDirection} from 'models/api/types'
import {
    HelpdeskMessageCubeWithJoins,
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'models/reporting/cubes/HelpdeskMessageCube'
import {TicketMember} from 'models/reporting/cubes/TicketCube'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    formatReportingQueryDate,
    getFilterDateRange,
    HelpdeskMessagesStatsFiltersMembers,
    NotSpamNorTrashedTicketsFilter,
    PublicHelpdeskAndApiMessagesFilter,
    statsFiltersToReportingFilters,
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
    ...ticketsRepliedQueryFactory(filters, timezone), // ticketsRepliedQueryFactory had one more filter then the timeSeries query - was that an error ?
    filters: [
        {
            member: TicketMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [filters.period.start_datetime],
        },
        {
            member: TicketMember.PeriodEnd,
            operator: ReportingFilterOperator.BeforeDate,
            values: [filters.period.end_datetime],
        },
        {
            member: HelpdeskMessageMember.Channel,
            operator: ReportingFilterOperator.NotEquals,
            values: [TicketMessageSourceType.InternalNote],
        },
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            HelpdeskMessagesStatsFiltersMembers,
            filters
        ),
    ],
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
