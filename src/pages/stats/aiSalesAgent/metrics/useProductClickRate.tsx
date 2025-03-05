import { useMemo } from 'react'

import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { productClicksQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'utils/reporting'

import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from './useTotalProductRecommendations'

const useProductClickRate = (filters: StatsFilters, timezone: string) => {
    const clickTrendData = useMetricTrend(
        productClicksQueryFactory(filters, timezone),
        productClicksQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    const totalRecommendationsData = useTotalProductRecommendations(
        filters,
        timezone,
    )

    const isFetching =
        clickTrendData.isFetching || totalRecommendationsData.isFetching
    const isError = clickTrendData.isError || totalRecommendationsData.isError

    const data = useMemo(() => {
        if (
            !clickTrendData.data ||
            !totalRecommendationsData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        const value = safeDivide(
            clickTrendData.data.value,
            totalRecommendationsData.data.value,
        )

        const prevValue = safeDivide(
            clickTrendData.data.prevValue,
            totalRecommendationsData.data.prevValue,
        )

        return { value, prevValue }
    }, [clickTrendData, totalRecommendationsData, isFetching, isError])

    return {
        data: data,
        isFetching,
        isError,
    }
}

const fetchProductClickRate = (filters: StatsFilters, timezone: string) => {
    return Promise.all([
        fetchTotalProductRecommendations(filters, timezone),
        fetchMetricTrend(
            productClicksQueryFactory(filters, timezone),
            productClicksQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            ),
        ),
    ])
        .then(([totalRecommendationsData, clickTrendData]) => {
            return {
                isFetching: false,
                isError: false,
                data: {
                    value: safeDivide(
                        clickTrendData.data?.value,
                        totalRecommendationsData.data?.value,
                    ),
                    prevValue: safeDivide(
                        clickTrendData.data?.prevValue,
                        totalRecommendationsData.data?.prevValue,
                    ),
                },
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useProductClickRate, fetchProductClickRate }
