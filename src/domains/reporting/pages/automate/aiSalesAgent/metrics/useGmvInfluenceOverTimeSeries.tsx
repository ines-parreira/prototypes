import { useMemo } from 'react'

import {
    fetchTimeSeries,
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { influencedGmvTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/timeseries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'

const useGmvInfluenceOverTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): {
    data: TimeSeriesDataItem[][]
    isError: boolean
    isFetching: boolean
} => {
    const influencedGmvTimeSeries = useTimeSeries(
        influencedGmvTimeSeriesQueryFactory(filters, timezone, granularity),
    )

    const influencedGmvTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentOrdersMeasure.Gmv,
                influencedGmvTimeSeries.data,
            ),
        [influencedGmvTimeSeries.data],
    )

    const isFetching: boolean = influencedGmvTimeSeries.isFetching
    const isError: boolean = influencedGmvTimeSeries.isError

    return useMemo(
        () => ({
            data: [influencedGmvTimeSeriesData],
            isFetching,
            isError,
        }),
        [influencedGmvTimeSeriesData, isError, isFetching],
    )
}

const fetchGmvInflueceOverTimeSeries = async (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): Promise<TimeSeriesDataItem[][]> => {
    const influencedGmvTimeSeries = await fetchTimeSeries(
        influencedGmvTimeSeriesQueryFactory(filters, timezone, granularity),
    )
    const influencedGmvTimeSeriesData = getStatsByMeasure(
        AiSalesAgentOrdersMeasure.Gmv,
        influencedGmvTimeSeries,
    )
    return [influencedGmvTimeSeriesData]
}

export { useGmvInfluenceOverTimeSeries, fetchGmvInflueceOverTimeSeries }
