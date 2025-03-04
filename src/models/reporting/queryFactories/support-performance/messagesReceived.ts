import { OrderDirection } from 'models/api/types'
import {
    HelpdeskCustomerMessagesReceivedEnrichedCubeWithJoins,
    HelpdeskCustomerMessagesReceivedEnrichedMeasure,
    HelpdeskCustomerMessagesReceivedEnrichedMember,
} from 'models/reporting/cubes/HelpdeskCustomerMessagesReceivedEnrichedCube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'models/reporting/queryFactories/support-performance/constants'
import {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    HelpdeskCustomerMessagesReceivedStatsFiltersMembers,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    statsFiltersToReportingFilters,
    TicketDrillDownFilter,
} from 'utils/reporting'

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
    }
}
