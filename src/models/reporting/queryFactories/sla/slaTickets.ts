import {OrderDirection} from 'models/api/types'
import {
    TicketSLACubeWithJoins,
    TicketSLADimension,
    TicketSLAMeasure,
} from 'models/reporting/cubes/sla/TicketSLACube'
import {
    ReportingGranularity,
    ReportingQuery,
    TimeSeriesQuery,
} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'
import {
    getFilterDateRange,
    NotSpamNorTrashedTicketsFilter,
    statsFiltersToReportingFilters,
    TicketStatsFiltersMembers,
} from 'utils/reporting'

export const slaTicketsQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    sorting?: OrderDirection
): ReportingQuery<TicketSLACubeWithJoins> => ({
    measures: [TicketSLAMeasure.TicketCount],
    dimensions: [TicketSLADimension.SlaStatus],
    timezone,
    segments: [],
    filters: [
        ...NotSpamNorTrashedTicketsFilter,
        ...statsFiltersToReportingFilters(TicketStatsFiltersMembers, filters),
    ],
    ...(sorting
        ? {
              order: [[TicketSLAMeasure.TicketCount, sorting]],
          }
        : {}),
})

export const slaTicketsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
    sorting?: OrderDirection
): TimeSeriesQuery<TicketSLACubeWithJoins> => ({
    ...slaTicketsQueryFactory(filters, timezone, sorting),
    timeDimensions: [
        {
            dimension: TicketSLADimension.SlaAnchorDatetime,
            granularity,
            dateRange: getFilterDateRange(filters),
        },
    ],
    timezone,
})
