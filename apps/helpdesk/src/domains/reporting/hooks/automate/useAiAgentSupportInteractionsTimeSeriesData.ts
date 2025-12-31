import { useMemo } from 'react'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    fetchTimeSeries,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import {
    AIAgentInteractionsBySkillDatasetDimension,
    AIAgentSkills,
} from 'domains/reporting/models/cubes/automate_v2/AIAgentIntercationsBySkillDatasetCube'
import { AIAgentInteractionsBySkillTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/automate_v2/timeseries'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'
import { ReportingFilterOperator } from 'domains/reporting/models/types'

const aiAgentSupportInteractionsTimeSeriesQueryFactory = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const baseQuery = AIAgentInteractionsBySkillTimeSeriesQueryFactory(
        filters,
        timezone,
        granularity,
    )

    return {
        ...baseQuery,
        filters: [
            ...baseQuery.filters,
            {
                member: AIAgentInteractionsBySkillDatasetDimension.BillableType,
                operator: ReportingFilterOperator.Equals,
                values: [AIAgentSkills.AIAgentSupport],
            },
        ],
    }
}

export const useAiAgentSupportInteractionsTimeSeriesData = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
) => {
    const timeSeriesData = useTimeSeries(
        aiAgentSupportInteractionsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
    )

    return useMemo(
        () => ({
            data: timeSeriesData.data,
            isFetching: timeSeriesData.isFetching,
            isError: timeSeriesData.isError,
        }),
        [
            timeSeriesData.data,
            timeSeriesData.isFetching,
            timeSeriesData.isError,
        ],
    )
}

export const fetchAiAgentSupportInteractionsTimeSeriesData = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): Promise<TimeSeriesDataItem[][]> => {
    return fetchTimeSeries(
        aiAgentSupportInteractionsTimeSeriesQueryFactory(
            filters,
            timezone,
            granularity,
        ),
    )
}
