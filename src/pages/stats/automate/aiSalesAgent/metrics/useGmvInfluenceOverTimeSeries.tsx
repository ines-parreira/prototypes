import { useMemo } from 'react'

import { UseQueryResult } from '@tanstack/react-query'

import {
    fetchTimeSeries,
    TimeSeriesDataItem,
    useTimeSeries,
} from 'hooks/reporting/useTimeSeries'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import {
    gmvTimeSeriesQueryFactory,
    influencedGmvTimeSeriesQueryFactory,
} from 'models/reporting/queryFactories/ai-sales-agent/timeseries'
import { ReportingGranularity } from 'models/reporting/types'
import { StatsFilters } from 'models/stat/types'
import { calculateRate } from 'pages/stats/automate/aiSalesAgent/metrics/utils'

import { GMV_OVERTIME_LABEL } from '../constants'

const calculateRates = (
    influencedGmvData: TimeSeriesDataItem[],
    gmvData: TimeSeriesDataItem[],
): TimeSeriesDataItem[] => {
    const rates: TimeSeriesDataItem[] = []

    influencedGmvData.forEach((timeSeries, index) => {
        const influencedGmv = influencedGmvData?.[index].value
        const gmv = gmvData?.[index].value
        const rate = calculateRate(influencedGmv, gmv)

        rates.push({
            dateTime: timeSeries.dateTime,
            value: rate,
            label: GMV_OVERTIME_LABEL,
        })
    })

    return rates
}

export const getStatsByMeasure = (
    measure: string,
    dataItems?: TimeSeriesDataItem[][],
): TimeSeriesDataItem[] =>
    dataItems?.find((arr) => arr.some((item) => item.label === measure)) || []

const useGmvInfluenceOverTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): UseQueryResult<TimeSeriesDataItem[][]> => {
    const influencedGmvTimeSeries = useTimeSeries(
        influencedGmvTimeSeriesQueryFactory(filters, timezone, granularity),
    )
    const gmvTimeSeries = useTimeSeries(
        gmvTimeSeriesQueryFactory(filters, timezone, granularity),
    )

    const influencedGmvTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentOrdersMeasure.Gmv,
                influencedGmvTimeSeries.data,
            ),
        [influencedGmvTimeSeries.data],
    )

    const gmvTimeSeriesData = useMemo(
        () =>
            getStatsByMeasure(
                AiSalesAgentOrdersMeasure.Gmv,
                gmvTimeSeries.data,
            ),
        [gmvTimeSeries.data],
    )

    const influencedGmvRates: TimeSeriesDataItem[] = useMemo(() => {
        if (influencedGmvTimeSeries.isFetched && gmvTimeSeries.isFetched) {
            return calculateRates(
                influencedGmvTimeSeriesData,
                gmvTimeSeriesData,
            )
        }
        return []
    }, [
        influencedGmvTimeSeries,
        gmvTimeSeries,
        influencedGmvTimeSeriesData,
        gmvTimeSeriesData,
    ])

    const isFetching: boolean =
        influencedGmvTimeSeries.isFetching || gmvTimeSeries.isFetching
    const isError: boolean =
        influencedGmvTimeSeries.isError || gmvTimeSeries.isError

    return useMemo(
        () =>
            ({
                data: [influencedGmvRates],
                isFetching,
                isError,
            }) as UseQueryResult<TimeSeriesDataItem[][]>,
        [influencedGmvRates, isError, isFetching],
    )
}

const fetchGmvInflueceOverTimeSeries = (
    filters: StatsFilters,
    timezone: string,
    granularity: ReportingGranularity,
): Promise<TimeSeriesDataItem[][]> => {
    return Promise.all([
        fetchTimeSeries(
            influencedGmvTimeSeriesQueryFactory(filters, timezone, granularity),
        ),
        fetchTimeSeries(
            gmvTimeSeriesQueryFactory(filters, timezone, granularity),
        ),
    ]).then(([influencedGmvTimeSeries, gmvTimeSeries]) => {
        const influencedGmvTimeSeriesData = getStatsByMeasure(
            AiSalesAgentOrdersMeasure.Gmv,
            influencedGmvTimeSeries,
        )
        const gmvTimeSeriesData = getStatsByMeasure(
            AiSalesAgentOrdersMeasure.Gmv,
            gmvTimeSeries,
        )
        const rates = calculateRates(
            influencedGmvTimeSeriesData,
            gmvTimeSeriesData,
        )
        return [rates]
    })
}

export { useGmvInfluenceOverTimeSeries, fetchGmvInflueceOverTimeSeries }
