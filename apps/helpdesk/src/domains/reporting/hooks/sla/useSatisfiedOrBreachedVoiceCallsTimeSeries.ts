import {
    fetchStatsTimeSeriesPerDimension,
    useStatsTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useStatsTimeSeries'
import { satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory } from 'domains/reporting/models/scopes/voiceSLA'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

export const useSatisfiedOrBreachedVoiceCallsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) =>
    useStatsTimeSeriesPerDimension(
        satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory({
            filters,
            timezone,
            granularity,
        }),
    )

export const fetchSatisfiedOrBreachedVoiceCallsTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) =>
    fetchStatsTimeSeriesPerDimension(
        satisfiedOrBreachedVoiceCallsTimeseriesQueryV2Factory({
            filters,
            timezone,
            granularity,
        }),
    )
