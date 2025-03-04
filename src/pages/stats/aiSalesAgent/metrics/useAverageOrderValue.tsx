import { useMemo } from 'react'

import {
    fetchMultipleMetricsTrends,
    useMultipleMetricsTrends,
} from 'hooks/reporting/useMultipleMetricsTrend'
import { AiSalesAgentOrdersMeasure } from 'models/reporting/cubes/ai-sales-agent/AiSalesAgentOrders'
import { averageOrderValueQueryFactory } from 'models/reporting/queryFactories/ai-sales-agent/metrics'
import { StatsFilters } from 'models/stat/types'
import { getPreviousPeriod } from 'utils/reporting'

const useAverageOrderValue = (filters: StatsFilters, timezone: string) => {
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

        const value =
            (trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.value || 0) /
                (trendData.data[AiSalesAgentOrdersMeasure.Count]?.value || 0) ||
            0

        const prevValue =
            (trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.prevValue || 0) /
                (trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.prevValue ||
                    0) || 0

        return { value, prevValue }
    }, [trendData])

    return {
        data: data,
        isFetching: trendData.isFetching,
        isError: trendData.isFetching,
    }
}

const fetchAverageOrderValue = (filters: StatsFilters, timezone: string) => {
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
            const value =
                (trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.value || 0) /
                    (trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.value ||
                        0) || 0

            const prevValue =
                (trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.prevValue ||
                    0) /
                    (trendData.data?.[AiSalesAgentOrdersMeasure.Count]
                        ?.prevValue || 0) || 0

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

export { useAverageOrderValue, fetchAverageOrderValue }
