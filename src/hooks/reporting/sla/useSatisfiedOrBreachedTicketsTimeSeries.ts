import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import {satisfiedOrBreachedTicketsTimeSeriesQueryFactory} from 'models/reporting/queryFactories/sla/satisfiedOrBreachedTickets'
import {ReportingGranularity} from 'models/reporting/types'
import {StatsFilters} from 'models/stat/types'

export const useSatisfiedOrBreachedTicketsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) =>
    useTimeSeriesPerDimension(
        satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity
        )
    )

export const fetchSatisfiedOrBreachedTicketsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity
) =>
    fetchTimeSeriesPerDimension(
        satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity
        )
    )
