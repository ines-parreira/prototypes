import { useMemo } from 'react'

import { UseQueryResult } from '@tanstack/react-query'

import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'hooks/reporting/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { gmvUsdTimeSeriesQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/timeseries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { getStatsByMeasure } from 'pages/stats/automate/aiSalesAgent/metrics/utils'

const useGmvUsdOverTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): UseQueryResult<TimeSeriesDataItem[][]> => {
    const gmvTimeSeries = useTimeSeries(
        gmvUsdTimeSeriesQueryFactory(filters, timezone, granularity),
    )

    const gmvTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentOrdersMeasure.GmvUsd,
                gmvTimeSeries.data,
            ),
        [gmvTimeSeries.data],
    )

    const isError: boolean = gmvTimeSeries.isError
    const isLoading: boolean = gmvTimeSeries.isLoading

    return useMemo(
        () =>
            ({
                data: [gmvTimeSeriesData],
                isLoading,
                isError,
            }) as UseQueryResult<TimeSeriesDataItem[][]>,
        [gmvTimeSeriesData, isError, isLoading],
    )
}

export { useGmvUsdOverTimeSeries }
