import { useMemo } from 'react'

import {
    fetchTimeSeries,
    TimeSeriesDataItem,
    useTimeSeries,
} from 'hooks/reporting/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { influencedGmvTimeSeriesQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/timeseries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { getStatsByMeasure } from 'pages/stats/automate/aiSalesAgent/metrics/utils'

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
