import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMeasure,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import {
    addOptionalFilter,
    hasFilter,
} from 'domains/reporting/models/queryFactories/utils'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilter,
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
            values: [formatReportingQueryDate(filters.period.start_datetime)],
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
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED,
        ...(sorting
            ? {
                  order: [[TicketMeasure.TicketCount, sorting]],
              }
            : {}),
    }
}

export const ticketsCreatedPerChannelPerChannelQueryFactory =
    perDimensionQueryFactory(
        ticketsCreatedQueryFactory,
        CHANNEL_DIMENSION,
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_PER_CHANNEL,
    )

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
            values: [formatReportingQueryDate(filters.period.start_datetime)],
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
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_TIME_SERIES,
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
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_CREATED_PER_TICKET_DRILL_DOWN,
})
