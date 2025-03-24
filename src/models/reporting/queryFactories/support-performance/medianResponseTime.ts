import { OrderDirection } from 'models/api/types'
import {
    TicketCubeWithJoins,
    TicketDimension,
} from 'models/reporting/cubes/TicketCube'
import {
    TicketMessagesEnrichedResponseTimesDimension,
    TicketMessagesEnrichedResponseTimesMeasure,
    TicketMessagesEnrichedResponseTimesSegment,
} from 'models/reporting/cubes/TicketMessagesEnrichedResponseTimesCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import { ReportingQuery } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
    TicketMessagesEnrichedResponseTimesMembers,
} from 'utils/reporting'

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
    }
}

export const medianResponseTimeMetricPerAgentQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketCubeWithJoins> => ({
    ...medianResponseTimeQueryFactory(filters, timezone, sorting),
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
