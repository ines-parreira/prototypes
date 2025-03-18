import { useMemo } from 'react'

import {
    fetchMultipleMetricsTrends,
    useMultipleMetricsTrends,
} from 'hooks/reporting/useMultipleMetricsTrend'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { averageOrderValueQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'utils/reporting'

const useAverageOrderValueTrend = (filters: StatsFilters, timezone: string) => {
    const trendData = useMultipleMetricsTrends(
        averageOrderValueQueryFactory(filters, timezone),
        averageOrderValueQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )

    const data = useMemo(() => {
        if (!trendData.data || trendData.isFetching || trendData.isError) {
            return undefined
        }

        const value = safeDivide(
            trendData.data?.[AiSalesAgentOrdersMeasure.GmvUsd]?.value,
            trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.value,
        )
        const prevValue = safeDivide(
            trendData.data?.[AiSalesAgentOrdersMeasure.GmvUsd]?.prevValue,
            trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.prevValue,
        )

        return { value, prevValue }
    }, [trendData])

    return {
        data: data,
        isFetching: trendData.isFetching,
        isError: trendData.isError,
    }
}

const fetchAverageOrderValueTrend = (
    filters: StatsFilters,
    timezone: string,
) => {
    return fetchMultipleMetricsTrends(
        averageOrderValueQueryFactory(filters, timezone),
        averageOrderValueQueryFactory(
            {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        ),
    )
        .then((trendData) => {
            const value = safeDivide(
                trendData.data?.[AiSalesAgentOrdersMeasure.GmvUsd]?.value,
                trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.value,
            )

            const prevValue = safeDivide(
                trendData.data?.[AiSalesAgentOrdersMeasure.GmvUsd]?.prevValue,
                trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.prevValue,
            )

            return {
                isFetching: false,
                isError: false,
                data: {
                    value: value,
                    prevValue: prevValue,
                },
            }
        })
        .catch(() => ({
            isFetching: false,
            isError: true,
            data: undefined,
        }))
}

export { useAverageOrderValueTrend, fetchAverageOrderValueTrend }
