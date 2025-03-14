import { useMemo } from 'react'

import { StatsFilters } from 'models/stat/types'
import {
    fetchTotalNumberOfOrders,
    useTotalNumberOfOrders,
} from 'pages/stats/aiSalesAgent/metrics/useTotalNumberOfOrders'
import {
    fetchTotalSalesOpportunityAIConvTrend,
    useTotalSalesOpportunityAIConvTrend,
} from 'pages/stats/aiSalesAgent/metrics/useTotalSalesOpportunityAIConvTrend'
import safeDivide from 'pages/stats/aiSalesAgent/util/safeDivide'

const useConversionRate = (filters: StatsFilters, timezone: string) => {
    const totalSalesOportunityAIConvData = useTotalSalesOpportunityAIConvTrend(
        filters,
        timezone,
    )
    const totalNumberOfOrdersData = useTotalNumberOfOrders(filters, timezone)

    const isFetching =
        totalSalesOportunityAIConvData.isFetching ||
        totalNumberOfOrdersData.isFetching
    const isError =
        totalSalesOportunityAIConvData.isError ||
        totalNumberOfOrdersData.isError

    const data = useMemo(() => {
        if (
            !totalSalesOportunityAIConvData.data ||
            !totalNumberOfOrdersData.data ||
            isFetching ||
            isError
        ) {
            return undefined
        }

        const value = safeDivide(
            totalNumberOfOrdersData.data.value,
            totalSalesOportunityAIConvData.data.value,
        )

        const prevValue = safeDivide(
            totalNumberOfOrdersData.data.prevValue,
            totalSalesOportunityAIConvData.data.prevValue,
        )

        return { value, prevValue }
    }, [
        totalSalesOportunityAIConvData,
        totalNumberOfOrdersData,
        isError,
        isFetching,
    ])

    return {
        data,
        isFetching,
        isError,
    }
}

const fetchConversionRate = (filters: StatsFilters, timezone: string) => {
    return Promise.all([
        fetchTotalNumberOfOrders(filters, timezone),
        fetchTotalSalesOpportunityAIConvTrend(filters, timezone),
    ])
        .then(([totalNumberOfOrdersData, totalSalesOportunityAIConvData]) => {
            return {
                isFetching: false,
                isError: false,
                data: {
                    value: safeDivide(
                        totalNumberOfOrdersData.data?.value,
                        totalSalesOportunityAIConvData.data?.value,
                    ),
                    prevValue: safeDivide(
                        totalNumberOfOrdersData.data?.prevValue,
                        totalSalesOportunityAIConvData.data?.prevValue,
                    ),
                },
            }
        })
        .catch(() => ({ isFetching: false, isError: true, data: undefined }))
}

export { useConversionRate, fetchConversionRate }
