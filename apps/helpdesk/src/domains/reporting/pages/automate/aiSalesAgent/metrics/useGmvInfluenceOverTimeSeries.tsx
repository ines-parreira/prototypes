import { useMemo } from 'react'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import {
    fetchTimeSeries,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { influencedGmvTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/timeseries'
import { AISalesAgentInfluencedUsdTimeSeriesQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

const useGmvInfluenceOverTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): {
    data: TimeSeriesDataItem[][]
    isError: boolean
    isFetching: boolean
} => {
    const {
        data: influencedGmvTimeSeriesData,
        isFetching,
        isError,
    } = useTimeSeries(
        influencedGmvTimeSeriesQueryFactory(filters, timezone, granularity),
        AISalesAgentInfluencedUsdTimeSeriesQueryFactoryV2({
            filters,
            timezone,
            granularity,
        }),
    )

    return useMemo(
        () => ({
            data: influencedGmvTimeSeriesData,
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
    const influencedGmvTimeSeriesData = await fetchTimeSeries(
        influencedGmvTimeSeriesQueryFactory(filters, timezone, granularity),
        AISalesAgentInfluencedUsdTimeSeriesQueryFactoryV2({
            filters,
            timezone,
            granularity,
        }),
    )

    return influencedGmvTimeSeriesData
}

export { useGmvInfluenceOverTimeSeries, fetchGmvInflueceOverTimeSeries }
