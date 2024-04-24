import {OrderDirection} from 'models/api/types'
import {
    TicketSLACubeWithJoins,
    TicketSLADimension,
    TicketSLASegment,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {slaTicketsQueryFactory} from 'models/reporting/queryFactories/sla/slaTickets'
import {
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
    segments: [TicketSLASegment.SatisfiedOrBreachedTickets],
})

export const satisfiedOrBreachedTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
): TimeSeriesQuery<TicketSLACubeWithJoins> => ({
    ...slaTicketsQueryFactory(filters, timezone),
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
})
