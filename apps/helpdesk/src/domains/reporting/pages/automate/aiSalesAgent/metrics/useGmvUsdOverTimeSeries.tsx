import { useMemo } from 'react'

import type { UseQueryResult } from '@tanstack/react-query'

import type { TimeSeriesDataItem } from 'domains/reporting/hooks/useTimeSeries'
import { useTimeSeries } from 'domains/reporting/hooks/useTimeSeries'
import { gmvUsdTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/timeseries'
import { AISalesAgentGMVUsdTimeSeriesQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import type { ReportingGranularity } from 'domains/reporting/models/types'

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
        AISalesAgentGMVUsdTimeSeriesQueryFactoryV2({
            filters,
            timezone,
            granularity,
        }),
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
