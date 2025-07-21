import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'domains/reporting/hooks/useTimeSeries'
import { AIAgentInteractionsBySkillTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/timeseries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

export const useAIAgentInteractionsBySkillTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    return useTimeSeriesPerDimension(
        AIAgentInteractionsBySkillTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
    )
}

export const fetchAIAgentInteractionsDatasetBySkillTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    return fetchTimeSeriesPerDimension(
        AIAgentInteractionsBySkillTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
    )
}
