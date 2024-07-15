import {OrderDirection} from 'models/api/types'
import {
    TicketSLACubeWithJoins,
    TicketSLADimension,
    TicketSLAMember,
    TicketSLASegment,
    TicketSLAStatus,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {TicketDimension} from 'models/reporting/cubes/TicketCube'
import {slaTicketsQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {
    ReportingFilterOperator,
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {getFilterDateRange} from 'utils/reporting'

export const satisfiedOrBreachedTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketSLACubeWithJoins> => ({
    ...slaTicketsQueryFactory(filters, timezone, sorting),
    segments: [
        TicketSLASegment.TicketsWithSlaAnchorDatetimeDuringSelectedPeriod,
    ],
    filters: [...slaTicketsQueryFactory(filters, timezone, sorting).filters],
})

export const satisfiedOrBreachedTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<TicketSLACubeWithJoins> => ({
    ...slaTicketsQueryFactory(filters, timezone),
    filters: [
        ...slaTicketsQueryFactory(filters, timezone).filters,
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
            dateRange: getFilterDateRange(filters),
        },
    ],
})

export const satisfiedOrBreachedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
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
            dateRange: getFilterDateRange(filters),
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
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})

export const breachedTicketsDrillDownQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
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
            dateRange: getFilterDateRange(filters),
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
    ...(sorting
        ? {
              order: [[TicketDimension.CreatedDatetime, sorting]],
          }
        : {}),
})
