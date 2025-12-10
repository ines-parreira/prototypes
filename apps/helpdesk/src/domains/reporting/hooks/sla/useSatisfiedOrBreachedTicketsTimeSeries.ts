import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import { satisfiedOrBreachedTicketsTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/sla/satisfiedOrBreachedTickets'
import { satisfiedOrBreachedTicketsTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/ticketSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

// P2/P3
export const useSatisfiedOrBreachedTicketsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) =>
    useTimeSeriesPerDimension(
        satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
        satisfiedOrBreachedTicketsTimeseriesQueryV2Factory({
            filters,
            timezone,
            granularity,
        }),
    )

export const fetchSatisfiedOrBreachedTicketsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) =>
    fetchTimeSeriesPerDimension(
        satisfiedOrBreachedTicketsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
        satisfiedOrBreachedTicketsTimeseriesQueryV2Factory({
            filters,
            timezone,
            granularity,
        }),
    )
