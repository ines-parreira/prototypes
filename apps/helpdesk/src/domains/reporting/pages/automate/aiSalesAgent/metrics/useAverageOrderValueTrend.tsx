import { useMemo } from 'react'

import {
    fetchMultipleMetricsTrends,
    useMultipleMetricsTrends,
} from 'domains/reporting/hooks/useMultipleMetricsTrend'
import {
    AiSalesAgentOrdersDimension,
    AiSalesAgentOrdersMeasure,
} from 'domains/reporting/models/cubes/ai-sales-agent/AiSalesAgentOrders'
import { averageOrderValueQueryFactory } from 'domains/reporting/models/queryFactories/ai-sales-agent/metrics'
import { AISalesAgentAverageOrderValueQueryFactoryV2 } from 'domains/reporting/models/scopes/AISalesAgentOrders'
import type { StatsFilters } from 'domains/reporting/models/stat/types'
import safeDivide from 'domains/reporting/pages/automate/aiSalesAgent/util/safeDivide'
import { getPreviousPeriod } from 'domains/reporting/utils/reporting'

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
        AISalesAgentAverageOrderValueQueryFactoryV2({ filters, timezone }),
        AISalesAgentAverageOrderValueQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )

    const data = useMemo(() => {
        if (!trendData.data || trendData.isFetching || trendData.isError) {
            return undefined
        }

        const value = safeDivide(
            trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.value,
            trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.value,
        )
        const prevValue = safeDivide(
            trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.prevValue,
            trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.prevValue,
        )
        const currency =
            trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.rawData?.[
                AiSalesAgentOrdersDimension.Currency
            ]

        return { value, prevValue, currency }
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
        AISalesAgentAverageOrderValueQueryFactoryV2({ filters, timezone }),
        AISalesAgentAverageOrderValueQueryFactoryV2({
            filters: {
                ...filters,
                period: getPreviousPeriod(filters.period),
            },
            timezone,
        }),
    )
        .then((trendData) => {
            const value = safeDivide(
                trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.value,
                trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.value,
            )

            const prevValue = safeDivide(
                trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.prevValue,
                trendData.data?.[AiSalesAgentOrdersMeasure.Count]?.prevValue,
            )

            const currency =
                trendData.data?.[AiSalesAgentOrdersMeasure.Gmv]?.rawData?.[
                    AiSalesAgentOrdersDimension.Currency
                ]

            return {
                isFetching: false,
                isError: false,
                data: {
                    value: value,
                    prevValue: prevValue,
                    currency: currency,
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
