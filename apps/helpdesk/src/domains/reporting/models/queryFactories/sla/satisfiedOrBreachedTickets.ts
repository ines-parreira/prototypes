import { METRIC_NAMES } from 'domains/reporting/hooks/metricNames'
import type { TicketSLACubeWithJoins } from 'domains/reporting/models/cubes/sla/TicketSLACube'
import {
    TicketSLADimension,
    TicketSLAMeasure,
    TicketSLAMember,
    TicketSLASegment,
    TicketSLAStatus,
} from 'domains/reporting/models/cubes/sla/TicketSLACube'
import { TicketDimension } from 'domains/reporting/models/cubes/TicketCube'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type {
    ReportingQuery,
    TimeSeriesQuery,
} from 'domains/reporting/models/types'
import {
    ReportingFilterOperator,
    ReportingGranularity,
} from 'domains/reporting/models/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketSLAStatsFiltersMembers,
} from 'domains/reporting/utils/reporting'
import type { OrderDirection } from 'models/api/types'

export const satisfiedOrBreachedTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketSLACubeWithJoins> => ({
    measures: [TicketSLAMeasure.TicketCount],
    dimensions: [TicketSLADimension.SlaStatus],
    segments: [
        TicketSLASegment.TicketsWithSlaAnchorDatetimeDuringSelectedPeriod,
    ],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(
            TicketSLAStatsFiltersMembers,
            filters,
        ),
    ],
    timezone,
    ...(sorting
        ? {
              order: [[TicketSLAMeasure.TicketCount, sorting]],
          }
        : {}),
    metricName: METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_TICKETS,
})

export const satisfiedOrBreachedTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<TicketSLACubeWithJoins> => ({
    ...satisfiedOrBreachedTicketsQueryFactory(filters, timezone),
    metricName: METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_TICKETS_TIME_SERIES,
    filters: [
        ...satisfiedOrBreachedTicketsQueryFactory(filters, timezone).filters,
        {
            member: TicketSLAMember.SlaStatus,
            operator: ReportingFilterOperator.Equals,
            values: [TicketSLAStatus.Satisfied, TicketSLAStatus.Breached],
        },
    ],
    timeDimensions: [
        {
            dimension: TicketSLADimension.SlaAnchorDatetime,
            granularity: granularity,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
})

export const satisfiedOrBreachedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketSLACubeWithJoins> => ({
    ...satisfiedOrBreachedTicketsQueryFactory(filters, timezone, sorting),
    metricName:
        METRIC_NAMES.SLA_SATISFIED_OR_BREACHED_TICKETS_PER_TICKET_DRILL_DOWN,
    dimensions: [
        TicketDimension.TicketId,
        TicketSLADimension.TicketId,
        TicketSLADimension.SlaStatus,
        TicketSLADimension.SlaPolicyMetricName,
        TicketSLADimension.SlaPolicyMetricStatus,
        TicketSLADimension.SlaDelta,
    ],
    timeDimensions: [
        {
            dimension: TicketSLADimension.SlaAnchorDatetime,
            granularity: ReportingGranularity.Day,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    filters: [
        ...satisfiedOrBreachedTicketsQueryFactory(filters, timezone, sorting)
            .filters,
        {
            member: TicketSLADimension.SlaStatus,
            operator: ReportingFilterOperator.Equals,
            values: [TicketSLAStatus.Satisfied, TicketSLAStatus.Breached],
        },
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})

export const breachedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection,
): ReportingQuery<TicketSLACubeWithJoins> => ({
    ...satisfiedOrBreachedTicketsQueryFactory(filters, timezone, sorting),
    metricName: METRIC_NAMES.SLA_BREACHED_TICKETS_PER_TICKET_DRILL_DOWN,
    dimensions: [
        TicketDimension.TicketId,
        TicketSLADimension.TicketId,
        TicketSLADimension.SlaStatus,
        TicketSLADimension.SlaPolicyMetricName,
        TicketSLADimension.SlaPolicyMetricStatus,
        TicketSLADimension.SlaDelta,
    ],
    timeDimensions: [
        {
            dimension: TicketSLADimension.SlaAnchorDatetime,
            granularity: ReportingGranularity.Day,
            dateRange: getFilterDateRange(filters.period),
        },
    ],
    filters: [
        ...satisfiedOrBreachedTicketsQueryFactory(filters, timezone, sorting)
            .filters,
        {
            member: TicketSLADimension.SlaStatus,
            operator: ReportingFilterOperator.Equals,
            values: [TicketSLAStatus.Breached],
        },
    ],
    limit: DRILLDOWN_QUERY_LIMIT,
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
