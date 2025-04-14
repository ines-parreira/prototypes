import {
    fetchTimeSeriesPerDimension,
    useTimeSeriesPerDimension,
} from 'hooks/reporting/useTimeSeries'
import { AIAgentInteractionsBySkillTimeSeriesQueryFactory } from 'models/reporting/queryFactories/automate_v2/timeseries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'

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
