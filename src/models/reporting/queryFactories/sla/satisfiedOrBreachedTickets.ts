import { OrderDirection } from 'models/api/types'
import {
    TicketSLACubeWithJoins,
    TicketSLADimension,
    TicketSLAMeasure,
    TicketSLAMember,
    TicketSLASegment,
    TicketSLAStatus,
} from 'models/reporting/cubes/sla/TicketSLACube'
import { TicketDimension } from 'models/reporting/cubes/TicketCube'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import {
    DRILLDOWN_QUERY_LIMIT,
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketSLAStatsFiltersMembers,
} from 'utils/reporting'

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
})

export const satisfiedOrBreachedTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): TimeSeriesQuery<TicketSLACubeWithJoins> => ({
    ...satisfiedOrBreachedTicketsQueryFactory(filters, timezone),
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
