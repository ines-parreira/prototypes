import { useMemo } from 'react'

import { UseQueryResult } from '@tanstack/react-query'

import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { gmvUsdTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/timeseries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'

const useGmvUsdOverTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): UseQueryResult<TimeSeriesDataItem[][]> => {
    const {
        data: gmvTimeSeriesData,
        isFetching,
        isError,
    } = useTimeSeries(
        gmvUsdTimeSeriesQueryFactory(filters, timezone, granularity),
    )

    return useMemo(
        () =>
            ({
                data: gmvTimeSeriesData,
                isLoading: isFetching,
                isError,
            }) as UseQueryResult<TimeSeriesDataItem[][]>,
        [gmvTimeSeriesData, isError, isFetching],
    )
}

export { useGmvUsdOverTimeSeries }
