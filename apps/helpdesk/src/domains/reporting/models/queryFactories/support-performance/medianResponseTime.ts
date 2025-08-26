import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketMessagesEnrichedResponseTimesDimension,
    TicketMessagesEnrichedResponseTimesMeasure,
    TicketMessagesEnrichedResponseTimesSegment,
} from 'domains/reporting/models/cubes/TicketMessagesEnrichedResponseTimesCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingQuery } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketMessagesEnrichedResponseTimesMembers,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const medianResponseTimeQueryFactory = (
    statsFilters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    return {
        measures: [
            TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
        ],
        dimensions: [],
        timezone,
        segments: [
            TicketMessagesEnrichedResponseTimesSegment.ConversationStarted,
        ],
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            ...statsFiltersToReportingFilters(
                TicketMessagesEnrichedResponseTimesMembers,
                statsFilters,
            ),
        ],
        ...(sorting
            ? {
                  order: [
                      [
                          TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                          sorting,
                      ],
                  ],
              }
            : {}),
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME,
    }
}

export const medianResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianResponseTimeQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_AGENT,
    dimensions: [
        TicketMessagesEnrichedResponseTimesDimension.TicketMessageUserId,
    ],
})

export const medianResponseTimeMetricPerChannelQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianResponseTimeQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_CHANNEL,
    dimensions: [CHANNEL_DIMENSION],
})

export const medianResponseTimeMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => {
    const baseQuery = medianResponseTimeQueryFactory(filters, timezone)
    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_MEDIAN_RESPONSE_TIME_PER_TICKET_DRILL_DOWN,
        measures: [
            TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
        ],
        dimensions: [TicketDimension.TicketId],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [
                          TicketMessagesEnrichedResponseTimesMeasure.MedianResponseTime,
                          sorting,
                      ],
                  ],
              }
            : {}),
    }
}
