import { useMemo } from 'react'

import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { gmvQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { calculateRate } from 'pages/stats/aiSalesAgent/metrics/utils'
import { getPreviousPeriod } from 'utils/reporting'

import {
    fetchGmvInfluencedTrend,
    useGmvInfluencedTrend,
} from './useGmvInfluencedTrend'

const useGmvInfluencedRateTrend = (filters: StatsFilters, timezone: string) => {
    const gmvInfluencedData = useGmvInfluencedTrend(filters, timezone)
    const gmvData = useMetricTrend(
        gmvQueryFactory(filters, timezone),
        gmvQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    const isFetching = gmvInfluencedData.isFetching || gmvData.isFetching
    const isError = gmvInfluencedData.isError || gmvData.isError

    const data = useMemo(() => {
        if (!gmvInfluencedData.data || !gmvData.data || isFetching || isError) {
            return undefined
        }

        const value = calculateRate(
            gmvInfluencedData.data.value,
            gmvData.data.value,
        )

        const prevValue = calculateRate(
            gmvInfluencedData.data.prevValue,
            gmvData.data.prevValue,
        )

        return { value, prevValue }
    }, [gmvInfluencedData, gmvData, isFetching, isError])

    return {
        data: data,
        isFetching,
        isError,
    }
}

const fetchGmvInfluencedRateTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return Promise.all([
        fetchMetricTrend(
            gmvQueryFactory(filters, timezone),
            gmvQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            ),
        ),
        fetchGmvInfluencedTrend(filters, timezone),
    ])
        .then(([gmvData, gmvInfluencedData]) => {
            const value = calculateRate(
                gmvInfluencedData.data?.value,
                gmvData.data?.value,
            )

            const prevValue = calculateRate(
                gmvInfluencedData.data?.prevValue,
                gmvData.data?.prevValue,
            )

            return {
                isFetching: false,
                isError: false,
                data: { value, prevValue },
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useGmvInfluencedRateTrend, fetchGmvInfluencedRateTrend }
