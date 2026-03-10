import { TicketMessageSourceType } from 'business/types/ticket'
import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { HelpdeskMessageCubeWithJoins } from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    HelpdeskMessageDimension,
    HelpdeskMessageMeasure,
    HelpdeskMessageMember,
} from 'domains/reporting/models/cubes/HelpdeskMessageCube'
import {
    TicketDimension,
    TicketMember,
} from 'domains/reporting/models/cubes/TicketCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import {
    hasFilter,
    isFilterWithLogicalOperator,
} from 'domains/reporting/models/queryFactories/utils'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import { LogicalOperatorEnum } from 'domains/reporting/pages/common/components/Filter/constants'
import {
    DRILLDOWN_QUERY_LIMIT,
    formatReportingQueryDate,
    getFilterDateRange,
    HelpdeskTicketsRepliedStatsFiltersMembers,
    NotSpamNorTrashedTicketsFilter,
    perDimensionQueryFactory,
    PublicAndMessageViaFilter,
    statsFiltersToReportingFilters,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const ticketsRepliedQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const channelsFilter =
        isFilterWithLogicalOperator(filters.channels) &&
        filters.channels.operator === LogicalOperatorEnum.NOT_ONE_OF
            ? {
                  ...filters.channels,
                  values: [
                      ...filters.channels.values,
                      TicketMessageSourceType.InternalNote,
                  ],
              }
            : filters.channels

    return {
        measures: [HelpdeskMessageMeasure.TicketCount],
        dimensions: [],
        timezone,
        filters: [
            ...NotSpamNorTrashedTicketsFilter,
            {
                member: HelpdeskMessageMember.SentDatetime,
                operator: ReportingFilterOperator.InDateRange,
                values: getFilterDateRange(filters.period),
            },
            {
                member: TicketMember.PeriodStart,
                operator: ReportingFilterOperator.AfterDate,
                values: [
                    formatReportingQueryDate(filters.period.start_datetime),
                ],
            },
            {
                member: TicketMember.PeriodEnd,
                operator: ReportingFilterOperator.BeforeDate,
                values: [formatReportingQueryDate(filters.period.end_datetime)],
            },
            ...(!hasFilter(filters.channels)
                ? [
                      {
                          member: TicketMember.Channel,
                          operator: ReportingFilterOperator.NotEquals,
                          values: [TicketMessageSourceType.InternalNote],
                      },
                  ]
                : []),
            ...PublicAndMessageViaFilter,
            ...statsFiltersToReportingFilters(
                HelpdeskTicketsRepliedStatsFiltersMembers,
                { ...filters, channels: channelsFilter },
            ),
        ],
        ...(sorting
            ? {
                  order: [[HelpdeskMessageMeasure.TicketCount, sorting]],
              }
            : {}),
        metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED,
    }
}

export const ticketsRepliedTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection,
): TimeSeriesQuery<HelpdeskMessageCubeWithJoins> => ({
    ...ticketsRepliedQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_TIME_SERIES,
    timeDimensions: [
        {
            dimension: HelpdeskMessageDimension.SentDatetime,
            granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const ticketsRepliedMetricPerAgentQueryFactory =
    perDimensionQueryFactory(
        ticketsRepliedQueryFactory,
        TicketDimension.MessageSenderId,
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_AGENT,
    )

export const ticketsRepliedMetricPerChannelQueryFactory =
    perDimensionQueryFactory(
        ticketsRepliedQueryFactory,
        CHANNEL_DIMENSION,
        METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_CHANNEL,
    )

export const ticketsRepliedMetricPerTicketDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<HelpdeskMessageCubeWithJoins> => {
    const baseQuery = ticketsRepliedQueryFactory(filters, timezone, sorting)
    return {
        ...baseQuery,
        metricName:
            METRIC_NAMES.SUPPORT_PERFORMANCE_TICKETS_REPLIED_PER_TICKET_DRILL_DOWN,
        measures: [],
        dimensions: [
            TicketDimension.TicketId,
            TicketDimension.CreatedDatetime,
            ...baseQuery.dimensions,
        ],
        limit: DRILLDOWN_QUERY_LIMIT,
        ...(sorting
            ? {
                  order: [[TicketDimension.CreatedDatetime, sorting]],
              }
            : {}),
    }
}
