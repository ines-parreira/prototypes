import { useMemo } from 'react'

import useMetricTrend, {
    fetchMetricTrend,
} from 'hooks/reporting/useMetricTrend'
import { totalProductBoughtQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'utils/reporting'

import {
    fetchTotalProductRecommendations,
    useTotalProductRecommendations,
} from './useTotalProductRecommendations'

const useProductBuyRate = (filters: StatsFilters, timezone: string) => {
    const productBoughtData = useMetricTrend(
        totalProductBoughtQueryFactory(filters, timezone),
        totalProductBoughtQueryFactory(
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
        productBoughtData.isFetching || totalRecommendationsData.isFetching
    const isError =
        productBoughtData.isError || totalRecommendationsData.isError

    const data = useMemo(() => {
        if (
            !productBoughtData.data ||
            !totalRecommendationsData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        const value = safeDivide(
            productBoughtData.data.value,
            totalRecommendationsData.data.value,
        )

        const prevValue = safeDivide(
            productBoughtData.data.prevValue,
            totalRecommendationsData.data.prevValue,
        )

        return { value, prevValue }
    }, [productBoughtData, totalRecommendationsData, isFetching, isError])

    return {
        data: data,
        isFetching,
        isError,
    }
}

const fetchProductBuyRate = (filters: StatsFilters, timezone: string) => {
    return Promise.all([
        fetchTotalProductRecommendations(filters, timezone),
        fetchMetricTrend(
            totalProductBoughtQueryFactory(filters, timezone),
            totalProductBoughtQueryFactory(
                {
                    ...filters,
                    period: getPreviousPeriod(filters.period),
                },
                timezone,
            ),
        ),
    ])
        .then(([totalRecommendationsData, productBoughtData]) => {
            return {
                isFetching: false,
                isError: false,
                data: {
                    value: safeDivide(
                        productBoughtData.data?.value,
                        totalRecommendationsData.data?.value,
                    ),
                    prevValue: safeDivide(
                        productBoughtData.data?.prevValue,
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

export { useProductBuyRate, fetchProductBuyRate }
