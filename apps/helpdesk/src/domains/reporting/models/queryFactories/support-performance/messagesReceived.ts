import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import {
    HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins,
    HelpdeskCustomerMessagesReceivedEnrichedMeasure,
    HelpdeskCustomerMessagesReceivedEnrichedMember,
} from 'domains/reporting/models/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    HelpdeskCustomerMessagesReceivedStatsFiltersMembers,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
} from 'domains/reporting/utils/reporting'
import { OrderDirection } from 'models/api/types'

export const messagesReceivedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins> => ({
    measures: [HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount],
    dimensions: [],
    timezone,
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            HelpdeskCustomerMessagesReceivedStatsFiltersMembers,
            filters,
        ),
    ],
    ...(sorting
        ? {
              order: [
                  [
                      HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                      sorting,
                  ],
              ],
          }
        : {}),
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED,
})

export const messagesReceivedTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins> => ({
    ...messagesReceivedQueryFactory(filters, timezone),
    timeDimensions: [
        {
            dimension:
                HelpdeskCustomerMessagesReceivedEnrichedMember.SentDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED_TIME_SERIES,
})

export const messagesReceivedMetricPerAgentQueryFactory =
    perDimensionQueryFactory(
        messagesReceivedQueryFactory,
        TicketDimension.AssigneeUserId,
    )

export const messagesReceivedMetricPerChannelQueryFactory =
    perDimensionQueryFactory(messagesReceivedQueryFactory, CHANNEL_DIMENSION)

export const messagesReceivedMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins> => {
    const baseQuery = messagesReceivedQueryFactory(filters, timezone)

    return {
        ...baseQuery,
        measures: [
            HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
        ],
        dimensions: [TicketDimension.TicketId, ...baseQuery.dimensions],
        filters: [...baseQuery.filters, TicketDrillDownFilter],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [
                      [
                          HelpdeskCustomerMessagesReceivedEnrichedMeasure.MessageCount,
                          sorting,
                      ],
                  ],
              }
            : {}),
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_MESSAGES_RECEIVED_PER_TICKET_DRILL_DOWN,
    }
}
