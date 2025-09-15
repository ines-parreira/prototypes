import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesDimension,
    TicketMessagesMeasure,
    TicketMessagesMember,
    TicketMessagesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesCube'
import {
    TicketsFirstAgentResponseTimeDimension,
    TicketsFirstAgentResponseTimeMeasure,
} from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingFilterOperator,
    ReportingQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketMessagesEnrichedFirstResponseTimesMembers,
    TicketsFirstAgentResponseTimeMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const medianFirstResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    measures: [TicketMessagesMeasure.MedianFirstResponseTime],
    dimensions: [],
    timezone,
    segments: [TicketMessagesSegment.ConversationStarted],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketMessagesMember.FirstHelpdeskMessageDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters.period),
        },
        ...statsFiltersToReportingFilters(
            TicketMessagesEnrichedFirstResponseTimesMembers,
            statsFilters,
        ),
    ],
    ...(sorting
        ? {
              order: [[TicketMessagesMeasure.MedianFirstResponseTime, sorting]],
          }
        : {}),
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME,
})

export const medianFirstAgentResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_AGENT_RESPONSE_TIME,
    measures: [
        TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime,
    ],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        {
            member: TicketsFirstAgentResponseTimeDimension.FirstAgentMessageDatetime,
            operator: ReportingFilterOperator.InDateRange,
            values: getFilterDateRange(statsFilters.period),
        },
        ...statsFiltersToReportingFilters(
            TicketsFirstAgentResponseTimeMembers,
            statsFilters,
        ),
    ],
    order: sorting
        ? [
              [
                  TicketsFirstAgentResponseTimeMeasure.MedianFirstAgentResponseTime,
                  sorting,
              ],
          ]
        : undefined,
})

export const medianFirstResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianFirstResponseTimeQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_AGENT,
    dimensions: [TicketMessagesDimension.FirstHelpdeskMessageUserId],
})

export const medianFirstAgentResponseTimePerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianFirstAgentResponseTimeQueryFactory(filters, timezone, sorting),
    dimensions: [
        TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId,
    ],
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_AGENT_RESPONSE_TIME_PER_AGENT,
})

export const medianFirstResponseTimeMetricPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianFirstResponseTimeQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_CHANNEL,
    dimensions: [CHANNEL_DIMENSION],
})

export const medianFirstAgentResponseTimePerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianFirstAgentResponseTimeQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_AGENT_RESPONSE_TIME_PER_CHANNEL,
    dimensions: [CHANNEL_DIMENSION],
})

export const firstResponseTimeMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = medianFirstResponseTimeMetricPerAgentQueryFactory(
        filters,
        timezone,
    )
    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_RESPONSE_TIME_PER_TICKET_DRILL_DOWN,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketMessagesDimension.FirstResponseTime,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketMessagesDimension.FirstResponseTime, sorting]],
              }
            : {}),
    }
}

export const medianFirstAgentResponseTimePerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = medianFirstAgentResponseTimeQueryFactory(
        filters,
        timezone,
    )

    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_FIRST_AGENT_RESPONSE_TIME_PER_TICKET_DRILL_DOWN,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketsFirstAgentResponseTimeDimension.FirstAgentResponseTime,
            TicketsFirstAgentResponseTimeDimension.FirstAgentMessageUserId,
            ...baseQuery.dimensions,
        ],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [
                          TicketsFirstAgentResponseTimeDimension.FirstAgentResponseTime,
                          sorting,
                      ],
                  ],
              }
            : {}),
    }
}
