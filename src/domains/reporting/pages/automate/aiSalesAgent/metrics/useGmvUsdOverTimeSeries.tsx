import { useMemo } from 'react'

import { UseQueryResult } from '@tanstack/react-query'

import {
    TimeSeriesDataItem,
    useTimeSeries,
} from 'domains/reporting/hooks/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { gmvUsdTimeSeriesQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/timeseries'
import { StatsFilters } from 'domains/reporting/models/stat/types'
import { ReportingGranularity } from 'domains/reporting/models/types'
import { getStatsByMeasure } from 'domains/reporting/pages/automate/aiSalesAgent/metrics/utils'

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
