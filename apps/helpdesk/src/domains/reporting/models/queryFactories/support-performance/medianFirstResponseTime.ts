import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { TicketCubeWithJoins } from 'domains/reporting/models/cubes/TicketCube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import {
    TicketsFirstAgentResponseTimeDimension,
    TicketsFirstAgentResponseTimeMeasure,
} from 'domains/reporting/models/cubes/TicketsFirstAgentResponseTimeCube'
import { CHANNEL_DIMENSION } from 'domains/reporting/models/queryFactories/support-performance/constants'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingQuery } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketsFirstAgentResponseTimeMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

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
