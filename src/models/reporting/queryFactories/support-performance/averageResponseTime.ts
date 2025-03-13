import { OrderDirection } from 'models/api/types'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
} from 'models/reporting/cubes/TicketMessagesCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { addOptionalFilter } from 'models/reporting/queryFactories/utils'
import {
    ReportingFilter,
    ReportingFilterOperator,
    ReportingQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const averageResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const { agents, ...statFiltersWithoutAgents } = statsFilters
    let commonFilters: ReportingFilter[] = [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMessagesMember.SentDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters.period),
        },
    ]
    commonFilters = addOptionalFilter(commonFilters, agents, {
        member: TicketMessagesMember.SenderId,
        operator: ReportingFilterOperator.Equals,
    })

    return {
        measures: [TicketMessagesMeasure.AverageResponseTime],
        dimensions: [],
        timezone,
        segments: [],
        filters: [
            ...commonFilters,
            ...statsFiltersToReportingFilters(
                TicketStatsFiltersMembers,
                statFiltersWithoutAgents,
            ),
        ],
        ...(sorting
            ? {
                  order: [[TicketMessagesMeasure.AverageResponseTime, sorting]],
              }
            : {}),
    }
}

export const averageResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...averageResponseTimeQueryFactory(filters, timezone, sorting),
    dimensions: [TicketMessagesDimension.SenderId],
})

export const averageResponseTimeMetricPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...averageResponseTimeQueryFactory(filters, timezone, sorting),
    dimensions: [CHANNEL_DIMENSION],
})

export const averageResponseTimeMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = averageResponseTimeMetricPerAgentQueryFactory(
        filters,
        timezone,
    )
    return {
        ...baseQuery,
        measures: [],
        dimensions: [TicketDimension.TicketId, ...baseQuery.dimensions],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketMessagesMeasure.AverageResponseTime, sorting]],
              }
            : {}),
    }
}
