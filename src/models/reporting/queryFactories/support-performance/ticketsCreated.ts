import {OrderDirection} from 'models/api/types'
import {HelpdeskMessageCubeWithJoins} from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const ticketsCreatedQueryFactory = (
    filters: StatsFilters,
    timezone: string
) => {
    const {agents, ...statFiltersWithoutAgents} = filters
    const commonFilters: ReportingFilter[] = [
        {
            member: TicketMember.CreatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters),
        },
        ...NotSpamNorTrashedTicketsFilter,
    ]
    if (agents?.length) {
        commonFilters.push({
            member: TicketMessagesMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
            values: agents.map((agent) => agent.toString()),
        })
        commonFilters.push({
            member: TicketMessagesMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [statFiltersWithoutAgents.period.start_datetime],
        })
    }

    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        segments: agents?.length
            ? [TicketMessagesSegment.TicketCreatedByAgent]
            : [],
        timezone,
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents
            ),
        ],
    }
}

export const ticketsCreatedTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => {
    const {agents, ...statFiltersWithoutAgents} = filters
    const commonFilters: ReportingFilter[] = [...NotSpamNorTrashedTicketsFilter]
    if (agents?.length) {
        commonFilters.push({
            member: TicketMessagesMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
            values: agents.map(String),
        })
        commonFilters.push({
            member: TicketMessagesMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [statFiltersWithoutAgents.period.start_datetime],
        })
    }

    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        segments: agents?.length
            ? [TicketMessagesSegment.TicketCreatedByAgent]
            : [],
        timeDimensions: [
            {
                dimension: TicketDimension.CreatedDatetime,
                granularity,
                dateRange: getFilterDateRange(filters),
            },
        ],
        timezone,
        order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents
            ),
            ...commonFilters,
        ],
    }
}

export const ticketsCreatedPerTicketQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<HelpdeskMessageCubeWithJoins> => ({
    ...ticketsCreatedQueryFactory(filters, timezone),
    measures: [],
    dimensions: [TicketDimension.TicketId, TicketDimension.CreatedDatetime],
    filters: [
        ...ticketsCreatedQueryFactory(filters, timezone).filters,
        TicketDrillDownFilter,
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
