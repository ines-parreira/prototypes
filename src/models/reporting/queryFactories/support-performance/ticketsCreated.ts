import { OrderDirection } from 'models/api/types'
import { HelpdeskMessageCubeWithJoins } from 'models/reporting/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'models/reporting/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import {
    addOptionalFilter,
    hasFilter,
} from 'models/reporting/queryFactories/utils'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const ticketsCreatedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const { agents, ...statFiltersWithoutAgents } = filters
    let commonFilters: ReportingFilter[] = [
        {
            member: TicketMember.CreatedDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(filters.period),
        },
        ...NotSpamNorTrashedTicketsFilter,
    ]

    commonFilters = addOptionalFilter(commonFilters, agents, {
        member: TicketMessagesMember.FirstHelpdeskMessageUserId,
        operator: ReportingFilterOperator.Equals,
    })

    if (hasFilter(agents)) {
        commonFilters.push({
            member: TicketMessagesMember.PeriodStart,
            operator: ReportingFilterOperator.AfterDate,
            values: [statFiltersWithoutAgents.period.start_datetime],
        })
    }

    return {
        measures: [TicketMeasure.TicketCount],
        dimensions: [],
        segments: hasFilter(agents)
            ? [TicketMessagesSegment.TicketCreatedByAgent]
            : [],
        timezone,
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents,
            ),
        ],
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}

export const ticketsCreatedPerChannelPerChannelQueryFactory =
    perDimensionQueryFactory(ticketsCreatedQueryFactory, CHANNEL_DIMENSION)

export const ticketsCreatedTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => {
    const { agents, ...statFiltersWithoutAgents } = filters
    let commonFilters: ReportingFilter[] = [...NotSpamNorTrashedTicketsFilter]

    if (hasFilter(agents)) {
        commonFilters = addOptionalFilter(commonFilters, agents, {
            member: TicketMessagesMember.FirstHelpdeskMessageUserId,
            operator: ReportingFilterOperator.Equals,
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
        segments: hasFilter(agents)
            ? [TicketMessagesSegment.TicketCreatedByAgent]
            : [],
        timeDimensions: [
            {
                dimension: TicketDimension.CreatedDatetime,
                granularity,
                dateRange: getFilterDateRange(filters.period),
            },
        ],
        timezone,
        order: [[TicketDimension.CreatedDatetime, OrderDirection.Asc]],
        filters: [
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents,
            ),
            ...commonFilters,
        ],
    }
}

export const ticketsCreatedPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
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
